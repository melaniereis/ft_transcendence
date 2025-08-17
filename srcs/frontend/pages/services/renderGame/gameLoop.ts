import { Paddle, Ball } from './types';
import { updateBall, updatePaddle } from './gameLogic.js';
import { resetBall } from './gameLogic.js';
import { endGame } from './endGame.js';
import { renderFrame } from './renderFrame.js';

export function startGameLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
left: Paddle, right: Paddle, ball: Ball, gameId: number, maxGames: number, 
onRestart: () => void) {
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
            endGame(gameId, left.score, right.score, canvas, () => {
            left.score = 0;
            right.score = 0;
            resetBall(ball, canvas, ball.initialSpeed);
            gameEnded = false;
            loop();
            }, left.nickname, right.nickname);
        });

        renderFrame(ctx, canvas, left, right, ball);
        animationId = requestAnimationFrame(loop);
    }
    loop();
}