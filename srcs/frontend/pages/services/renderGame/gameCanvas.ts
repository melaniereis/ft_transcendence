//renderGame/gameCanvas.ts

import { GRIS_COLORS } from './constants.js';

// Optimized drawing functions with GRIS aesthetic
export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string | HTMLImageElement) {
	if (typeof fill === 'string') {
		// Simple gradient for performance
		const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
		gradient.addColorStop(0, fill);
		gradient.addColorStop(1, GRIS_COLORS.surface);
		ctx.fillStyle = gradient;
	} else {
		const pattern = ctx.createPattern(fill, 'repeat');
		if (pattern) ctx.fillStyle = pattern;
	}

	// Subtle shadow and black border
	ctx.save();
	ctx.shadowColor = GRIS_COLORS.muted;
	ctx.shadowBlur = 8;
	ctx.shadowOffsetY = 2;
	ctx.fillRect(x, y, w, h);
	// Black border
	ctx.lineWidth = 1.1;
	ctx.strokeStyle = '#000';
	ctx.strokeRect(x, y, w, h);
	ctx.restore();
}

// Optimized glowing ball
export function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
	ctx.save();

	// Simple glow effect
	ctx.shadowColor = color;
	ctx.shadowBlur = 12;
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
	// Black border
	ctx.lineWidth = 1.1;
	ctx.strokeStyle = '#000';
	ctx.stroke();

	ctx.restore();
}

// Optimized net with subtle animation
export function drawNet(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time?: number) {
	const netWidth = 3;
	const netHeight = 15;

	ctx.save();
	ctx.globalAlpha = 0.8;
	ctx.fillStyle = GRIS_COLORS.tertiary;

	for (let i = 0; i < canvas.height; i += netHeight * 2) {
		// Minimal animation for performance
		const offset = time ? Math.sin((i + time * 0.001) / 20) * 1 : 0;
		ctx.fillRect(canvas.width / 2 - netWidth / 2 + offset, i, netWidth, netHeight);
		// Black border
		ctx.lineWidth = 1.1;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(canvas.width / 2 - netWidth / 2 + offset, i, netWidth, netHeight);
	}

	ctx.restore();
}

// Optimized text rendering
export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: string, color: string) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.font = `${size} Arial, sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Subtle text shadow
	ctx.shadowColor = GRIS_COLORS.muted;
	ctx.shadowBlur = 4;
	ctx.shadowOffsetY = 1;

	ctx.fillText(text, x, y);
	ctx.restore();
}

// Updated setOptimizedCanvasSize for better responsiveness
export function setOptimizedCanvasSize(canvas: HTMLCanvasElement) {
	const container = canvas.parentElement;
	if (!container) return;

	const containerStyles = window.getComputedStyle(container);
	const paddingLeft = parseFloat(containerStyles.paddingLeft || '0');
	const paddingRight = parseFloat(containerStyles.paddingRight || '0');
	const paddingTop = parseFloat(containerStyles.paddingTop || '0');
	const paddingBottom = parseFloat(containerStyles.paddingBottom || '0');

	const containerWidth = container.clientWidth - paddingLeft - paddingRight;
	const containerHeight = container.clientHeight - paddingTop - paddingBottom;

	const aspectRatio = 5 / 3;
	const maxWidth = Math.min(window.innerWidth * 0.95, 1200);

	// Calculate width and height to fit container while maintaining aspect ratio
	let width = Math.min(containerWidth * 0.95, maxWidth);
	let height = width / aspectRatio;

	// Adjust if height exceeds container height
	const maxHeight = containerHeight * 0.95;
	if (height > maxHeight) {
		height = maxHeight;
		width = height * aspectRatio;
	}

	// Ensure width doesn't exceed container after adjustment
	if (width > containerWidth * 0.95) {
		width = containerWidth * 0.95;
		height = width / aspectRatio;
	}

	// Apply styles
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	canvas.style.maxWidth = maxWidth + 'px';
	canvas.style.display = 'block';
	canvas.style.margin = '0 auto';

	// Set internal canvas resolution
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
	}

	// Accessibility
	canvas.setAttribute('aria-label', 'GRIS Pong game canvas');
}
