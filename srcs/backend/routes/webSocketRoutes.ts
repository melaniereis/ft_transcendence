import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData } from 'ws';
import type { AliveWebSocket, WaitingRoom } from '../types/webSocket.js';

const waitingRoom: WaitingRoom = {
	player1: null,
	player2: null,
	maxGames: null,
	confirmations: new Set(),
};

export async function websocketMatchmakingRoutes(fastify: FastifyInstance) {
	const heartbeatInterval = setInterval(runHeartbeat,  600000);
	fastify.addHook('onClose', () => clearInterval(heartbeatInterval));

	fastify.get('/matchmaking', { websocket: true }, (ws: AliveWebSocket, req: FastifyRequest) => {
		const url = new URL(req.raw.url ?? '', `http://${req.headers.host}`);
		const token = url.searchParams.get('token');

		if (!token) {
			ws.close(4001, 'Invalid or missing token');
			return;
		}

		ws.token = token;
		initializeConnection(ws);

		ws.on('message', async (message: RawData) => {
			try {
				const data = JSON.parse(message.toString());
				await handleMessage(ws, data, fastify);
			}
			catch (err) {
				console.error('❌ Error handling matchmaking message:', err);
				ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
			}
		});
	});
}

function runHeartbeat() {
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
}

function initializeConnection(ws: AliveWebSocket) {
	ws.isAlive = true;
	ws.confirmed = false;

	ws.on('pong', () => (ws.isAlive = true));
	ws.on('error', (err) => console.error('❌ WebSocket error (matchmaking):', err.message));
	ws.on('close', () => handleDisconnect(ws));
}

function handleDisconnect(ws: AliveWebSocket) {
	if (waitingRoom.player1?.connection === ws)
		waitingRoom.player1 = null;
	else if (waitingRoom.player2?.connection === ws)
		waitingRoom.player2 = null;

	waitingRoom.confirmations.clear();
	waitingRoom.maxGames = null;
	console.log('❌ A player left matchmaking');
}

async function handleMessage(ws: AliveWebSocket, data: any, fastify: FastifyInstance) {
	switch (data.type) {
		case 'join':
			handleJoin(ws, data);
			break;
		case 'selectMaxGames':
			handleGameSelection(ws, data);
			break;
		case 'confirmReady':
			await handleConfirmReady(ws, fastify);
			break;
		default:
			ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
	}
}

function handleJoin(ws: AliveWebSocket, data: any) {
	const { id, username, difficulty } = data;

	console.log('[handleJoin] Received data:');
	console.log('  id:', id);
	console.log('  username:', username);
	console.log('  difficulty:', difficulty);
	console.log('  token (from query):', ws.token);

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

		if (waitingRoom.maxGames)
			sendReadyToBoth();
		else
			ws.send(JSON.stringify({ type: 'waitingForGameSelection' }));

		console.log(`🧍 Player 2 joined matchmaking: ${username}`);
	}
}

function handleGameSelection(ws: AliveWebSocket, data: any) {
	if (waitingRoom.player1?.connection !== ws) {
		ws.send(JSON.stringify({ type: 'error', message: 'Only first player can select max games' }));
		return;
	}
	const maxGames = data.maxGames;
	if (![3, 5, 7, 9, 11].includes(maxGames)) {
		ws.send(JSON.stringify({ type: 'error', message: 'Invalid max games number' }));
		return;
	}
	waitingRoom.maxGames = maxGames;

	if (waitingRoom.player2)
		sendReadyToBoth();
	else
		ws.send(JSON.stringify({ type: 'waitingForOpponent' }));

	console.log(`🧮 Player 1 selected maxGames: ${maxGames}`);
}

async function handleConfirmReady(ws: AliveWebSocket, fastify: FastifyInstance) {
	if (!waitingRoom.player1 || !waitingRoom.player2 || !waitingRoom.maxGames) {
		ws.send(JSON.stringify({ type: 'error', message: 'Waiting for matchmaking to be ready' }));
		return;
	}
	waitingRoom.confirmations.add(ws.playerId!);
	console.log(`✅ Player ${ws.username} confirmed ready`);

	if (waitingRoom.confirmations.size === 2)
		await startGame(fastify);
}

async function startGame(fastify: FastifyInstance) {
	const p1 = waitingRoom.player1!;
	const p2 = waitingRoom.player2!;
	const maxGames = waitingRoom.maxGames!;

	const response = await fastify.inject({
		method: 'POST',
		url: '/games',
		headers: {
			Authorization: `Bearer ${p1.connection.token}`
		},
		payload: {
			player1_id: p1.id,
			player2_id: p2.id,
			max_games: maxGames,
			time_started: new Date().toISOString(),
		},
	});

	let gameData;
	try {
		gameData = JSON.parse(response.body);
	}
	catch {
		sendErrorToBoth('Game creation failed');
		return;
	}

	if (!gameData?.game_id) {
		sendErrorToBoth('Game creation failed');
		return;
	}

	(p1.connection as any).send(JSON.stringify({
		type: 'start',
		opponent: p2.username,
		opponent_id: p2.id,
		game_id: gameData.game_id,
		maxGames,
	}));

	(p2.connection as any).send(JSON.stringify({
		type: 'start',
		opponent: p1.username,
		opponent_id: p1.id,
		game_id: gameData.game_id,
		maxGames,
	}));

	console.log(`✅ Match started: ${p1.username} vs ${p2.username} (game_id=${gameData.game_id})`);

	waitingRoom.player1 = null;
	waitingRoom.player2 = null;
	waitingRoom.maxGames = null;
	waitingRoom.confirmations.clear();
}

function sendReadyToBoth() {
	const p1 = waitingRoom.player1!;
	const p2 = waitingRoom.player2!;
	const maxGames = waitingRoom.maxGames!;

	(p1.connection as any).send(JSON.stringify({
		type: 'ready',
		opponent: p2.username,
		maxGames,
	}));
	(p2.connection as any).send(JSON.stringify({
		type: 'ready',
		opponent: p1.username,
		maxGames,
	}));
}

function sendErrorToBoth(message: string) {
	waitingRoom.player1?.connection && (waitingRoom.player1.connection as any).send(JSON.stringify({ type: 'error', message }));
	waitingRoom.player2?.connection && (waitingRoom.player2.connection as any).send(JSON.stringify({ type: 'error', message }));
}
