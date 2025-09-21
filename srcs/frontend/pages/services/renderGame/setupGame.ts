//renderGame/setupGame.ts

import { Paddle, Ball } from './types.js';

export function createPaddles(canvas: HTMLCanvasElement, player1: string, player2: string): [Paddle, Paddle] {
	const width = Math.max(5, canvas.width * 0.012);
	const height = Math.max(30, canvas.height * 0.15);
	const margin = Math.max(5, canvas.width * 0.02);

	return [
		{
			x: margin,
			y: canvas.height / 2 - height / 2,
			width,
			height,
			dy: 0,
			score: 0,
			upKey: 'w',
			downKey: 's',
			nickname: player1,
		},
		{
			x: canvas.width - width - margin,
			y: canvas.height / 2 - height / 2,
			width,
			height,
			dy: 0,
			score: 0,
			upKey: 'ArrowUp',
			downKey: 'ArrowDown',
			nickname: player2,
		}
	];
}

export function createBall(canvas: HTMLCanvasElement, difficulty: 'easy' | 'normal' | 'hard' | 'crazy'): Ball {
	// Base speed multiplier for time-based movement (will be multiplied by PIXELS_PER_SECOND)
	const baseSpeed = {
		easy: 0.8,    // Slower for easy mode
		normal: 1.0,  // Normal speed
		hard: 1.3,    // Faster for hard mode
		crazy: 1.6    // Much faster for crazy mode
	}[difficulty];

	return {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: Math.max(4, canvas.width * 0.01),
		speed: baseSpeed,
		initialSpeed: baseSpeed,
		dx: Math.random() > 0.5 ? 1 : -1,  // Direction normalized (-1 or 1)
		dy: (Math.random() * 2 - 1),      // Direction normalized (-1 to 1)
	};
}
