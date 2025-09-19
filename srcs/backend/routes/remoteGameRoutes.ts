// remoteGameRoutes.ts - Add connection tracking and cleanup
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData } from 'ws';
import { AliveWebSocket, GameRoom } from '../types/webSocket.js';
import { startGameLoop } from '../services/remoteGameService.js';

const gameRooms = new Map<string, GameRoom>();

export async function gameSocketRoutes(fastify: FastifyInstance) {
	fastify.get('/game/:gameId', { websocket: true }, (ws: AliveWebSocket, req: FastifyRequest) => {
		const gameId = (req.params as { gameId: string }).gameId;
		ws.gameId = gameId;
		ws.isAlive = true;

		ws.on('pong', () => (ws.isAlive = true));
		ws.on('error', (err) => console.error(`WebSocket error on game ${gameId}:`, err.message));
		ws.on('close', () => handleClose(ws, gameId));
		ws.on('message', (message) => handleMessage(ws, gameId, message));
	});

	fastify.addHook('onClose', () => {
		gameRooms.forEach((room) => {
			if (room.intervalId) {
				clearInterval(room.intervalId);
			}
		});
		gameRooms.clear();
		console.log('Cleared all game rooms on server shutdown.');
	});
}

function handleMessage(ws: AliveWebSocket, gameId: string, message: RawData) {
	try {
		const data = JSON.parse(message.toString());
		switch (data.type) {
			case 'join':
				handleJoin(ws, gameId, data);
				break;
			case 'move':
				handleMove(ws, gameId, data);
				break;
			case 'end':
				handleEnd(ws, gameId, data);
				break;
			case 'inviteNext':
				handleInviteNext(ws, gameId);
				break;
			case 'acceptNext':
				handleAcceptNext(ws, gameId);
				break;
			case 'declineNext':
				handleDeclineNext(ws, gameId);
				break;
			default:
				ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
		}
	} catch (err) {
		console.error('Error parsing message:', err);
		ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
	}
}

function handleJoin(ws: AliveWebSocket, gameId: string, data: any) {
	ws.username = data.playerName;

	ws.send(JSON.stringify({
		type: 'join',
		playerName: data.playerName,
		maxScore: data.maxScore || 5
	}));

	let room = gameRooms.get(gameId);
	if (!room) {
		room = createNewRoom(ws, data.maxScore);
		ws.side = 'left';
		gameRooms.set(gameId, room);
	} else if (!room.right) {
		room.right = ws;
		ws.side = 'right';

		sendToBoth(room, {
			type: 'scoreUpdate',
			leftScore: room.leftScore,
			rightScore: room.rightScore,
			leftPlayerName: room.left?.username,
			rightPlayerName: room.right?.username
		});

		sendToBoth(room, { type: 'startCountdown' });

		setTimeout(() => {
			if (gameRooms.get(gameId)) {
				startGameLoop(room!);
			}
		}, 3500);
	} else {
		ws.send(JSON.stringify({ type: 'error', message: 'Room full' }));
		ws.close();
		return;
	}

	ws.send(JSON.stringify({ type: 'assignSide', side: ws.side }));
	console.log(`Player ${ws.username} joined game ${gameId} as ${ws.side}`);
}

function handleMove(ws: AliveWebSocket, gameId: string, data: any) {
	const room = gameRooms.get(gameId);
	if (!room) return;

	const { action, direction } = data;
	const isStart = action === 'start';

	if (ws.side === 'left') {
		if (direction === 'ArrowUp') {
			room.leftMovingUp = isStart;
		}
		if (direction === 'ArrowDown') {
			room.leftMovingDown = isStart;
		}
	} else if (ws.side === 'right') {
		if (direction === 'ArrowUp') {
			room.rightMovingUp = isStart;
		}
		if (direction === 'ArrowDown') {
			room.rightMovingDown = isStart;
		}
	}
}

function handleEnd(ws: AliveWebSocket, gameId: string, data: any) {
	const room = gameRooms.get(gameId);
	if (!room) return;

	const opponent = ws.side === 'left' ? room.right : room.left;
	if (opponent && opponent.readyState === opponent.OPEN) {
		opponent.send(JSON.stringify({ type: 'end', message: data.message }));
	}

	if (room.intervalId) {
		clearInterval(room.intervalId);
		room.intervalId = undefined;
	}
	console.log(`Game ${gameId} ended`);
}

