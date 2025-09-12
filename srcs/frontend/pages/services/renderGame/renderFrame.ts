//renderGame/renderFrame.ts

import { Paddle, Ball } from './types.js';
import { drawRect, drawCircle, drawNet, drawText } from './gameCanvas.js';
import { GRIS_COLORS } from './constants.js';

export function renderFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement,
	left: Paddle, right: Paddle, ball: Ball, time?: number) {

	// Clear the canvas with a subtle gradient background
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw background gradient
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, '#1a1a2e');
	gradient.addColorStop(1, '#16213e');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw the net with subtle animation
	drawNet(ctx, canvas, time);

	// Draw paddles with GRIS aesthetic
	drawRect(ctx, left.x, left.y, left.width, left.height, GRIS_COLORS.depression);
	drawRect(ctx, right.x, right.y, right.width, right.height, GRIS_COLORS.acceptance);

	// Draw ball with glow effect
	drawCircle(ctx, ball.x, ball.y, ball.radius, '#ffffff');
}
