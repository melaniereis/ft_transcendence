import { renderMultiplayerGame } from './renderMultiplayerGame.js';
import { renderMatchReadyScreen } from './renderMatchReadyScreen.js';
import { translations } from '../language/translations.js';

let socket: WebSocket | null = null;
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function startMatchmaking(appDiv: HTMLDivElement, playerId: number,
playerName: string, difficulty: 'easy' | 'normal' | 'hard' | 'crazy'): void {
	const token = localStorage.getItem('authToken');
	if (!token) {
		appDiv.innerHTML = `<p>${t.loginRequired}</p>`;
		return;
	}

	function openNewSocket() {
		const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		const wsUrl = `${protocol}://${location.host}/matchmaking?token=${encodeURIComponent(token ?? '')}`;

		console.log('🌐 Connecting WebSocket to:', wsUrl);

		socket = new WebSocket(wsUrl);

		socket.onopen = () => handleSocketOpen(playerId, playerName, difficulty);
		socket.onmessage = (event) => handleSocketMessage(event, appDiv, playerName, difficulty);
		socket.onclose = () => handleSocketClose(appDiv);
		socket.onerror = (err) => handleSocketError(err, appDiv);
	}

	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('🟠 Existing socket — closing and reconnecting to prevent stale state...');
		socket.onclose = () => {
			socket = null;
			openNewSocket();
		};
		socket.close();
	} else {
		openNewSocket();
	}
}


function handleSocketOpen(playerId: number, playerName: string, difficulty: string) {
	console.log('✅ Connected to matchmaking server. Waiting for opponent...');
	const token = localStorage.getItem('authToken');
	const payload = {
		type: 'join',
		id: playerId,
		username: playerName,
		difficulty,
		token
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
			appDiv.innerHTML = `<p>${t.errorLoading}: ${data.message}</p>`;
			break;

		default:
			showGoBackToMainMenu(appDiv);
			break;
	}
}

function renderGameSelectionUI(appDiv: HTMLDivElement) {
	console.log('Received chooseMaxGames');
	appDiv.innerHTML = `
		<div class="flex flex-col items-center justify-center min-h-screen p-6">
			<div class="w-full max-w-md space-y-8 text-center rounded-xl shadow-lg p-8">
				<p class="text-4xl font-extrabold text-gray-900 mb-6">${t.maxGamesLabel} (3–11):</p>
				<select id="gameCountSelect" class="w-full p-5 mt-2 rounded-lg border border-gray-300 focus:ring-4 focus:ring-indigo-600 focus:outline-none bg-white text-2xl text-gray-900">
					<option value="3">3</option>
					<option value="5">5</option>
					<option value="7">7</option>
					<option value="9">9</option>
					<option value="11">11</option>
				</select>
				<button id="confirmMaxGames" class="w-full py-5 mt-6 text-3xl font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition">
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
		<div class="flex items-center justify-center min-h-screen p-6">
			<div class="max-w-md text-center rounded-xl shadow-lg p-10">
				<p class="text-5xl font-extrabold text-gray-900 mb-8">${message}</p>
				<div class="loader mx-auto"></div>
			</div>
		</div>
	`;
}

function showGoBackToMainMenu(appDiv: HTMLDivElement) {
	console.warn('⚠️ Unknown message type received.');
	appDiv.innerHTML = `
		<div class="flex items-center justify-center min-h-screen p-6">
			<div class="max-w-md text-center rounded-xl shadow-lg p-10 space-y-8">
				<p class="text-5xl font-extrabold text-gray-900">${t.unknownError}</p>
				<p class="text-3xl text-gray-700">${t.goBackToMainMenu}</p>
				<button onclick="window.location.href='/'" class="w-full py-5 text-3xl font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 transition">
					${t.goBack}
				</button>
			</div>
		</div>
	`;
}

function handleSocketClose(appDiv: HTMLDivElement) {
	console.warn('🔌 Disconnected from matchmaking server.');
	appDiv.innerHTML = `
		<div class="flex items-center justify-center min-h-screen p-6">
			<div class="max-w-md text-center rounded-xl shadow-lg p-10">
				<p class="text-4xl font-extrabold text-gray-900">${t.matchmaking}: Disconnected.</p>
			</div>
		</div>
	`;
	socket = null;
}

function handleSocketError(err: Event, appDiv: HTMLDivElement) {
	console.error('❌ WebSocket error:', err);
	appDiv.innerHTML = `
		<div class="flex items-center justify-center min-h-screen p-6">
			<div class="max-w-md text-center rounded-xl shadow-lg p-10">
				<p class="text-4xl font-extrabold text-red-600">${t.connectionError}</p>
			</div>
		</div>
	`;
	socket?.close();
	socket = null;
}
