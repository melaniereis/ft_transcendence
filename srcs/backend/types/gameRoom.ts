import type { RawData, WebSocket as WsWebSocket } from 'ws';

export interface AliveWebSocket extends WsWebSocket {
	isAlive?: boolean;
	username?: string;
	side?: 'left' | 'right';
	gameId?: string;
}

export type GameRoom = {
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
	leftScore: number;
	rightScore: number;
	maxScore: number;
};