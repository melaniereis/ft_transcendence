import { renderGame } from '../renderGame/renderGame.js';
import { translations } from "../language/translations.js";

export function renderQuickGameSetup(container: HTMLElement) {
	const supportedLangs = ['en', 'es', 'pt'] as const;
	const fallbackLang = 'en';

	const storedLang = localStorage.getItem('preferredLanguage');
	const lang = supportedLangs.includes(storedLang as typeof supportedLangs[number])
		? (storedLang as keyof typeof translations)
		: fallbackLang;

	const t = translations[lang];
	container.innerHTML = `<h2>${t.quickPlay}</h2>
	<label>${t.username} 1:
		<input type="text" id="player1-name" placeholder="${t.username} 1">
	</label>
	<label>${t.username} 2:
		<input type="text" id="player2-name" placeholder="${t.username} 2">
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
			<option value="easy">${t.difficultyEasy ?? 'Easy'}</option>
			<option value="normal" selected>${t.difficultyNormal ?? 'Normal'}</option>
			<option value="hard">${t.difficultyHard ?? 'Hard'}</option>
			<option value="crazy">${t.difficultyCrazy ?? 'Crazy'}</option>
		</select>
	</label>
	<button id="start-game-btn">${t.startGame}</button>
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
			errorDiv.textContent = t.invalidOpponent || 'Please enter two different player names.';
			return;
		}
		container.innerHTML = '';
		renderGame(container, player1Name, player2Name, maxGames, difficulty, undefined, 'quick', undefined);
	});
}