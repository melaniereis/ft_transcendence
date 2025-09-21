//renderGame/gameLogic.ts

import { Paddle, Ball } from './types.js';
import { state } from './state.js';
import { updateScoreDisplay } from './gameControls.js';

export function resetBall(ball: Ball, canvas: HTMLCanvasElement, initialSpeed: number) {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = initialSpeed;
	ball.dx = Math.random() > 0.5 ? 1 : -1;  // Direction normalized (-1 or 1)
	ball.dy = (Math.random() * 2 - 1);      // Direction normalized (-1 to 1)
	ball.radius = Math.max(4, canvas.width * 0.01); // Ensure radius updates if resized during reset
}

export function updatePaddle(paddle: Paddle, canvas: HTMLCanvasElement, gameEnded: boolean, deltaTime: number = 16.67) {
	if (gameEnded) return;

	// Convert deltaTime from milliseconds to seconds for smooth movement
	const deltaSeconds = deltaTime / 1000;
	
	// Time-based paddle movement (paddle.dy is now velocity in pixels per second)
	paddle.y += paddle.dy * deltaSeconds;

	// Boundary checking
	if (paddle.y < 0) paddle.y = 0;
	if (paddle.y + paddle.height > canvas.height) {
		paddle.y = canvas.height - paddle.height;
	}
}

const SPEED_INCREMENT = 0.05; // Much smaller increment for time-based movement
const MAX_SPEED = 2.0; // Reasonable max speed multiplier for time-based movement
const PIXELS_PER_SECOND = 300; // Base movement speed in pixels per second

export function updateBall(
	ball: Ball,
	leftPaddle: Paddle,
	rightPaddle: Paddle,
	canvas: HTMLCanvasElement,
	maxGames: number,
	onGameEnd: () => void,
	deltaTime: number = 16.67 // Default to ~60fps if not provided
) {
	// Convert deltaTime from milliseconds to seconds
	const deltaSeconds = deltaTime / 1000;
	
	// Calculate the movement distance for this frame
	const moveDistance = PIXELS_PER_SECOND * ball.speed * deltaSeconds;
	const moveX = ball.dx * moveDistance;
	const moveY = ball.dy * moveDistance;
	
	// Store previous position for collision detection
	const prevX = ball.x;
	const prevY = ball.y;
	
	// Move the ball using time-based calculation
	ball.x += moveX;
	ball.y += moveY;
	
	// Continuous collision detection for top/bottom walls (same logic as paddles)
	if (ball.dy < 0) { // Ball moving up
		// Check if ball crossed the top wall this frame
		if (prevY - ball.radius > 0 && ball.y - ball.radius <= 0) {
			// Calculate where the ball would be when it hits the top wall
			const timeToCollision = (prevY - ball.radius) / Math.abs(moveY);
			const collisionX = prevX + moveX * timeToCollision;
			
			ball.dy = -ball.dy;
			ball.y = ball.radius; // Position ball correctly at top wall
			ball.x = collisionX; // Use collision X position
			
			if (ball.speed < MAX_SPEED) {
				ball.speed += SPEED_INCREMENT;
			}
		}
	} else if (ball.dy > 0) { // Ball moving down
		// Check if ball crossed the bottom wall this frame
		if (prevY + ball.radius < canvas.height && ball.y + ball.radius >= canvas.height) {
			// Calculate where the ball would be when it hits the bottom wall
			const timeToCollision = (canvas.height - prevY - ball.radius) / Math.abs(moveY);
			const collisionX = prevX + moveX * timeToCollision;
			
			ball.dy = -ball.dy;
			ball.y = canvas.height - ball.radius; // Position ball correctly at bottom wall
			ball.x = collisionX; // Use collision X position
			
			if (ball.speed < MAX_SPEED) {
				ball.speed += SPEED_INCREMENT;
			}
		}
	}

	// Continuous collision detection for left paddle
	if (ball.dx < 0) { // Ball moving left
		const leftPaddleRight = leftPaddle.x + leftPaddle.width;
		// Check if ball crossed the paddle's right edge this frame
		if (prevX - ball.radius > leftPaddleRight && ball.x - ball.radius <= leftPaddleRight) {
			// Calculate where the ball would be when it hits the paddle edge
			const timeToCollision = (prevX - ball.radius - leftPaddleRight) / Math.abs(moveX);
			const collisionY = prevY + moveY * timeToCollision;
			
			// Check if collision point is within paddle bounds
			if (collisionY + ball.radius > leftPaddle.y && 
				collisionY - ball.radius < leftPaddle.y + leftPaddle.height) {
				
				ball.dx = -ball.dx;
				ball.x = leftPaddleRight + ball.radius; // Position ball correctly
				ball.y = collisionY; // Use collision Y position
				
				// Add spin based on where the ball hits the paddle
				const hitPos = (collisionY - leftPaddle.y) / leftPaddle.height;
				ball.dy += (hitPos - 0.5) * 0.3; // Reduced spin for stability
				
				if (ball.speed < MAX_SPEED) {
					ball.speed += SPEED_INCREMENT;
				}
			}
		}
	}

	// Continuous collision detection for right paddle
	if (ball.dx > 0) { // Ball moving right
		const rightPaddleLeft = rightPaddle.x;
		// Check if ball crossed the paddle's left edge this frame
		if (prevX + ball.radius < rightPaddleLeft && ball.x + ball.radius >= rightPaddleLeft) {
			// Calculate where the ball would be when it hits the paddle edge
			const timeToCollision = (rightPaddleLeft - prevX - ball.radius) / Math.abs(moveX);
			const collisionY = prevY + moveY * timeToCollision;
			
			// Check if collision point is within paddle bounds
			if (collisionY + ball.radius > rightPaddle.y && 
				collisionY - ball.radius < rightPaddle.y + rightPaddle.height) {
				
				ball.dx = -ball.dx;
				ball.x = rightPaddleLeft - ball.radius; // Position ball correctly
				ball.y = collisionY; // Use collision Y position
				
				// Add spin based on where the ball hits the paddle
				const hitPos = (collisionY - rightPaddle.y) / rightPaddle.height;
				ball.dy += (hitPos - 0.5) * 0.3; // Reduced spin for stability
				
				if (ball.speed < MAX_SPEED) {
					ball.speed += SPEED_INCREMENT;
				}
			}
		}
	}

	// Score conditions
	if (ball.x + ball.radius < 0) {
		// Right player scores
		rightPaddle.score++;
		resetBall(ball, canvas, ball.initialSpeed);
		state.score1 = leftPaddle.score;
		state.score2 = rightPaddle.score;
		updateScoreDisplay(state.score1, state.score2);

		// Update announcer for accessibility
		const announcer = document.getElementById('gris-announcer');
		if (announcer) {
			announcer.textContent = `${rightPaddle.nickname} scores! Score: ${leftPaddle.score} - ${rightPaddle.score}`;
		}
	}
	else if (ball.x - ball.radius > canvas.width) {
		// Left player scores
		leftPaddle.score++;
		resetBall(ball, canvas, ball.initialSpeed);
		state.score1 = leftPaddle.score;
		state.score2 = rightPaddle.score;
		updateScoreDisplay(state.score1, state.score2);

		// Update announcer for accessibility
		const announcer = document.getElementById('gris-announcer');
		if (announcer) {
			announcer.textContent = `${leftPaddle.nickname} scores! Score: ${leftPaddle.score} - ${rightPaddle.score}`;
		}
	}

	// End game check
	const totalGames = leftPaddle.score + rightPaddle.score;
	if (totalGames >= maxGames) {
		onGameEnd();
	}
}