function handleInviteNext(ws: AliveWebSocket, gameId: string) {
	const room = gameRooms.get(gameId);
	if (!room) {
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Game room not found'
		}));
		return;
	}

	const opponent = ws.side === 'left' ? room.right : room.left;

	if (!opponent || opponent.readyState !== opponent.OPEN) {
		ws.send(JSON.stringify({
			type: 'opponentLeft',
			message: 'Your opponent has left the game'
		}));
		return;
	}

	opponent.send(JSON.stringify({
		type: 'nextGameInvite',
		from: ws.username
	}));

	ws.send(JSON.stringify({
		type: 'waitingForResponse',
		message: 'Waiting for opponent to accept...'
	}));
}


function handleAcceptNext(ws: AliveWebSocket, gameId: string) {
	const room = gameRooms.get(gameId);
	if (!room) {
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Game room not found'
		}));
		return;
	}

	const opponent = ws.side === 'left' ? room.right : room.left;


	if (!opponent || opponent.readyState !== opponent.OPEN) {
		ws.send(JSON.stringify({
			type: 'opponentLeft',
			message: 'Your opponent has left the game'
		}));
		return;
	}

	room.leftScore = 0;
	room.rightScore = 0;
	room.ballX = 1280 / 2;
	room.ballY = 680 / 2;
	room.ballVX = 7 * (Math.random() > 0.5 ? 1 : -1);
	room.ballVY = 5 * (Math.random() > 0.5 ? 1 : -1);

	room.leftY = 680 / 2 - 50;
	room.rightY = 680 / 2 - 50;

	room.leftMovingUp = false;
	room.leftMovingDown = false;
	room.rightMovingUp = false;
	room.rightMovingDown = false;

	sendToBoth(room, {
		type: 'nextGameStarted',
		message: 'New game started!',
		leftScore: 0,
		rightScore: 0
	});

	sendToBoth(room, { type: 'startCountdown' });
		setTimeout(() => {
			if (gameRooms.get(gameId)) {
				startGameLoop(room!);
			}
		}, 3500);
}

function handleDeclineNext(ws: AliveWebSocket, gameId: string) {
	const room = gameRooms.get(gameId);
	if (!room) return;

	const opponent = ws.side === 'left' ? room.right : room.left;
	if (opponent && opponent.readyState === opponent.OPEN) {
		opponent.send(JSON.stringify({
			type: 'nextGameDeclined',
			message: 'Opponent declined to play again'
		}));
	}
}

// FIXED: Handle close with proper cleanup and notification
function handleClose(ws: AliveWebSocket, gameId: string) {
	const room = gameRooms.get(gameId);
	if (!room) return;

	console.log(`Player ${ws.username} disconnected from game ${gameId}`);

	// Notify remaining player if any
	const opponent = ws.side === 'left' ? room.right : room.left;
	if (opponent && opponent.readyState === opponent.OPEN) {
		opponent.send(JSON.stringify({
			type: 'opponentLeft',
			message: 'Your opponent has left the game'
		}));
	}

	// Clean up room immediately when someone leaves
	if (room.intervalId) {
		clearInterval(room.intervalId);
	}
	gameRooms.delete(gameId);
	console.log(`Cleaned up game room ${gameId} due to player disconnect`);
}

function createNewRoom(ws: AliveWebSocket, maxScore: number = 5): GameRoom {
	const canvasWidth = 1280;
	const canvasHeight = 680;
	const paddleHeight = 100;
	const paddleWidth = 12;

	return {
		left: ws,
		right: null,
		ballX: canvasWidth / 2,
		ballY: canvasHeight / 2,
		ballVX: 7,
		ballVY: 5,
		leftY: canvasHeight / 2 - paddleHeight / 2,
		rightY: canvasHeight / 2 - paddleHeight / 2,
		paddleHeight,
		paddleWidth,
		leftMovingUp: false,
		leftMovingDown: false,
		rightMovingUp: false,
		rightMovingDown: false,
		leftScore: 0,
		rightScore: 0,
		maxScore,
		intervalId: undefined,
	};
}

function sendToBoth(room: GameRoom, message: object) {
	const msg = JSON.stringify(message);
	[room.left, room.right].forEach((player) => {
		if (player && player.readyState === player.OPEN) {
			player.send(msg);
		}
	});
}
