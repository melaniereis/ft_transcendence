import { Paddle, Ball } from './types';
import { updateBall, updatePaddle, resetBall } from './gameLogic.js';
import { endGame } from './endGame.js';
import { renderFrame } from './renderFrame.js';

type GameMode = 'single' | 'tournament' | 'quick';

export function startGameLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
left: Paddle, right: Paddle, ball: Ball, maxGames: number,
onGameEnd: (score1: number, score2: number) => void, mode: GameMode = 'single', gameId?: number) {
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

		updateBall(ball, left, right, canvas, maxGames, () => {
			stopGameLoop();

			const score1 = left.score;
			const score2 = right.score;
			console.log("GAME MODE! ", mode);
			if (mode === 'single' || mode === 'quick') {
				// Restart same game
				endGame(score1, score2, canvas, () => {
				left.score = 0;
				right.score = 0;
				resetBall(ball, canvas, ball.initialSpeed);
				gameEnded = false;
				loop();
				}, left.nickname, right.nickname, mode, gameId);
			}
			else
				onGameEnd(score1, score2);
		});

		// const bgImage = new Image();
		// bgImage.src = 'assets/gamebg.jpg';
		renderFrame(ctx, canvas, left, right, ball);
		animationId = requestAnimationFrame(loop);
	}
	loop();
}