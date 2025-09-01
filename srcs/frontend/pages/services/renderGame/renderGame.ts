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
  onGameEnd?: (canvas: HTMLCanvasElement, score1: number, score2: number) => void,
  mode: 'single' | 'tournament' = 'single'
) {
  container.innerHTML = `
    <canvas id="pong" width="800" height="400" style="border:2px solid white; display:block; margin:auto;"></canvas>
  `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const [leftPaddle, rightPaddle] = createPaddles(canvas, player1Name, player2Name);
  const ball = createBall(canvas, difficulty);

  setupControls(leftPaddle, rightPaddle, 6);

  let countdown = 3;
  let countdownInterval: number | null = null;

  const bg = new Image();
  bg.src = 'assets/gamebg.jpg';

  bg.onload = () => {
    function drawCountdown() {
      // Draw background image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Draw countdown number big and centered
      ctx.fillStyle = 'white';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    }

    function startCountdown() {
      drawCountdown();
      countdownInterval = window.setInterval(() => {
        countdown--;
        if (countdown > 0) {
          drawCountdown();
        } else {
          if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
          startGameLoop(
            canvas,
            ctx,
            leftPaddle,
            rightPaddle,
            ball,
            gameId,
            maxGames,
            (score1: number, score2: number) => {
              if (onGameEnd) onGameEnd(canvas, score1, score2);
            },
            mode
          );
        }
      }, 1000);
    }

    startCountdown();
  };
}
