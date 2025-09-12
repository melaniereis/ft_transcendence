//renderGame/setupGame.ts

import { Paddle, Ball } from './types.js';

export function createPaddles(canvas: HTMLCanvasElement, player1: string, player2: string): [Paddle, Paddle] {
	return [
		{
			x: 10,
			y: canvas.height / 2 - 40,
			width: 10,
			height: 80,
			dy: 0,
			score: 0,
			upKey: 'w',
			downKey: 's',
			nickname: player1,
		},
		{
			x: canvas.width - 20,
			y: canvas.height / 2 - 40,
			width: 10,
			height: 80,
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
		easy: 2,
		normal: 4,
		hard: 6,
		crazy: 8
	}[difficulty];

	return {
		x: canvas.width / 2,
		y: canvas.height / 2,
		radius: 8,
		speed: baseSpeed,
		initialSpeed: baseSpeed,
		dx: baseSpeed * (Math.random() > 0.5 ? 1 : -1),
		dy: baseSpeed * (Math.random() * 2 - 1),
	};
}
