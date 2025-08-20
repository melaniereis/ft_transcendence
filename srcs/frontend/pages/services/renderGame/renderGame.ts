import { createBall, createPaddles } from './setupGame.js';
import { startGameLoop } from './gameLoop.js';
import { setupControls } from './gameControls.js';

export function renderGame(
  container: HTMLElement,
  player1Name: string,
  player2Name: string,
  gameId: number,
  maxGames: number,
  difficulty: 'easy' | 'normal' | 'hard' | 'crazy' = 'normal',
  onGameEnd?: () => void,
  mode: 'single' | 'tournament' = 'single' // NEW PARAMETER
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

  const [leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
  const ball = createBall(canvas, difficulty);

  setupControls(leftPaddle, rightPaddle, 6);

  startGameLoop(
    canvas,
    ctx,
    leftPaddle,
    rightPaddle,
    ball,
    gameId,
    maxGames,
    () => {
      if (onGameEnd) onGameEnd();
    },
    mode // ✅ pass mode to game loop
  );
}
