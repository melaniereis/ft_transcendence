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