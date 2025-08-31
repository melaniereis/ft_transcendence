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
	if (!canvas) 
		return;
	const ctx = canvas.getContext('2d');
	if (!ctx) 
		return;

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

	// Game state control
	let gameStarted = false;
	let countdownValue = 3;

	function draw(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw scoreboard (player names and scores)
		ctx.fillStyle = 'white';
		ctx.font = '20px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`${leftPlayerName} ${leftScore} - ${rightScore} ${rightPlayerName}`, canvas.width / 2, 30);

		// Draw dashed center line
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.setLineDash([10, 15]);  // 10px dash, 15px gap
		ctx.beginPath();
		ctx.moveTo(canvas.width / 2, 0);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.stroke();
		ctx.setLineDash([]); // reset to solid line for next drawings

		// Draw paddles
		ctx.fillRect(20, leftY, 10, paddleHeight);
		ctx.fillRect(770, rightY, 10, paddleHeight);

		// Draw ball if game has started
		if (gameStarted) {
			ctx.beginPath();
			ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw countdown if active
		if (!gameStarted && countdownValue > 0) {
			ctx.fillStyle = 'white';
			ctx.font = '120px Arial'; // Bigger font size for countdown
			ctx.fillText(`${countdownValue}`, canvas.width / 2, canvas.height / 2 + 40); // Adjust vertical position for better centering
		}

		if (!gameStarted && countdownValue === 0) {
			ctx.fillStyle = 'white';
			ctx.font = '80px Arial';
			ctx.fillText(`GO!`, canvas.width / 2, canvas.height / 2 + 30);
		}

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

	ws.onopen = () => {
		ws.send(JSON.stringify({ type: 'join', playerName, maxScore: options.maxGames || 5 }));
	};

	ws.onmessage = (ev) => {
		const data = JSON.parse(ev.data);
		switch (data.type) {
		case 'assignSide':
			playerSide = data.side;
			if (playerSide === 'left')
				leftPlayerName = playerName;
			else if (playerSide === 'right')
				rightPlayerName = playerName;
			break;

		case 'startCountdown':
			startCountdown(3);
			break;

		case 'update':
			if (!gameStarted) 
				return;
			leftY = data.paddles.leftY;
			rightY = data.paddles.rightY;
			ballX = data.ball.x;
			ballY = data.ball.y;
			break;

		case 'scoreUpdate':
			leftScore = data.leftScore;
			rightScore = data.rightScore;
			if (data.leftPlayerName) 
				leftPlayerName = data.leftPlayerName;
			if (data.rightPlayerName) 
				rightPlayerName = data.rightPlayerName;
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

	// 🔹 Touch support for mobile
	canvas.addEventListener('touchstart', handleTouch);
	canvas.addEventListener('touchmove', handleTouch);
	canvas.addEventListener('touchend', () => {
		if (playerSide && gameStarted) {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
		}
	});

	function handleTouch(e: TouchEvent) {
		if (!playerSide || !gameStarted) 
			return;
		const touch = e.touches[0];
		if (!touch) 
			return;

		const canvasRect = canvas.getBoundingClientRect();
		const touchY = touch.clientY - canvasRect.top;
		const canvasCenterY = canvas.height / 2;

		// Determine movement direction
		const direction = touchY < canvasCenterY ? 'ArrowUp' : 'ArrowDown';

		// Send move start message
		ws.send(JSON.stringify({ type: 'move', action: 'start', direction }));
	}
	draw(ctx);
}