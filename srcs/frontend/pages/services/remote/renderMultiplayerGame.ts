import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
  const { container, playerName, gameId } = options;

  container.innerHTML = `
    <canvas id="pong" width="800" height="400"></canvas>
    <style>
      canvas { background: #111; border: 2px solid white; margin: auto; display: block; }
    </style>
  `;

  const canvas = document.getElementById('pong') as HTMLCanvasElement;
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
  const paddleSpeed = 10;
  let playerSide: 'left' | 'right' | null = null;
  const keysPressed = new Set<string>();

  function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(20, leftY, 10, paddleHeight);
  ctx.fillRect(770, rightY, 10, paddleHeight);
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fill();
  requestAnimationFrame(() => draw(ctx));
}


  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', playerName }));
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
      case 'end':
        alert(data.message);
        ws.close();
        break;
    }
  };

  ws.onclose = () => console.log('Game ended or connection closed');

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
if (!ctx) return;
	draw(ctx);

}
