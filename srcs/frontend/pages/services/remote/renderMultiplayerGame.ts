import type { MultiplayerGameOptions } from '../../../types/remoteTypes.js';
import { endGame } from './endRemoteGame.js';
import { renderGame } from '../renderGame/renderGame.js';

export function renderMultiplayerGame(options: MultiplayerGameOptions) {
	const { container, playerName, opponentName, gameId, maxGames, difficulty } = options;
	renderGame(
		container,
		playerName,
		opponentName,
		maxGames || 5,
		difficulty || 'normal',
		undefined, // onGameEnd callback (can be extended for remote)
		'single', // mode (use 'single' for now; extend renderGame for remote if needed)
		Number(gameId)
	);

	// Setup WebSocket for remote state
	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	const ws = new WebSocket(`${protocol}://${location.host}/game/${gameId}`);

	// Update paddles/ball from server
	ws.onmessage = (ev) => {
		const data = JSON.parse(ev.data);
		if (data.type === 'update' && window.state) {
			window.state.player1.y = data.paddles.leftY;
			window.state.player2.y = data.paddles.rightY;
			window.state.ball.x = data.ball.x;
			window.state.ball.y = data.ball.y;
		}
		if (data.type === 'scoreUpdate' && window.state) {
			window.state.score1 = data.leftScore;
			window.state.score2 = data.rightScore;
		}
		if (data.type === 'end') {
			ws.close();
		}
	};

	// Send paddle movement to server
	document.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			ws.send(JSON.stringify({ type: 'move', action: 'start', direction: e.key }));
		}
	});
	document.addEventListener('keyup', (e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: e.key }));
		}
	});

	// Touch controls
	const canvas = container.querySelector('#pong') as HTMLCanvasElement;
	if (canvas) {
		canvas.addEventListener('touchstart', handleTouch);
		canvas.addEventListener('touchmove', handleTouch);
		canvas.addEventListener('touchend', () => {
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowUp' }));
			ws.send(JSON.stringify({ type: 'move', action: 'end', direction: 'ArrowDown' }));
		});
	}
	function handleTouch(e: TouchEvent) {
		const touch = e.touches[0];
		if (!touch) return;
		const canvasRect = canvas.getBoundingClientRect();
		const touchY = touch.clientY - canvasRect.top;
		const canvasCenterY = canvas.height / 2;
		const direction = touchY < canvasCenterY ? 'ArrowUp' : 'ArrowDown';
		ws.send(JSON.stringify({ type: 'move', action: 'start', direction }));
	}
}
