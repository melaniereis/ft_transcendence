import { createBall, createPaddles } from './setupGame.js';
import { startGameLoop } from './gameLoop.js';
import { setupControls } from './gameControls.js';
export function renderGame(container, player1Name, player2Name, gameId, maxGames, difficulty = 'normal') {
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
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    const [leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
    const ball = createBall(canvas, difficulty);
    setupControls(leftPaddle, rightPaddle, 6);
    startGameLoop(canvas, ctx, leftPaddle, rightPaddle, ball, gameId, maxGames, () => {
        renderGame(container, player1Name, player2Name, gameId, maxGames, difficulty);
    });
}
