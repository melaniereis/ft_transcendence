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
	const baseSpeed = {
		easy: 3,
		normal: 5,
		hard: 7,
		crazy: 10
	}[difficulty];

	return {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: Math.max(4, canvas.width * 0.01),
		speed: baseSpeed,
		initialSpeed: baseSpeed,
		dx: baseSpeed * (Math.random() > 0.5 ? 1 : -1),
		dy: baseSpeed * (Math.random() * 2 - 1),
	};
}
