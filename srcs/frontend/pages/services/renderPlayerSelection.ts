import { renderGame } from './renderGame/renderGame.js';

export async function renderPlayerSelection(container: HTMLElement) {
	container.innerHTML = `<h2>Select Opponent</h2>
	<label>Opponent:
		<select id="player1-select"></select>
	</label>
	<label>Max Games:
		<select id="max-games-select">
			<option value="3">3</option>
			<option value="5">5</option>
			<option value="7">7</option>
			<option value="9">9</option>
			<option value="11">11</option>
		</select>
	</label>
	<label>Difficulty:
		<select id="difficulty-select">
			<option value="easy">Easy</option>
			<option value="normal" selected>Normal</option>
			<option value="hard">Hard</option>
			<option value="crazy">Crazy</option>
		</select>
	</label>
	<button id="start-game-btn">Start Game</button>
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
		errorDiv.textContent = 'You must be logged in to start a game.';
		return;
	}

	let users: any[] = [];
	try {
		const token = localStorage.getItem('authToken');
		const response = await fetch('/users', {
			headers: {
			Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Unauthorized or failed request');
		}
		users = await response.json();

		users.forEach((user: any) => {
			if (user.id === loggedInPlayerId) return;
			const option = document.createElement('option');
			option.value = user.id;
			option.textContent = user.username;
			player1Select.appendChild(option);
		});
	} 
	catch (err) {
		errorDiv.textContent = 'Failed to load users.';
		return;
	}

	startGameBtn.addEventListener('click', () => {
		const opponentId = Number(player1Select.value);
		const opponentName = player1Select.selectedOptions[0]?.textContent;
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy'
			| 'normal'
			| 'hard'
			| 'crazy';

		if (!opponentId || opponentId === loggedInPlayerId) {
			errorDiv.textContent = 'Please select a valid opponent.';
			return;
		}

		// Show verification form
		const opponent = users.find(u => u.id === opponentId);
		verificationDiv.innerHTML = `
			<h3>Verify Opponent: ${opponent.name} (${opponent.username})</h3>
			<form id="verify-form">
				<input type="text" name="username" placeholder="Username" required />
				<input type="password" name="password" placeholder="Password" required />
				<button type="submit">Verify & Start</button>
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
					resultDiv.textContent = '✅ Verified. Starting game...';

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
				else
					resultDiv.textContent = '❌ Invalid credentials or wrong user.';
			} 
			catch {
				resultDiv.textContent = '❌ Login failed.';
			}
		});
	});
}