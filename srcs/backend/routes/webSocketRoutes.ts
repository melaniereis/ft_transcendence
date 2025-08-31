import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData, WebSocket as WsWebSocket } from 'ws';
import type { AliveWebSocket, PlayerData, WaitingRoom } from '../types/webSocket.js'

const waitingRoom: WaitingRoom = {
	player1: null,
	player2: null,
	maxGames: null,
	confirmations: new Set(),
};

export async function websocketMatchmakingRoutes(fastify: FastifyInstance) {
	// Heartbeat interval
	const heartbeatInterval = setInterval(() => {
		[waitingRoom.player1, waitingRoom.player2].forEach((player) => {
		if (!player) 
			return;
		const ws = player.connection;
		if (!ws.isAlive) {
			console.log('💀 Terminating dead matchmaking connection');
			ws.terminate();
			return;
		}
		ws.isAlive = false;
		ws.ping();
		});
	}, 30000);

	fastify.addHook('onClose', () => {
		clearInterval(heartbeatInterval);
	});

	fastify.get('/matchmaking', { websocket: true }, (ws: AliveWebSocket, req: FastifyRequest) => {
		ws.isAlive = true;
		ws.confirmed = false;

		ws.on('pong', () => {
			ws.isAlive = true;
		});

		ws.on('error', (err: Error) => {
			console.error('❌ WebSocket error (matchmaking):', err.message);
		});

		ws.on('close', () => {
			if (waitingRoom.player1?.connection === ws) {
				waitingRoom.player1 = null;
				waitingRoom.confirmations.clear();
				waitingRoom.maxGames = null;
				console.log('❌ Player 1 left matchmaking');
			} 
			else if (waitingRoom.player2?.connection === ws) {
				waitingRoom.player2 = null;
				waitingRoom.confirmations.clear();
				waitingRoom.maxGames = null;
				console.log('❌ Player 2 left matchmaking');
			}
		});

		ws.on('message', async (message: RawData) => {
			try {
				const data = JSON.parse(message.toString());

				if (data.type === 'join') {
					const { id, username, difficulty } = data;
					if (typeof id !== 'number' || typeof username !== 'string') {
						ws.send(JSON.stringify({ type: 'error', message: 'Invalid player data' }));
						return;
					}
					ws.playerId = id;
					ws.username = username;
					ws.difficulty = difficulty;

					if (!waitingRoom.player1) {
						waitingRoom.player1 = { id, username, difficulty, connection: ws };
						ws.send(JSON.stringify({ type: 'chooseMaxGames' }));
						console.log(`🧍 Player 1 joined matchmaking: ${username}`);
					} 
					else if (!waitingRoom.player2) {
						waitingRoom.player2 = { id, username, difficulty, connection: ws };
						// Notify both players of opponent and chosen maxGames if already set
						if (waitingRoom.maxGames)
							sendReadyToBoth();
						console.log(`🧍 Player 2 joined matchmaking: ${username}`);
					} 
					else {
						ws.send(JSON.stringify({ type: 'error', message: 'Matchmaking full' }));
						ws.close();
						return;
					}
				}

				else if (data.type === 'selectMaxGames') {
					if (waitingRoom.player1?.connection !== ws) {
						ws.send(JSON.stringify({ type: 'error', message: 'Only first player can select max games' }));
						return;
					}
					const maxGames = data.maxGames;
					if (![3, 5, 7, 9, 11].includes(maxGames)) {
						ws.send(JSON.stringify({ type: 'error', message: 'Invalid max games number, must be odd and between 3 and 11' }));
						return;
					}
					waitingRoom.maxGames = maxGames;
					// Notify player 2 if connected
					if (waitingRoom.player2) {
						sendReadyToBoth();
					}
					console.log(`🧮 Player 1 selected maxGames: ${maxGames}`);
				}

				else if (data.type === 'confirmReady') {
					if (!waitingRoom.player1 || !waitingRoom.player2 || !waitingRoom.maxGames) {
						ws.send(JSON.stringify({ type: 'error', message: 'Waiting for matchmaking to be ready' }));
						return;
					}
					if (ws.playerId === waitingRoom.player1.id || ws.playerId === waitingRoom.player2.id) {
						ws.confirmed = true;
						waitingRoom.confirmations.add(ws.playerId!);
						console.log(`✅ Player ${ws.username} confirmed ready`);

						if (waitingRoom.confirmations.size === 2) {
						// Both confirmed, create game and send start signal
						const p1 = waitingRoom.player1;
						const p2 = waitingRoom.player2;
						const maxGames = waitingRoom.maxGames;

						// Create game via HTTP call
						const response = await fastify.inject({
							method: 'POST',
							url: '/games',
							payload: {
							player1_id: p1.id,
							player2_id: p2.id,
							max_games: maxGames,
							time_started: new Date().toISOString(),
							},
						});

						if (response.statusCode !== 200 && response.statusCode !== 201) {
							const errMsg = JSON.stringify({ type: 'error', message: 'Game creation failed' });
							p1.connection.send(errMsg);
							p2.connection.send(errMsg);
							return;
						}

						let gameData;
						try {
							gameData = JSON.parse(response.body);
						} 
						catch {
							const errMsg = JSON.stringify({ type: 'error', message: 'Game creation failed' });
							p1.connection.send(errMsg);
							p2.connection.send(errMsg);
							return;
						}

						if (!gameData?.game_id) {
							const errMsg = JSON.stringify({ type: 'error', message: 'Game creation failed' });
							p1.connection.send(errMsg);
							p2.connection.send(errMsg);
							return;
						}

						// Notify players to start game
						p1.connection.send(JSON.stringify({
							type: 'start',
							opponent: p2.username,
							game_id: gameData.game_id,
							maxGames,
						}));

						p2.connection.send(JSON.stringify({
							type: 'start',
							opponent: p1.username,
							game_id: gameData.game_id,
							maxGames,
						}));

						console.log(`✅ Match started: ${p1.username} vs ${p2.username} (game_id=${gameData.game_id}, maxGames=${maxGames})`);

						// Clear matchmaking room for next players
						waitingRoom.player1 = null;
						waitingRoom.player2 = null;
						waitingRoom.maxGames = null;
						waitingRoom.confirmations.clear();
						}
					}
				}
			} 
			catch (err) {
				console.error('❌ Error handling matchmaking message:', err);
				ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
			}
		});
	});

	function sendReadyToBoth() {
		if (!waitingRoom.player1 || !waitingRoom.player2 || !waitingRoom.maxGames) 
			return;
		const msg = JSON.stringify({
			type: 'ready',
			opponent: waitingRoom.player2.username,
			maxGames: waitingRoom.maxGames,
		});
		waitingRoom.player1.connection.send(msg);
		waitingRoom.player2.connection.send(JSON.stringify({
			type: 'ready',
			opponent: waitingRoom.player1.username,
			maxGames: waitingRoom.maxGames,
		}));
	}
}