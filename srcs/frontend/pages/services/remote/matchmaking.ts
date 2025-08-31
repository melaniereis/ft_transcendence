import { renderMultiplayerGame } from './renderMultiplayerGame.js';
import { renderMatchReadyScreen } from './renderMatchReadyScreen.js';

let socket: WebSocket | null = null;

export function startMatchmaking(appDiv: HTMLDivElement,
playerId: number, playerName: string,
difficulty: 'easy' | 'normal' | 'hard' | 'crazy'): void {
	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('🟢 Already connected to matchmaking');
		return;
	}

	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	socket = new WebSocket(`${protocol}://${location.host}/matchmaking`);

	socket.onopen = () => {
		console.log('✅ Connected to matchmaking server. Waiting for opponent...');
		const payload = {
		type: 'join',  // important: tell server this is a join
		id: playerId,
		username: playerName,
		difficulty
		};
		console.log('Sending join payload:', payload);
		socket!.send(JSON.stringify(payload));
	};

	socket.onmessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		console.log('Received WS message:', data);

		switch (data.type) {
		case 'chooseMaxGames':
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
			break;

		case 'ready':
			console.log('Received ready:', data);
			const opponent = data.opponent as string;
			const maxGames = data.maxGames as number;

			console.log('Rendering Match Ready Screen with:', { playerName, opponent, maxGames });
			renderMatchReadyScreen(appDiv, playerName, opponent, maxGames, () => {
				console.log('Confirm ready clicked');
				socket!.send(JSON.stringify({ type: 'confirmReady' }));
			});
			break;

		case 'start':
			console.log(`🎮 Game starting! Game ID: ${data.game_id}`);
			appDiv.innerHTML = '';
			renderMultiplayerGame({
			container: appDiv,
			playerName,
			opponentName: data.opponent,
			gameId: data.game_id,
			maxGames: data.maxGames,
			difficulty,
			});
			break;

		case 'error':
			console.error('⚠️ Server error:', data.message);
			appDiv.innerHTML = `<p>Error: ${data.message}</p>`;
			break;

		default:
			console.warn('⚠️ Unknown message type:', data);
		}
	};

	socket.onclose = () => {
		console.warn('🔌 Disconnected from matchmaking server.');
		appDiv.innerHTML = `<p>Disconnected from matchmaking.</p>`;
		socket = null;
	};

	socket.onerror = (err) => {
		console.error('❌ WebSocket error:', err);
		appDiv.innerHTML = `<p>Connection error. Please try again.</p>`;
		socket?.close();
		socket = null;
	};
}