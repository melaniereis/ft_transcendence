import { renderMultiplayerGame } from './renderMultiplayerGame.js';
import { renderMatchReadyScreen } from './renderMatchReadyScreen.js';
import { translations } from '../language/translations.js';

let socket: WebSocket | null = null;
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

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

function handleSocketMessage(event: MessageEvent, appDiv: HTMLDivElement, playerName: string,
difficulty: string) {
	const data = JSON.parse(event.data);
	console.log('Received WS message:', data);

	switch (data.type) {
		case 'chooseMaxGames':
			renderGameSelectionUI(appDiv);
			break;

		case 'waitingForGameSelection':
		case 'waitingForOpponent':
			renderWaitingMessage(appDiv, `${t.matchmaking}: ${t.waitingForOpponent}`);
			break;

		case 'ready':
			renderMatchReadyScreen(appDiv, playerName, data.opponent, data.maxGames, () => {
				console.log('Confirm ready clicked');
				socket!.send(JSON.stringify({ type: 'confirmReady' }));
			});
			break;

		case 'start':
			appDiv.innerHTML = '';
			renderMultiplayerGame({
				container: appDiv,
				playerName,
				opponentName: data.opponent,
				gameId: data.game_id,
				maxGames: data.maxGames,
				difficulty: difficulty as 'easy' | 'normal' | 'hard' | 'crazy',
			});
			break;

		case 'error':
			console.error('⚠️ Server error:', data.message);
			appDiv.innerHTML = `<p>${t.errorLoadingTournaments}: ${data.message}</p>`;
			break;

		default:
			showGoBackToMainMenu(appDiv);
			break;
	}
}

function renderGameSelectionUI(appDiv: HTMLDivElement) {
	console.log('Received chooseMaxGames');
	appDiv.innerHTML = `
		<div class="flex flex-col items-center justify-center p-6 bg-cover bg-center">
			<div class="w-full max-w-md space-y-6 text-center">
				<p class="text-2xl font-bold text-black mb-6">${t.maxGamesLabel} (3–11):</p>
				<select id="gameCountSelect" class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
					<option value="3">3</option>
					<option value="5">5</option>
					<option value="7">7</option>
					<option value="9">9</option>
					<option value="11">11</option>
				</select>
				<button id="confirmMaxGames" class="w-full py-4 text-2xl font-bold text-black bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
					${t.confirm}
				</button>
			</div>
		</div>
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
		<div class="flex flex-col items-center justify-center space-y-4 p-6 bg-cover bg-center">
			<div class="w-full max-w-md text-center">
				<p class="text-2xl font-bold text-black">${message}</p>
				<div class="loader"></div>
			</div>
		</div>
	`;
}

function showGoBackToMainMenu(appDiv: HTMLDivElement) {
	console.warn('⚠️ Unknown message type received.');
	appDiv.innerHTML = `
		<div class="flex flex-col items-center justify-center p-6 space-y-4 bg-cover bg-center">
			<div class="w-full max-w-md text-center space-y-4">
				<p class="text-2xl font-bold text-black">${t.unknownError}</p>
				<p class="text-xl text-gray-600">${t.goBackToMainMenu}</p>
				<button onclick="window.location.href='/'" class="w-full py-4 text-2xl font-bold text-black bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
					${t.goBack}
				</button>
			</div>
		</div>
	`;
}

function handleSocketClose(appDiv: HTMLDivElement) {
	console.warn('🔌 Disconnected from matchmaking server.');
	appDiv.innerHTML = `
		<div class="flex items-center justify-center p-6 bg-cover bg-center">
			<div class="w-full max-w-md text-center">
				<p class="text-xl font-bold text-black">${t.matchmaking}: Disconnected.</p>
			</div>
		</div>
	`;
	socket = null;
}

function handleSocketError(err: Event, appDiv: HTMLDivElement) {
	console.error('❌ WebSocket error:', err);
	appDiv.innerHTML = `
		<div class="flex items-center justify-center p-6 bg-cover bg-center">
			<div class="w-full max-w-md text-center">
				<p class="text-xl font-bold text-red-600">${t.connectionError}</p>
			</div>
		</div>
	`;
	socket?.close();
	socket = null;
}
