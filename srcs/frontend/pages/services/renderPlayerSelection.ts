import { renderGame } from './renderGame/renderGame.js';

export async function renderPlayerSelection(container: HTMLElement) {
	container.innerHTML = `<h2>Select Players</h2>
	<label>Player 1:
		<select id="player1-select"></select>
	</label>
	<label>Player 2:
		<select id="player2-select"></select>
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
	`;

	const player1Select = document.getElementById('player1-select') as HTMLSelectElement;
	const player2Select = document.getElementById('player2-select') as HTMLSelectElement;
	const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
	const errorDiv = document.getElementById('selection-error') as HTMLDivElement;

	try {
		const response = await fetch('/users');
		const users = await response.json();

		users.forEach((user: any) => {
			const option1 = document.createElement('option');
			option1.value = user.id;
			option1.textContent = user.username;
			player1Select.appendChild(option1);

			const option2 = document.createElement('option');
			option2.value = user.id;
			option2.textContent = user.username;
			player2Select.appendChild(option2);
		});
	} 
	catch (err) {
		errorDiv.textContent = 'Failed to load users.';
		return;
	}

	startGameBtn.addEventListener('click', async () => {
		const player1Id = Number(player1Select.value);
		const player2Id = Number(player2Select.value);
		const player1Name = player1Select.selectedOptions[0].textContent!;
		const player2Name = player2Select.selectedOptions[0].textContent!;
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy'
			| 'normal'
			| 'hard'
			| 'crazy';

		if (!player1Id || !player2Id || player1Id === player2Id) {
			errorDiv.textContent = 'Please select two different players.';
			return;
		}

		try {
			const response = await fetch('/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					player1_id: player1Id,
					player2_id: player2Id,
					max_games: maxGames,
					time_started: new Date().toISOString()
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create game');
			}

			const data = await response.json();
			const gameId = data.game_id;

			container.innerHTML = '';
			renderGame(container, player1Name, player2Name, gameId, maxGames, difficulty);
		} 
		catch (err: any) {
			errorDiv.textContent = `Error starting game: ${err.message}`;
		}
	});
}