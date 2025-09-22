//renderGame/gameLoop.ts

import { Paddle, Ball } from './types.js';
import { updateBall, updatePaddle, resetBall } from './gameLogic.js';
import { updateScoreDisplay } from './gameControls.js';
import { endGame } from './endGame.js';
import { renderFrame } from './renderFrame.js';
import { state } from './state.js';
import { updateAIPaddle } from './aiLogic.js';

type GameMode = 'single' | 'tournament' | 'quick';

export function startGameLoop
(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	left: Paddle,
	right: Paddle,
	ball: Ball,
	maxGames: number,
	onGameEnd: (score1: number, score2: number) => void,
	mode: GameMode = 'single',
	gameId?: number,
	isAI: boolean = false,
	difficulty: string = 'normal'
)
{
	let gameEnded = false;
	let animationId: number;
	let lastTime = 0;

	let lastAIUpdate = performance.now(); // for high-resolution timing
	let aiTargetY = canvas.height / 2 - right.height / 2;

	function stopGameLoop()
	{
		gameEnded = true;
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	}
	function loop(currentTime: number = 0) {
		if (gameEnded) return;

		// Calculate delta time for smooth animation
		const deltaTime = currentTime - lastTime;
		lastTime = currentTime;

		// Skip frame if paused
		if (state.isPaused) {
			animationId = requestAnimationFrame(loop);
			return;
		}

		// Update game objects with deltaTime for smooth, frame-rate independent movement
		updatePaddle(left, canvas, gameEnded, deltaTime);
		if (isAI)
		{
			const { updatedTargetY, updatedLastAIUpdate } = updateAIPaddle(
				right,
				ball,
				canvas,
				currentTime,
				lastAIUpdate,
				aiTargetY,
				difficulty
			);
			aiTargetY = updatedTargetY;
			lastAIUpdate = updatedLastAIUpdate;
			
			// IMPORTANT: Still need to call updatePaddle to actually move the AI paddle
			updatePaddle(right, canvas, gameEnded, deltaTime);
		}
		else
		{
			updatePaddle(right, canvas, gameEnded, deltaTime);
		}

		updateBall(ball, left, right, canvas, maxGames, () => {
			stopGameLoop();

			const score1 = left.score;
			const score2 = right.score;

			if (mode === 'single' || mode === 'quick') {
				endGame(score1, score2, canvas, () => {
					// Reset for new game
					left.score = 0;
					right.score = 0;
					state.score1 = 0;
					state.score2 = 0;
					state.round++;
					updateScoreDisplay(0, 0);
					resetBall(ball, canvas, ball.initialSpeed);
					gameEnded = false;
					lastTime = 0;
					lastAIUpdate = performance.now();
					aiTargetY = canvas.height / 2 - right.height / 2;
					loop(performance.now());
				}, left.nickname, right.nickname, mode, gameId);
			}
			else {
				// Tournament mode - pass to parent handler
				onGameEnd(score1, score2);
			}
		}, deltaTime);

		// Render the frame
		renderFrame(ctx, canvas, left, right, ball, currentTime);

		// Continue the loop
		animationId = requestAnimationFrame(loop);
	}

	// Start the game loop
	lastTime = performance.now();
	loop(performance.now());

	// Return cleanup function
	return stopGameLoop;
}
