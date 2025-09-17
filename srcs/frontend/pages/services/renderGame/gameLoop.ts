import { Paddle, Ball } from './types';
import { updateBall, updatePaddle, resetBall } from './gameLogic.js';
import { endGame } from './endGame.js';
import { renderFrame } from './renderFrame.js';
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

	let lastAIUpdate = performance.now(); // for high-resolution timing
	let aiTargetY = canvas.height / 2 - right.height / 2;

	function stopGameLoop()
	{
		gameEnded = true;
		cancelAnimationFrame(animationId);
	}

	function loop(timestamp: number)
	{
		if (gameEnded)
			return ;

		updatePaddle(left, canvas, gameEnded);
		if (isAI)
		{
			const { updatedTargetY, updatedLastAIUpdate } = updateAIPaddle(
				right,
				ball,
				canvas,
				timestamp,
				lastAIUpdate,
				aiTargetY,
				difficulty
			);
			aiTargetY = updatedTargetY;
			lastAIUpdate = updatedLastAIUpdate;
		}
		else
			updatePaddle(right, canvas, gameEnded);

		updateBall(ball, left, right, canvas, maxGames, () => {
			stopGameLoop();

			const score1 = left.score;
			const score2 = right.score;
			console.log("GAME MODE! ", mode);
			if (mode === 'single' || mode === 'quick') {
				endGame(score1, score2, canvas, () => {
					left.score = 0;
					right.score = 0;
					resetBall(ball, canvas, ball.initialSpeed);
					gameEnded = false;
					lastAIUpdate = performance.now(); // Reset
					aiTargetY = canvas.height / 2 - right.height / 2;
					requestAnimationFrame(loop); // Restart with next frame
				}, left.nickname, right.nickname, mode, gameId);
			}
			else
				onGameEnd(score1, score2);
		});

		renderFrame(ctx, canvas, left, right, ball);
		animationId = requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop); // Start the loop
}