import { renderGame } from './renderGame/renderGame.js';
import { translations } from './language/translations.js';

export async function renderPlayerSelection(container: HTMLElement) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `<h2>${t.selectOpponentTitle}</h2>
	<label>${t.opponentLabel}:
		<select id="player1-select"></select>
	</label>
	<label>${t.maxGamesLabel}:
		<select id="max-games-select">
			<option value="3">3</option>
			<option value="5">5</option>
			<option value="7">7</option>
			<option value="9">9</option>
			<option value="11">11</option>
		</select>
	</label>
	<label>${t.difficultyLabel}:
		<select id="difficulty-select">
			<option value="easy">Easy</option>
			<option value="normal" selected>Normal</option>
			<option value="hard">Hard</option>
			<option value="crazy">Crazy</option>
		</select>
	</label>
	<button id="start-game-btn">${t.startGame}</button>
	<div id="selection-error" style="color:red;"></div>
	<div id="verification-form"></div>
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
			<h3>${t.verifyOpponent}: ${opponent.name} (${opponent.username})</h3>
			<form id="verify-form">
				<input type="text" name="username" placeholder="${t.verifyUsername}" required />
				<input type="password" name="password" placeholder="${t.verifyPassword}" required />
				<button type="submit">${t.verifyStart}</button>
				<div class="result" style="color:red;"></div>
			</form>
		`;

		const verifyForm = document.getElementById('verify-form') as HTMLFormElement;
		const resultDiv = verifyForm.querySelector('.result') as HTMLDivElement;

		verifyForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(verifyForm);
			const username = formData.get('username') as string;
			const password = formData.get('password') as string;

			try {
				const res = await fetch('/api/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username, password })
				});
				const result = await res.json();

				if (res.ok && result.user.id === opponentId) {
					resultDiv.style.color = 'green';
					resultDiv.textContent = t.verifySuccess;

					const gameRes = await fetch('/games', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
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
