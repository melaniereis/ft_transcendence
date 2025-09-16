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
		<div class="flex flex-col items-center justify-center h-screen p-6 bg-cover bg-center">
			<h2 class="text-6xl font-bold text-black mb-8">${t.quickPlay}</h2>

			<div class="bg-transparent p-8 rounded-lg shadow-xl space-y-6 w-full max-w-xl backdrop-blur-md">
				<label class="text-2xl font-bold text-black block">
					${t.username} 1:
					<input type="text" id="player1-name" placeholder="${t.username} 1"
						class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<label class="text-2xl font-bold text-black block">
					${t.username} 2:
					<input type="text" id="player2-name" placeholder="${t.username} 2"
						class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black" />
				</label>

				<label class="text-2xl font-bold text-black block">
					${t.maxGamesLabel}:
					<select id="max-games-select"
						class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="7">7</option>
						<option value="9">9</option>
						<option value="11">11</option>
					</select>
				</label>

				<label class="text-2xl font-bold text-black block">
					${t.difficultyLabel}:
					<select id="difficulty-select"
						class="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black">
						<option value="easy">${t.difficultyEasy ?? 'Easy'}</option>
						<option value="normal" selected>${t.difficultyNormal ?? 'Normal'}</option>
						<option value="hard">${t.difficultyHard ?? 'Hard'}</option>
						<option value="crazy">${t.difficultyCrazy ?? 'Crazy'}</option>
					</select>
				</label>

				<button id="start-game-btn"
					class="w-full py-4 text-2xl font-bold text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition">
					${t.startGame}
				</button>

				<div id="selection-error" class="text-red-600 text-xl"></div>
			</div>
		</div>
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
