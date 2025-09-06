import { renderGame } from '../renderGame/renderGame.js';

export function renderQuickGameSetup(container: HTMLElement) {
	container.innerHTML = `<h2>Quick Game Setup</h2>
	<label>Player 1 Name:
		<input type="text" id="player1-name" placeholder="Player 1">
	</label>
	<label>Player 2 Name:
		<input type="text" id="player2-name" placeholder="Player 2">
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

	const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
	const errorDiv = document.getElementById('selection-error') as HTMLDivElement;

	startGameBtn.addEventListener('click', () => {
		const player1Name = (document.getElementById('player1-name') as HTMLInputElement).value.trim();
		const player2Name = (document.getElementById('player2-name') as HTMLInputElement).value.trim();
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy'
			| 'normal'
			| 'hard'
			| 'crazy';

		if (!player1Name || !player2Name || player1Name === player2Name) {
			errorDiv.textContent = 'Please enter two different player names.';
			return;
		}
		container.innerHTML = '';
		renderGame(container, player1Name, player2Name, maxGames, difficulty , undefined, 'quick', undefined,);
	}); 
}