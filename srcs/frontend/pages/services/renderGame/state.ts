//renderGame/state.ts

import type { Paddle, Ball } from './types.js';

/**
 * Optimized GRIS-inspired game state
 * - Lightweight state management
 * - Proper type definitions
 * - Clean architecture
 */

export type GameMode = 'single' | 'tournament' | 'quick';

export interface Atmosphere {
	mistLevel?: number;
	gradient?: string;
	glow?: boolean;
	soundscape?: string;
}

export interface GameState {
	// Players
	player1: Paddle | null;
	player2: Paddle | null;
	avatar1?: string;
	avatar2?: string;

	// Game state
	score1: number;
	score2: number;
	round: number;
	maxRounds: number;
	mode: GameMode;
	ball: Ball | null;

	// UI state
	isPaused: boolean;
	isGameOver: boolean;
	showModals: boolean;

	// Animation flags
	animationFlags: {
		headerFadeIn: boolean;
		canvasEntry: boolean;
		scoreUpdate: boolean;
	};

	// References
	container?: HTMLElement;
	gameId?: number;
	atmosphere?: Atmosphere;

	// Methods
	updateScore: (player1Score: number, player2Score: number) => void;
}

export const state: GameState = {
	player1: null,
	player2: null,
	avatar1: undefined,
	avatar2: undefined,
	score1: 0,
	score2: 0,
	round: 1,
	maxRounds: 3,
	mode: 'single',
	ball: null,
	isPaused: false,
	isGameOver: false,
	showModals: false,
	animationFlags: {
		headerFadeIn: true,
		canvasEntry: true,
		scoreUpdate: false,
	},
	container: undefined,
	gameId: undefined,
	atmosphere: {
		mistLevel: 0.3,
		gradient: 'linear-gradient(120deg, #b6a6ca 0%, #fffbe6 100%)',
		glow: true,
		soundscape: '/ambient.mp3',
	},
	updateScore(player1Score: number, player2Score: number) {
		this.score1 = player1Score;
		this.score2 = player2Score;
	},
};
