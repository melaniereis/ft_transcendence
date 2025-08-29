import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';
import { endGame } from './endRemoteGame.js';

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
  const { container, playerName, gameId } = options;

  container.innerHTML = `
    <canvas id="pong" width="800" height="400"></canvas>
    <style>
      canvas { background: #111; border: 2px solid white; margin: auto; display: block; }
    </style>
  `;

  const canvas = container.querySelector('#pong') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocol}://${location.host}/game/${gameId}`);

  let leftY = 160;
  let rightY = 160;
  let ballX = 400;
  let ballY = 200;
  const paddleHeight = 80;
  let playerSide: 'left' | 'right' | null = null;

  // Store names and scores for drawing
  let leftPlayerName = 'Player 1';
  let rightPlayerName = 'Player 2';
  let leftScore = 0;
  let rightScore = 0;

  function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scoreboard (player names and scores)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${leftPlayerName} ${leftScore} - ${rightScore} ${rightPlayerName}`, canvas.width / 2, 30);

    // Draw paddles
    ctx.fillRect(20, leftY, 10, paddleHeight);
    ctx.fillRect(770, rightY, 10, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(() => draw(ctx));
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', playerName, maxScore: options.maxGames || 5 }));
  };

  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    switch (data.type) {
      case 'assignSide':
        playerSide = data.side;
        break;

      case 'update':
        leftY = data.paddles.leftY;
        rightY = data.paddles.rightY;
        ballX = data.ball.x;
        ballY = data.ball.y;
        break;

      case 'scoreUpdate':
        leftScore = data.leftScore;
        rightScore = data.rightScore;
		if (data.leftPlayerName) leftPlayerName = data.leftPlayerName;
      	if (data.rightPlayerName) rightPlayerName = data.rightPlayerName;
      break;
        break;

      case 'end':
        leftPlayerName = data.leftPlayerName || 'Player 1';
        rightPlayerName = data.rightPlayerName || 'Player 2';
        leftScore = data.leftScore;
        rightScore = data.rightScore;

        endGame(
          leftScore,
          rightScore,
          canvas,
          leftPlayerName,
          rightPlayerName
        );
        ws.close();
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  };

  ws.onclose = () => console.log('Game ended or connection closed');

  const keysPressed = new Set<string>();

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !keysPressed.has(e.key) && playerSide) {
      keysPressed.add(e.key);
      ws.send(JSON.stringify({ type: 'move', action: 'start', direction: e.key }));
    }
  });

  document.addEventListener('keyup', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && keysPressed.delete(e.key) && playerSide) {
      ws.send(JSON.stringify({ type: 'move', action: 'end', direction: e.key }));
    }
  });

  draw(ctx);
}
