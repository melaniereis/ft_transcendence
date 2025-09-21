// srcs/frontend/pages/services/quickGame/quickGame.ts
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

	container.innerHTML = `
		<div class="form-container">
			<h2 class="title">${t.quickPlay}</h2>
			<div class="inner-container">
			<label class="form-label">
				<span>${t.username} 1:</span>
				<input type="text" id="player1-name" placeholder="${t.username} 1" class="input-field" />
			</label>
			<label class="form-label">
				<span>${t.username} 2:</span>
				<input type="text" id="player2-name" placeholder="${t.username} 2" class="input-field" />
			</label>
			<label class="form-label">
				<span>${t.aiOpponentLabel || 'Play vs AI:'}</span>
				<div class="ai-toggle">
				<input type="checkbox" id="ai-opponent" />
				<span class="toggle-switch"></span>
				</div>
			</label>
			<label class="form-label">
				<span>${t.maxGamesLabel}:</span>
				<select id="max-games-select" class="input-field">
				<option value="3">3</option>
				<option value="5">5</option>
				<option value="7">7</option>
				<option value="9">9</option>
				<option value="11">11</option>
				</select>
			</label>
			<label class="form-label">
				<span>${t.difficultyLabel}:</span>
				<select id="difficulty-select" class="input-field">
				<option value="easy">${t.difficultyEasy ?? 'Easy'}</option>
				<option value="normal" selected>${t.difficultyNormal ?? 'Normal'}</option>
				<option value="hard">${t.difficultyHard ?? 'Hard'}</option>
				<option value="crazy">${t.difficultyCrazy ?? 'Crazy'}</option>
				</select>
			</label>
			<button id="start-game-btn" class="start-game-btn">
				${t.startGame}
			</button>
			<div id="selection-error" class="error"></div>
			</div>
		</div>
		<style>
			/* Container-specific styles */
			.form-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 20px;
			background: rgba(44, 34, 84, 0.1);
			border-radius: 24px;
			box-shadow: 0 8px 32px rgba(44, 34, 84, 0.18), 0 1.5px 8px rgba(44, 34, 84, 0.1);
			backdrop-filter: blur(10px);
			width: 100%;
			max-width: 600px;
			margin: 0 auto;
			margin-top: 8vh;
			}

			.inner-container {
			width: 100%;
			}

			/* Title styling */
			.title {
			font-family: 'Segoe UI', sans-serif;
			letter-spacing: 0.08em;
			font-size: 3rem;
			font-weight: bold;
			color: #e8d5ff;
			margin-bottom: 2rem;
			text-align: center;
			text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
			}

			/* Form Label */
			.form-label {
			width: 100%;
			font-size: 1.25rem;
			font-weight: 600;
			color: #2c2254;
			margin-bottom: 16px;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			}

			/* Input Fields */
			.input-field {
			width: 100%;
			padding: 16px;
			font-size: 1rem;
			border-radius: 12px;
			border: 1px solid #ccc;
			background-color: rgba(255, 255, 255, 0.6);
			transition: all 0.3s ease;
			}

			.input-field:focus {
			outline: none;
			border-color: #6c4fa3;
			box-shadow: 0 0 0 2px rgba(102, 63, 153, 0.5);
			}

			/* Button Styles */
			.start-game-btn {
			width: 66%;
			padding: 16px;
			font-size: 1.5rem;
			font-weight: 700;
			color: #2c2254;
			background: linear-gradient(90deg, #e8d5ff, #6c4fa3);
			border: none;
			border-radius: 50px;
			box-shadow: 0 8px 24px rgba(102, 63, 153, 0.2);
			cursor: pointer;
			transition: all 0.3s ease;
			margin-top: 20px;
			}

			.start-game-btn:hover {
			background: linear-gradient(90deg, #6c4fa3, #e8d5ff);
			color: white;
			}

			/* Error message styling */
			.error {
			color: red;
			font-size: 1.2rem;
			text-align: center;
			margin-top: 10px;
			}

			/* Toggle Switch for AI */
			.ai-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			}

			.toggle-switch {
			position: relative;
			width: 50px;
			height: 25px;
			background-color: #ccc;
			border-radius: 50px;
			transition: background-color 0.3s ease;
			cursor: pointer;
			margin-left: 10px;
			}

			.toggle-switch::before {
			content: '';
			position: absolute;
			top: 3px;
			left: 3px;
			width: 19px;
			height: 19px;
			background-color: white;
			border-radius: 50%;
			transition: transform 0.3s ease;
			}

			input[type="checkbox"]:checked + .toggle-switch {
			background-color: #6c4fa3;
			}

			input[type="checkbox"]:checked + .toggle-switch::before {
			transform: translateX(25px);
			}
			@media (max-width: 768px) {
			.form-container {
				padding: 16px;
				margin-top: 6vh;
			}

			.title {
				font-size: 2.2rem;
			}

			.input-field {
				padding: 14px;
				font-size: 1rem;
			}

			.start-game-btn {
				font-size: 1.2rem;
				width: 100%;
			}
			}

			@media (max-width: 480px) {
			.title {
				font-size: 1.8rem;
			}

			.form-label {
				font-size: 1.1rem;
			}

			.input-field {
				font-size: 0.95rem;
			}

			.start-game-btn {
				font-size: 1rem;
				padding: 14px;
			}
			}

		</style>
		`;

	const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
	const errorDiv = document.getElementById('selection-error') as HTMLDivElement;
	const aiCheckbox = document.getElementById('ai-opponent') as HTMLInputElement;
	const player2Input = document.getElementById('player2-name') as HTMLInputElement;

  // event listener for the AI checkbox
	aiCheckbox.addEventListener('change', () => {
		player2Input.value = aiCheckbox.checked ? 'AI Bot' : '';
		player2Input.readOnly = aiCheckbox.checked;
	});

	startGameBtn.addEventListener('click', () => {
		const player1Name = (document.getElementById('player1-name') as HTMLInputElement).value.trim();
		const player2Name = (document.getElementById('player2-name') as HTMLInputElement).value.trim();
		const maxGames = Number((document.getElementById('max-games-select') as HTMLSelectElement).value);
		const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as
			| 'easy'
			| 'normal'
			| 'hard'
			| 'crazy';
		const isAI = aiCheckbox.checked;

		if (!player1Name)
		{
			errorDiv.textContent = t.invalidOpponent || 'Please enter a player 1 name.';
			return ;
		}
		if (!isAI && !player2Name)
		{
			errorDiv.textContent = t.invalidOpponent || 'Please enter a player 2 name or select AI opponent.';
			return ;
		}
		if (!isAI && player1Name === player2Name)
		{
			errorDiv.textContent = t.invalidOpponent || 'Please enter two different player names.';
			return ;
		}

		container.innerHTML = '';
		renderGame(container, player1Name, player2Name, maxGames, difficulty, undefined, 'quick', undefined, undefined , undefined, isAI);
	});
}
