import { createBall, createPaddles } from './setupGame.js';
import { startGameLoop } from './gameLoop.js';
import { setupControls } from './gameControls.js';

export function renderGame(container: HTMLElement, player1Name: string, player2Name: string,maxGames: number, 
difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal',
onGameEnd?: (canvas: HTMLCanvasElement, score1: number, score2: number) => void, 
mode: 'single' | 'tournament' | 'quick' = 'single', gameId?: number, isAI: boolean = false) {
    container.innerHTML = `
        <canvas id="pong" width="1280" height="680" style="border:2px solid white; display:block; margin:auto;"></canvas>
    `;

    const canvas = document.getElementById('pong') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Set the canvas background to transparent
    canvas.style.background = 'transparent';

    const [leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
    const ball = createBall(canvas, difficulty);

    setupControls(leftPaddle, rightPaddle, 6, isAI);

    let countdown = 3;
    let countdownInterval: number | null = null;

    // Remove the background image code entirely, no need for bg image now

    function drawCountdown() {
        // Clear the canvas to maintain transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw countdown number big and centered
        ctx.fillStyle = 'white';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    }

    function startCountdown() {
        drawCountdown();  // Draw the initial countdown
        countdownInterval = window.setInterval(() => {
        countdown--;
        if (countdown > 0) {
            drawCountdown();  // Keep drawing the countdown
        } else {
            if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            }
            // Start the game loop after countdown
            startGameLoop(canvas, ctx, leftPaddle, rightPaddle, ball, maxGames,
            (score1: number, score2: number) => {
                if (onGameEnd) 
                onGameEnd(canvas, score1, score2);
            },
            mode, gameId, isAI
            );
        }
        }, 1000);
    }

    startCountdown();
}
