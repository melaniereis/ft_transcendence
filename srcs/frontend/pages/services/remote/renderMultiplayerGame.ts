import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';
import { endGame } from './endRemoteGame.js';

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
	const { container, playerName, gameId } = options;

	container.innerHTML = `
		<div style="position:relative;z-index:1;">
			<canvas id="pong" width="1280" height="680"></canvas>
			<style>
				canvas {
					background: transparent;
					border: 2px solid black;
					margin: auto;
					display: block;
				}
			</style>
		</div>
		<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('assets/Background3.jpg') center center / cover no-repeat fixed;"></div>
	`;

	const canvas = container.querySelector('#pong') as HTMLCanvasElement;
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	const ws = new WebSocket(`${protocol}://${location.host}/game/${gameId}`);

	// 🟡 Canvas constants
	const canvasWidth = 1280;
	const canvasHeight = 680;

	// Paddle & Ball state
	let paddleHeight = 100;
	let paddleWidth = 12;
	let leftY = canvasHeight / 2 - paddleHeight / 2;
	let rightY = canvasHeight / 2 - paddleHeight / 2;
	let ballX = canvasWidth / 2;
	let ballY = canvasHeight / 2;
	let playerSide: 'left' | 'right' | null = null;

	// Game UI state
	let leftPlayerName = 'Player 1';
	let rightPlayerName = 'Player 2';
	let leftScore = 0;
	let rightScore = 0;
	let gameStarted = false;
	let countdownValue = 3;

	function draw(ctx: CanvasRenderingContext2D) {
		// Clear canvas and reset transform
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		const isMirrored = playerSide === 'right';

		if (isMirrored) {
			// Save context and apply mirroring transform
			ctx.save();
			ctx.translate(canvasWidth, 0);
			ctx.scale(-1, 1);
		}

		// Draw scoreboard (not mirrored)
		// So we temporarily reset transform, draw, then restore mirroring
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = 'black';
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`${leftPlayerName} ${leftScore} - ${rightScore} ${rightPlayerName}`, canvasWidth / 2, 40);

		// Restore mirroring transform if needed
		if (isMirrored) {
			ctx.restore();
			// Re-apply mirroring for paddles and ball
			ctx.save();
			ctx.translate(canvasWidth, 0);
			ctx.scale(-1, 1);
		}

		// Draw center dashed line in black
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.setLineDash([12, 16]);
		ctx.beginPath();
		ctx.moveTo(canvasWidth / 2, 0);
		ctx.lineTo(canvasWidth / 2, canvasHeight);
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw paddles in black
		ctx.fillStyle = 'black';
		ctx.fillRect(30, leftY, paddleWidth, paddleHeight);
		ctx.fillRect(canvasWidth - 30 - paddleWidth, rightY, paddleWidth, paddleHeight);

		// Draw ball in black
		if (gameStarted) {
			ctx.beginPath();
			ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
			ctx.fill();
		}

		// Restore context after mirroring
		if (isMirrored) {
			ctx.restore();
		}

		// Draw countdown in black (non-mirrored)
		if (!gameStarted && countdownValue >= 0) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';

			if (countdownValue > 0) {
				ctx.font = '120px Arial';
				ctx.fillText(`${countdownValue}`, canvasWidth / 2, canvasHeight / 2 + 40);
			} else {
				ctx.font = '80px Arial';
				ctx.fillText(`GO!`, canvasWidth / 2, canvasHeight / 2 + 30);
			}
		}

		// Request next frame
		requestAnimationFrame(() => draw(ctx));
	}


	function startCountdown(seconds: number) {
		countdownValue = seconds;

		const countdownInterval = setInterval(() => {
			countdownValue--;
			if (countdownValue < 0) {
				clearInterval(countdownInterval);
				gameStarted = true;
			}
		}, 1000);
	}

	// 🔌 WebSocket logic
	ws.onopen = () => {
		ws.send(JSON.stringify({ type: 'join', playerName, maxScore: options.maxGames || 5 }));
	};

	ws.onmessage = (ev) => {
		const data = JSON.parse(ev.data);
		switch (data.type) {
			case 'assignSide':
				playerSide = data.side;
				if (playerSide === 'left') leftPlayerName = playerName;
				else if (playerSide === 'right') rightPlayerName = playerName;
				break;

			case 'startCountdown':
				startCountdown(3);
				break;

			case 'update':
				if (!gameStarted) return;
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

			case 'end':
				leftPlayerName = data.leftPlayerName || 'Player 1';
				rightPlayerName = data.rightPlayerName || 'Player 2';
				leftScore = data.leftScore;
				rightScore = data.rightScore;

				endGame(leftScore, rightScore, canvas, leftPlayerName, rightPlayerName);
				ws.close();
				break;

			default:
				console.warn('Unknown message type:', data.type);
		}
	};

	ws.onclose = () => console.log('Game ended or connection closed');

	// 🎮 Keyboard controls
	const keysPressed = new Set<string>();
	document.addEventListener('keydown', (e) => {
		if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !keysPressed.has(e.key) && playerSide && gameStarted) {
			keysPressed.add(e.key);
			ws.send(JSON.stringify({ type: 'move', action: 'start', direction: e.key }));
		}
	});

	document.addEventListener('keyup', (e) => {
		if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && keysPressed.delete(e.key) && playerSide && gameStarted) {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: e.key }));
		}
	});

	// 📱 Touch controls
	canvas.addEventListener('touchstart', handleTouch);
	canvas.addEventListener('touchmove', handleTouch);
	canvas.addEventListener('touchend', () => {
		if (playerSide && gameStarted) {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
		}
	});

	function handleTouch(e: TouchEvent) {
		if (!playerSide || !gameStarted) return;

		const touch = e.touches[0];
		if (!touch) return;

		const canvasRect = canvas.getBoundingClientRect();
		const touchY = touch.clientY - canvasRect.top;
		const canvasCenterY = canvasHeight / 2;

		const direction = touchY < canvasCenterY ? 'ArrowUp' : 'ArrowDown';

		ws.send(JSON.stringify({ type: 'move', action: 'start', direction }));
	}

	draw(ctx);
}
