import { renderGame } from './renderGame/renderGame.js';
import { translations } from './language/translations.js';

export async function renderPlayerSelection(container: HTMLElement) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	// Limpar conteúdo anterior
	container.innerHTML = `
		<div class="flex flex-col items-center justify-center h-screen p-6 bg-cover bg-center">
			<h2 class="text-6xl font-bold text-black mb-8">${t.selectOpponentTitle}</h2>

			<div class="bg-transparent p-8 rounded-lg shadow-xl space-y-6 w-full max-w-xl backdrop-blur-md">
				<label class="text-2xl font-bold text-black block">
					${t.opponentLabel}:
					<select id="player1-select" class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
					</select>
				</label>

				<label class="text-2xl font-bold text-black block">
					${t.maxGamesLabel}:
					<select id="max-games-select" class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="7">7</option>
						<option value="9">9</option>
						<option value="11">11</option>
					</select>
				</label>

				<label class="text-2xl font-bold text-black block">
					${t.difficultyLabel}:
					<select id="difficulty-select" class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
						<option value="easy">Easy</option>
						<option value="normal" selected>Normal</option>
						<option value="hard">Hard</option>
						<option value="crazy">Crazy</option>
					</select>
				</label>

				<button id="start-game-btn" class="w-full py-4 text-2xl font-bold text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
					${t.startGame}
				</button>

				<div id="selection-error" class="text-red-600 text-xl"></div>
				<div id="verification-form"></div>
			</div>
		</div>
	`;

	const player1Select = document.getElementById('player1-select') as HTMLSelectElement;
	const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
	const errorDiv = document.getElementById('selection-error') as HTMLDivElement;
	const verificationDiv = document.getElementById('verification-form') as HTMLDivElement;

	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	const loggedInPlayerName = localStorage.getItem('playerName') || 'You';

	if (!loggedInPlayerId) {
		errorDiv.textContent = t.mustBeLoggedIn;
		return;
	}

	let users: any[] = [];
	try {
		const token = localStorage.getItem('authToken');
		const response = await fetch('/users', {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!response.ok) throw new Error('Unauthorized or failed request');
		users = await response.json();

		users.forEach((user: any) => {
			if (user.id === loggedInPlayerId) return;
			const option = document.createElement('option');
			option.value = user.id;
			option.textContent = user.username;
			player1Select.appendChild(option);
		});
	} catch {
		errorDiv.textContent = t.failedToLoadUsers;
		return;
	}

	startGameBtn.addEventListener('click', () => {
		const opponentId = Number(player1Select.value);
		const opponentName = player1Select.selectedOptions[0]?.textContent;
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy' | 'normal' | 'hard' | 'crazy';

		if (!opponentId || opponentId === loggedInPlayerId) {
			errorDiv.textContent = t.invalidOpponent;
			return;
		}

		const opponent = users.find(u => u.id === opponentId);
		verificationDiv.innerHTML = `
			<h3 class="text-2xl font-bold text-black mb-4">${t.verifyOpponent}: ${opponent.name} (${opponent.username})</h3>
			<form id="verify-form" class="space-y-4">
				<input type="password" name="password" placeholder="${t.verifyPassword}" class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" required />
				<button type="submit" class="w-full py-4 text-2xl font-bold text-black bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition">${t.verifyStart}</button>
				<div class="result text-red-600 text-xl"></div>
			</form>
		`;

		const verifyForm = document.getElementById('verify-form') as HTMLFormElement;
		const resultDiv = verifyForm.querySelector('.result') as HTMLDivElement;

		verifyForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(verifyForm);
			const password = formData.get('password') as string;

			try {
				const res = await fetch('/api/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: opponentName, password })
				});
				const result = await res.json();

				if (res.ok && result.user.id === opponentId) {
					resultDiv.style.color = 'green';
					resultDiv.textContent = t.verifySuccess;
					
					const token = localStorage.getItem('authToken');
					const gameRes = await fetch('/games', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							player1_id: loggedInPlayerId,
							player2_id: opponentId,
							max_games: maxGames,
							time_started: new Date().toISOString()
						})
					});

					if (!gameRes.ok) {
						const errorData = await gameRes.json();
						throw new Error(errorData.error || 'Failed to create game');
					}

					const data = await gameRes.json();
					const gameId = data.game_id;

					container.innerHTML = '';
					renderGame(container, loggedInPlayerName, opponentName!, maxGames, difficulty, undefined, 'single', gameId);
				} 
				else {
					resultDiv.textContent = t.verifyInvalid;
				}
			} 
			catch {
				resultDiv.textContent = t.verifyFailed;
			}
		});
	});
}
