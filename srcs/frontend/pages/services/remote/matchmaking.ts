import { renderMultiplayerGame } from './renderMultiplayerGame.js';
import { renderMatchReadyScreen } from './renderMatchReadyScreen.js';

let socket: WebSocket | null = null;

export function startMatchmaking(appDiv: HTMLDivElement, playerId: number, playerName: string, 
difficulty: 'easy' | 'normal' | 'hard' | 'crazy'): void {
	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('🟢 Already connected to matchmaking');
		return;
	}

	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	socket = new WebSocket(`${protocol}://${location.host}/matchmaking`);

	socket.onopen = () => handleSocketOpen(playerId, playerName, difficulty);
	socket.onmessage = (event) => handleSocketMessage(event, appDiv, playerName, difficulty);
	socket.onclose = () => handleSocketClose(appDiv);
	socket.onerror = (err) => handleSocketError(err, appDiv);
}

function handleSocketOpen(playerId: number, playerName: string, difficulty: string) {
	console.log('✅ Connected to matchmaking server. Waiting for opponent...');
	const payload = {
		type: 'join',
		id: playerId,
		username: playerName,
		difficulty
	};
	console.log('Sending join payload:', payload);
	socket!.send(JSON.stringify(payload));
}

function handleSocketMessage(event: MessageEvent, appDiv: HTMLDivElement, playerName: string,difficulty: string) {
	const data = JSON.parse(event.data);
	console.log('Received WS message:', data);

	switch (data.type) {
		case 'chooseMaxGames':
			renderGameSelectionUI(appDiv);
			break;

		case 'waitingForGameSelection':
			renderWaitingMessage(appDiv, 'Waiting for opponent to choose number of games...');
			break;

		case 'waitingForOpponent':
			renderWaitingMessage(appDiv, 'Waiting for another player to join...');
			break;

		case 'ready':
			renderMatchReadyScreen(appDiv, playerName, data.opponent, data.maxGames, () => {
				console.log('Confirm ready clicked');
				socket!.send(JSON.stringify({ type: 'confirmReady' }));
			});
			break;

		case 'start':
			appDiv.innerHTML = '';
			renderMultiplayerGame({container: appDiv, playerName, opponentName: data.opponent, gameId: data.game_id,
			maxGames: data.maxGames,difficulty: difficulty as 'easy' | 'normal' | 'hard' | 'crazy',});
			break;

		case 'error':
			console.error('⚠️ Server error:', data.message);
			appDiv.innerHTML = `<p>Error: ${data.message}</p>`;
			break;

		default:
			console.warn('⚠️ Unknown message type:', data);
	}
}

function renderGameSelectionUI(appDiv: HTMLDivElement) {
	console.log('Received chooseMaxGames');
	appDiv.innerHTML = `
		<p>Select number of games (odd numbers 3–11):</p>
		<select id="gameCountSelect">
			<option value="3">3</option>
			<option value="5">5</option>
			<option value="7">7</option>
			<option value="9">9</option>
			<option value="11">11</option>
		</select>
		<button id="confirmMaxGames">Confirm</button>
	`;
	document.getElementById('confirmMaxGames')?.addEventListener('click', () => {
		const select = document.getElementById('gameCountSelect') as HTMLSelectElement;
		const selected = parseInt(select.value);
		console.log('Selected max games:', selected);
		socket!.send(JSON.stringify({ type: 'selectMaxGames', maxGames: selected }));
	});
}

function renderWaitingMessage(appDiv: HTMLDivElement, message: string) {
	console.log(message);
	appDiv.innerHTML = `
		<p>⏳ ${message}</p>
		<div class="loader"></div>
	`;
}

function handleSocketClose(appDiv: HTMLDivElement) {
	console.warn('🔌 Disconnected from matchmaking server.');
	appDiv.innerHTML = `<p>Disconnected from matchmaking.</p>`;
	socket = null;
}

function handleSocketError(err: Event, appDiv: HTMLDivElement) {
	console.error('❌ WebSocket error:', err);
	appDiv.innerHTML = `<p>Connection error. Please try again.</p>`;
	socket?.close();
	socket = null;
}