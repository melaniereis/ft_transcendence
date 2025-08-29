import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData, WebSocket as WsWebSocket } from 'ws';
import { AliveWebSocket, GameRoom } from '../types/gameRoom';

const gameRooms = new Map<string, GameRoom>();

export async function gameSocketRoutes(fastify: FastifyInstance) {
fastify.get('/game/:gameId', { websocket: true }, (ws: AliveWebSocket, req: FastifyRequest) => {
	const { gameId } = req.params as { gameId: string };
	ws.gameId = gameId;
	ws.isAlive = true;

	ws.on('pong', () => {
		ws.isAlive = true; 
	});

	ws.on('error', (err: Error) => {
		console.error(`❌ WebSocket error on game ${gameId}:`, err.message);
	});

	ws.on('close', () => {
		const room = gameRooms.get(gameId);
		if (room) {
			if (room.left === ws) 
				room.left = null;
			if (room.right === ws) 
				room.right = null;
			if (!room.left && !room.right) {
				if (room.intervalId) clearInterval(room.intervalId);
					gameRooms.delete(gameId);
			console.log(`🧹 Cleaned up game room ${gameId}`);
			}
		}
	});

	ws.on('message', (message: RawData) => {
	try {
		const data = JSON.parse(message.toString());
		switch (data.type) {
		case 'join': {
			ws.username = data.playerName;
			let room = gameRooms.get(gameId);

			if (!room) {
			// First player joins as left
			room = {
				left: ws,
				right: null,
				ballX: 400,
				ballY: 200,
				ballVX: 5,
				ballVY: 3,
				leftY: 160,
				rightY: 160,
				paddleHeight: 80,
				paddleWidth: 10,
				leftMovingUp: false,
				leftMovingDown: false,
				rightMovingUp: false,
				rightMovingDown: false,
				leftScore: 0,
				rightScore: 0,
				maxScore: data.maxScore || 5,
			};
			ws.side = 'left';
			gameRooms.set(gameId, room);

			// Start game loop
			room.intervalId = setInterval(() => {
				const r = gameRooms.get(gameId);
				if (!r) 
					return;

				// Move ball
				r.ballX += r.ballVX;
				r.ballY += r.ballVY;

				// Bounce off top/bottom walls
				if (r.ballY <= 10 || r.ballY >= 390) {
				r.ballVY = -r.ballVY;
				}

				// Paddle collisions
				if (r.ballX <= 30 && r.ballY >= r.leftY && r.ballY <= r.leftY + r.paddleHeight) {
					r.ballVX = -r.ballVX;
					r.ballX = 30;
				}
				if (r.ballX >= 770 && r.ballY >= r.rightY && r.ballY <= r.rightY + r.paddleHeight) {
				r.ballVX = -r.ballVX;
				r.ballX = 770;
				}

				// Scoring
				if (r.ballX < 0 || r.ballX > 800) {
					if (r.ballX < 0) 
						r.rightScore++;
					else 
						r.leftScore++;
		
				if (r.leftScore + r.rightScore >= r.maxScore) {
					const winnerName = r.leftScore > r.rightScore ? r.left?.username : r.right?.username;

					[r.left, r.right].forEach((player) => {
					if (player && player.readyState === player.OPEN) {
						player.send(JSON.stringify({
						type: 'end',
						message: `${winnerName} wins!`,
						leftScore: r.leftScore,
						rightScore: r.rightScore,
						leftPlayerName: r.left?.username,
						rightPlayerName: r.right?.username,
						}));
					}
					});

					if (r.intervalId) 
						clearInterval(r.intervalId);
					gameRooms.delete(gameId);
					return;
				} 
				else {
					// Reset ball for next round
					r.ballX = 400;
					r.ballY = 200;
					r.ballVX = r.ballVX > 0 ? 5 : -5;
					r.ballVY = 3;

					// Notify score update
					[r.left, r.right].forEach((player) => {
					if (player && player.readyState === player.OPEN) {
						player.send(JSON.stringify({
						type: 'scoreUpdate',
						leftScore: r.leftScore,
						rightScore: r.rightScore,
						message: `Score update: ${r.leftScore} - ${r.rightScore}`,
						}));
					}
					});
				}
				}

				// Paddle movement
				const speed = 5;
				if (r.leftMovingUp) r.leftY = Math.max(r.leftY - speed, 0);
				if (r.leftMovingDown) r.leftY = Math.min(r.leftY + speed, 400 - r.paddleHeight);
				if (r.rightMovingUp) r.rightY = Math.max(r.rightY - speed, 0);
				if (r.rightMovingDown) r.rightY = Math.min(r.rightY + speed, 400 - r.paddleHeight);

				// Send updates
				[r.left, r.right].forEach((player) => {
				if (player && player.readyState === player.OPEN) {
					player.send(JSON.stringify({
					type: 'update',
					ball: { x: r.ballX, y: r.ballY },
					paddles: { leftY: r.leftY, rightY: r.rightY },
					leftScore: r.leftScore,
					rightScore: r.rightScore,
					}));
				}
				});
			}, 1000 / 60);
			} 
			else if (!room.right) {
			// Second player joins as right
				room.right = ws;
				ws.side = 'right';
			} 
			else {
				ws.send(JSON.stringify({ type: 'error', message: 'Room full' }));
				ws.close();
				return;
			}

			ws.send(JSON.stringify({ type: 'assignSide', side: ws.side }));
			console.log(`✅ Player ${ws.username} joined game ${gameId} as ${ws.side}`);
			break;
		}

		case 'move': {
			const room = gameRooms.get(gameId);
			if (!room) 
				return;

			const { action, direction } = data;

			if (ws.side === 'left') {
				if (action === 'start') {
					if (direction === 'ArrowUp') 
						room.leftMovingUp = true;
					if (direction === 'ArrowDown') 
						room.leftMovingDown = true;
				} 
				else if (action === 'end') {
					if (direction === 'ArrowUp') 
						room.leftMovingUp = false;
					if (direction === 'ArrowDown') 
						room.leftMovingDown = false;
				}
			} 
			else if (ws.side === 'right') {
				if (action === 'start') {
					if (direction === 'ArrowUp') 
						room.rightMovingUp = true;
					if (direction === 'ArrowDown') 
						room.rightMovingDown = true;
				} 
				else if (action === 'end') {
					if (direction === 'ArrowUp') 
						room.rightMovingUp = false;
					if (direction === 'ArrowDown') 
						room.rightMovingDown = false;
				}
			}
			break;
		}

		case 'end': {
			const room = gameRooms.get(gameId);
			if (!room) 
				return;
			const opponent = ws.side === 'left' ? room.right : room.left;
			if (opponent && opponent.readyState === opponent.OPEN)
				opponent.send(JSON.stringify({ type: 'end', message: data.message }));
			ws.close();
			opponent?.close();
			if (room.intervalId) 
				clearInterval(room.intervalId);
			gameRooms.delete(gameId);
			console.log(`🏁 Game ${gameId} ended`);
			break;
		}

		default:
			ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
		}
	} 
	catch (err) {
		console.error('❌ Error parsing message:', err);
		ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
	}
	});
});

	fastify.addHook('onClose', () => {
		gameRooms.forEach((room) => {
		if (room.intervalId) 
			clearInterval(room.intervalId);
		});
		gameRooms.clear();
		console.log('🛑 Cleared all game rooms on server shutdown.');
	});
}