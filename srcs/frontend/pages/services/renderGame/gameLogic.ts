//renderGame/gameLogic.ts

import { Paddle, Ball } from './types.js';
import { state } from './state.js';
import { updateScoreDisplay } from './gameControls.js';

export function resetBall(ball: Ball, canvas: HTMLCanvasElement, speed: number) {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = speed;
	ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
	ball.dy = speed * (Math.random() * 2 - 1);
}

export function updatePaddle(paddle: Paddle, canvas: HTMLCanvasElement, gameEnded: boolean) {
	if (gameEnded) return;

	paddle.y += paddle.dy;

	// Boundary checking
	if (paddle.y < 0) paddle.y = 0;
	if (paddle.y + paddle.height > canvas.height) {
		paddle.y = canvas.height - paddle.height;
	}
}

const SPEED_INCREMENT = 0.15; // Slightly reduced for smoother gameplay
const MAX_SPEED = 15; // Reduced max speed for better playability

export function updateBall(
	ball: Ball,
	leftPaddle: Paddle,
	rightPaddle: Paddle,
	canvas: HTMLCanvasElement,
	maxGames: number,
	onGameEnd: () => void
) {
	// Move the ball
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Bounce off top/bottom walls
	if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
		ball.dy = -ball.dy;
		if (ball.speed < MAX_SPEED) {
			ball.speed += SPEED_INCREMENT;
		}
	}

	// Left paddle collision
	if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
		ball.x - ball.radius > leftPaddle.x &&
		ball.y > leftPaddle.y &&
		ball.y < leftPaddle.y + leftPaddle.height) {

		ball.dx = -ball.dx;

		// Add some spin based on where the ball hits the paddle
		const hitPos = (ball.y - leftPaddle.y) / leftPaddle.height;
		ball.dy += (hitPos - 0.5) * 2; // Add some angle

		if (ball.speed < MAX_SPEED) {
			ball.speed += SPEED_INCREMENT;
		}
	}

	// Right paddle collision
	if (ball.x + ball.radius > rightPaddle.x &&
		ball.x + ball.radius < rightPaddle.x + rightPaddle.width &&
		ball.y > rightPaddle.y &&
		ball.y < rightPaddle.y + rightPaddle.height) {

		ball.dx = -ball.dx;

		// Add some spin based on where the ball hits the paddle
		const hitPos = (ball.y - rightPaddle.y) / rightPaddle.height;
		ball.dy += (hitPos - 0.5) * 2; // Add some angle

		if (ball.speed < MAX_SPEED) {
			ball.speed += SPEED_INCREMENT;
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
