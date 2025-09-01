import { Paddle, Ball } from './types';
import { updateBall, updatePaddle, resetBall } from './gameLogic.js';
import { endGame } from './endGame.js';
import { renderFrame } from './renderFrame.js';

type GameMode = 'single' | 'tournament';

export function startGameLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
left: Paddle, right: Paddle, ball: Ball, gameId: number, maxGames: number,
onGameEnd: (score1: number, score2: number) => void, mode: GameMode = 'single') {
	let gameEnded = false;
	let animationId: number;

	function stopGameLoop() {
		gameEnded = true;
		cancelAnimationFrame(animationId);
	}

	function loop() {
		if (gameEnded) 
			return;

		updatePaddle(left, canvas, gameEnded);
		updatePaddle(right, canvas, gameEnded);

		updateBall(ball, left, right, canvas, maxGames, gameId, () => {
			stopGameLoop();

			const score1 = left.score;
			const score2 = right.score;

			if (mode === 'single') {
				// Restart same game
				endGame(gameId, score1, score2, canvas, () => {
				left.score = 0;
				right.score = 0;
				resetBall(ball, canvas, ball.initialSpeed);
				gameEnded = false;
				loop();
				}, left.nickname, right.nickname, mode);
			} 
			else {
				onGameEnd(score1, score2);
			}
		});

		const bgImage = new Image();
		bgImage.src = 'assets/gamebg.jpg';
		renderFrame(ctx, canvas, left, right, ball, bgImage);
		animationId = requestAnimationFrame(loop);
	}

	loop();
}