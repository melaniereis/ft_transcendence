import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RawData } from 'ws';
import { AliveWebSocket, GameRoom } from '../types/gameRoom';
import { startGameLoop } from '../services/remoteGameService.js';

const gameRooms = new Map<string, GameRoom>();

export async function gameSocketRoutes(fastify: FastifyInstance) {
	fastify.get('/game/:gameId', { websocket: true }, (ws: AliveWebSocket, req: FastifyRequest) => {
		const { gameId } = req.params as { gameId: string };
		ws.gameId = gameId;
		ws.isAlive = true;

		ws.on('pong', () => ws.isAlive = true);
		ws.on('error', (err) => console.error(`❌ WebSocket error on game ${gameId}:`, err.message));
		ws.on('close', () => handleClose(ws, gameId));
		ws.on('message', (message) => handleMessage(ws, gameId, message));
	});

	fastify.addHook('onClose', () => {
		gameRooms.forEach(room => {
			if (room.intervalId) clearInterval(room.intervalId);
		});
		gameRooms.clear();
		console.log('🛑 Cleared all game rooms on server shutdown.');
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
			default:
				ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
		}
	} 
	catch (err) {
		console.error('❌ Error parsing message:', err);
		ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
	}
}


function handleJoin(ws: AliveWebSocket, gameId: string, data: any) {
	ws.username = data.playerName;
	let room = gameRooms.get(gameId);

	if (!room) {
		room = createNewRoom(ws, data.maxScore);
		ws.side = 'left';
		gameRooms.set(gameId, room);
	} 
	else if (!room.right) {
		room.right = ws;
		ws.side = 'right';

		sendToBoth(room, {
			type: 'scoreUpdate',
			leftScore: room.leftScore,
			rightScore: room.rightScore,
			leftPlayerName: room.left?.username,
			rightPlayerName: room.right?.username,
		});

		sendToBoth(room, { type: 'startCountdown' });

		setTimeout(() => {
			if (gameRooms.get(gameId)) {
				startGameLoop(room!);
			}
		}, 3500);
	} 
	else {
		ws.send(JSON.stringify({ type: 'error', message: 'Room full' }));
		ws.close();
		return;
	}

	ws.send(JSON.stringify({ type: 'assignSide', side: ws.side }));
	console.log(`✅ Player ${ws.username} joined game ${gameId} as ${ws.side}`);
}


function handleMove(ws: AliveWebSocket, gameId: string, data: any) {
	const room = gameRooms.get(gameId);
	if (!room) 
		return;

	const { action, direction } = data;
	const isStart = action === 'start';
	const isEnd = action === 'end';

	if (ws.side === 'left') {
		if (direction === 'ArrowUp') 
			room.leftMovingUp = isStart;
		if (direction === 'ArrowDown') 
			room.leftMovingDown = isStart;
	} 
	else if (ws.side === 'right') {
		if (direction === 'ArrowUp') 
			room.rightMovingUp = isStart;
		if (direction === 'ArrowDown') 
			room.rightMovingDown = isStart;
	}
}

function handleEnd(ws: AliveWebSocket, gameId: string, data: any) {
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
}

function handleClose(ws: AliveWebSocket, gameId: string) {
	const room = gameRooms.get(gameId);
	if (!room) 
		return;

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

function createNewRoom(ws: AliveWebSocket, maxScore: number = 5): GameRoom {
	return {
		left: ws,
		right: null,
		ballX: 400,
		ballY: 200,
		ballVX: 7,
		ballVY: 5,
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
		maxScore,
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
