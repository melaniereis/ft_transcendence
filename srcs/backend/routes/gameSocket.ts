import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData, WebSocket as WsWebSocket } from 'ws';

interface AliveWebSocket extends WsWebSocket {
isAlive?: boolean;
username?: string;
side?: 'left' | 'right';
gameId?: string;
}

type GameRoom = {
left: AliveWebSocket | null;
right: AliveWebSocket | null;
ballX: number;
ballY: number;
ballVX: number;
ballVY: number;
intervalId?: NodeJS.Timeout;
leftY: number;
rightY: number;
paddleHeight: number;
paddleWidth: number;
leftMovingUp: boolean;
leftMovingDown: boolean;
rightMovingUp: boolean;
rightMovingDown: boolean;
};

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
		if (room.left === ws) room.left = null;
		if (room.right === ws) room.right = null;
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
			};
			ws.side = 'left';
			gameRooms.set(gameId, room);

			room.intervalId = setInterval(() => {
				const r = gameRooms.get(gameId);
				if (!r) return;

				// Ball movement
				r.ballX += r.ballVX;
				r.ballY += r.ballVY;

				// Bounce off top/bottom
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

				// Scoring logic: ball goes off-screen
				if (r.ballX < 0 || r.ballX > 800) {
				const winner = r.ballX < 0 ? r.right : r.left;
				const loser = r.ballX < 0 ? r.left : r.right;
				const winnerName = winner?.username || 'Winner';

				[r.left, r.right].forEach((player) => {
					if (player && player.readyState === player.OPEN) {
					player.send(JSON.stringify({
						type: 'end',
						message: `${winnerName} wins!`,
					}));
					}
				});

				if (r.intervalId) clearInterval(r.intervalId);
				gameRooms.delete(gameId);
				return;
				}

				// Paddle movement
				const speed = 5;
				if (r.leftMovingUp) r.leftY = Math.max(r.leftY - speed, 0);
				if (r.leftMovingDown) r.leftY = Math.min(r.leftY + speed, 400 - r.paddleHeight);
				if (r.rightMovingUp) r.rightY = Math.max(r.rightY - speed, 0);
				if (r.rightMovingDown) r.rightY = Math.min(r.rightY + speed, 400 - r.paddleHeight);

				[r.left, r.right].forEach((player) => {
				if (player && player.readyState === player.OPEN) {
					player.send(JSON.stringify({
					type: 'update',
					ball: { x: r.ballX, y: r.ballY },
					paddles: { leftY: r.leftY, rightY: r.rightY },
					}));
				}
				});
			}, 1000 / 60);
			} else if (!room.right) {
			room.right = ws;
			ws.side = 'right';
			} else {
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
			if (!room) return;

			const { action, direction } = data;
			if (ws.side === 'left') {
			room.leftMovingUp = action === 'start' && direction === 'ArrowUp';
			room.leftMovingDown = action === 'start' && direction === 'ArrowDown'
				? true
				: action === 'end' && direction === 'ArrowDown' ? false : room.leftMovingDown;
			if (action === 'end' && direction === 'ArrowUp') room.leftMovingUp = false;
			} else if (ws.side === 'right') {
			room.rightMovingUp = action === 'start' && direction === 'ArrowUp';
			room.rightMovingDown = action === 'start' && direction === 'ArrowDown'
				? true
				: action === 'end' && direction === 'ArrowDown' ? false : room.rightMovingDown;
			if (action === 'end' && direction === 'ArrowUp') room.rightMovingUp = false;
			}
			break;
		}

		case 'end': {
			const room = gameRooms.get(gameId);
			if (!room) return;
			const opponent = ws.side === 'left' ? room.right : room.left;
			if (opponent && opponent.readyState === opponent.OPEN) {
			opponent.send(JSON.stringify({ type: 'end', message: data.message }));
			}
			ws.close();
			opponent?.close();
			if (room.intervalId) clearInterval(room.intervalId);
			gameRooms.delete(gameId);
			console.log(`🏁 Game ${gameId} ended`);
			break;
		}

		default:
			ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
		}
	} catch (err) {
		console.error('❌ Error parsing message:', err);
		ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
	}
	});
});

fastify.addHook('onClose', () => {
	gameRooms.forEach((room) => {
	if (room.intervalId) clearInterval(room.intervalId);
	});
	gameRooms.clear();
	console.log('🛑 Cleared all game rooms on server shutdown.');
});
}
