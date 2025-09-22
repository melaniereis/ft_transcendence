import type { WebSocket as WsWebSocket } from 'ws';

export interface AliveWebSocket extends WsWebSocket {
	isAlive?: boolean;
	playerId?: number;
	username?: string;
	difficulty?: string;
	gameId?: string;
	confirmed?: boolean;
	selectedMaxGames?: number;
	token?: string;
	side?: 'left' | 'right'; // Track which side this player controls
}

export interface GameRoom {
	left: AliveWebSocket | null;
	right: AliveWebSocket | null;

	// Ball state - enhanced for advanced physics
	ballX: number;
	ballY: number;
	ballVX: number; // Legacy velocity for backward compatibility 
	ballVY: number; // Legacy velocity for backward compatibility
	ballDX: number; // Normalized direction (-1 to 1)
	ballDY: number; // Normalized direction (-1 to 1)
	ballSpeed: number; // Speed multiplier
	ballInitialSpeed: number; // Initial speed for resets

	// Paddle positions
	leftY: number;
	rightY: number;
	paddleHeight: number;
	paddleWidth: number;

	// Paddle movement states
	leftMovingUp: boolean;
	leftMovingDown: boolean;
	rightMovingUp: boolean;
	rightMovingDown: boolean;

	// Game state
	leftScore: number;
	rightScore: number;
	maxScore: number;

	intervalId?: ReturnType<typeof setInterval>;
	lastUpdateTime?: number; // For delta time calculations
}

export type PlayerData = {
	id: number;
	username: string;
	difficulty?: string;
	connection: AliveWebSocket;
};

export type WaitingRoom = {
	player1: PlayerData | null;
	player2: PlayerData | null;
	maxGames: number | null;
	confirmations: Set<number>;
};
