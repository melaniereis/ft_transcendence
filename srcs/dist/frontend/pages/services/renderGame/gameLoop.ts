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
    let lastTime = performance.now();

    function stopGameLoop() {
        gameEnded = true;
        cancelAnimationFrame(animationId);
    }

    function loop(now: number) {
        if (gameEnded) 
            return;
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;
        updatePaddle(left, canvas, gameEnded, deltaTime);
        updatePaddle(right, canvas, gameEnded, deltaTime);

        updateBall(ball, left, right, canvas, maxGames, gameId, deltaTime, () => {
            stopGameLoop();
            endGame(gameId, left.score, right.score, canvas, () => {
            left.score = 0;
            right.score = 0;
            resetBall(ball, canvas, ball.initialSpeed);
            gameEnded = false;
            lastTime = performance.now();
            loop(lastTime);
            }, left.nickname, right.nickname);
        });

        renderFrame(ctx, canvas, left, right, ball);
        animationId = requestAnimationFrame(loop);
    }
    loop(performance.now());
}