import { drawRect, drawCircle, drawText, drawNet } from './gameCanvas.js';
import { Paddle, Ball, updateBall, updatePaddle } from './gameLogic.js';
import { setupControls } from './gameControls.js';
import { resetBall } from './gameLogic.js';
import { endGame } from './endGame.js';

export function renderGame(
    container: HTMLElement,
    player1Name: string,
    player2Name: string,
    gameId: number,
    maxGames: number,
    difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal'
) {
    container.innerHTML = `
        <canvas id="pong" width="800" height="400"></canvas>
        <style>
        canvas {
            background: #111;
            border: 2px solid white;
            display: block;
            margin: auto;
        }
        </style>
    `;

    const canvas = document.getElementById('pong') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const paddleSpeed = 6;

    const leftPaddle: Paddle = {
        x: 10,
        y: canvas.height / 2 - 40,
        width: 10,
        height: 80,
        dy: 0,
        score: 0,
        upKey: 'w',
        downKey: 's',
        nickname: player1Name,
    };

    const rightPaddle: Paddle = {
        x: canvas.width - 20,
        y: canvas.height / 2 - 40,
        width: 10,
        height: 80,
        dy: 0,
        score: 0,
        upKey: 'ArrowUp',
        downKey: 'ArrowDown',
        nickname: player2Name,
    };

    const baseSpeed = {
        easy: 1,
        normal: 3,
        hard: 5,
        crazy: 8
    }[difficulty];

    const ball: Ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 8,
        speed: baseSpeed,
        dx: baseSpeed * (Math.random() > 0.5 ? 1 : -1),
        dy: baseSpeed * (Math.random() * 2 - 1),
    };

    setupControls(leftPaddle, rightPaddle, paddleSpeed);

    let gameEnded = false;
    let animationId: number;

    function render() {
        drawRect(ctx, 0, 0, canvas.width, canvas.height, '#000');
        drawNet(ctx, canvas);
        drawRect(ctx, leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#fff');
        drawRect(ctx, rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#fff');
        drawCircle(ctx, ball.x, ball.y, ball.radius, '#fff');
        drawText(ctx, `${leftPaddle.nickname}: ${leftPaddle.score}`, canvas.width / 4 - 50, 50, '24px', '#fff');
        drawText(ctx, `${rightPaddle.nickname}: ${rightPaddle.score}`, (canvas.width / 4) * 3 - 50, 50, '24px', '#fff');
    }

    function stopGameLoop() {
        gameEnded = true;
        cancelAnimationFrame(animationId);
    }

    function restartGame() {
        leftPaddle.score = 0;
        rightPaddle.score = 0;
        resetBall(ball, canvas, ball.speed);
        gameEnded = false;
        gameLoop();
    }

    function gameLoop() {
        if (gameEnded) return;

        updatePaddle(leftPaddle, canvas, gameEnded);
        updatePaddle(rightPaddle, canvas, gameEnded);

        updateBall(
            ball,
            leftPaddle,
            rightPaddle,
            canvas,
            maxGames,
            gameId,
            () => {
                stopGameLoop();
                endGame(gameId, leftPaddle.score, rightPaddle.score, canvas, restartGame);
            }
        );

        render();
        animationId = requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
