//renderGame/types.ts

/**
 * Optimized GRIS-inspired type definitions
 * - Clean and efficient interfaces
 * - Proper type safety
 */

export interface Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	dy: number;
	score: number;
	upKey: string;
	downKey: string;
	nickname: string;
	avatarUrl?: string;
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
	speed: number;
	initialSpeed: number;
	dx: number;
	dy: number;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon?: string;
	unlocked: boolean;
}

export interface GameStats {
	scores: number[];
	winRate: number;
	streak: number;
	achievements: Achievement[];
}

export interface PlayerProfile {
	nickname: string;
	avatarUrl?: string;
	team?: string;
	achievements?: Achievement[];
}
