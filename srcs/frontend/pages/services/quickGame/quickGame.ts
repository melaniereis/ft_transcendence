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
		<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center">
			<h2 class="text-5xl font-bold text-[#e8d5ff] mb-8 drop-shadow-lg text-center" style="font-family:'Segoe UI',sans-serif;letter-spacing:0.08em;">${t.quickPlay}</h2>

			<div class="w-full max-w-xl p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-[rgba(44,34,84,0.10)] border border-[rgba(232,213,255,0.18)]" style="box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);">
				<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
					<span class="mb-2">${t.username} 1:</span>
					<input type="text" id="player1-name" placeholder="${t.username} 1"
						class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" />
				</label>
				<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
					<span class="mb-2">${t.username} 2:</span>
					<input type="text" id="player2-name" placeholder="${t.username} 2"
						class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur placeholder-gray-500 text-[#2c2254] transition" />
				</label>
				<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
					<span class="mb-2">${t.maxGamesLabel}:</span>
					<select id="max-games-select"
						class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur text-[#2c2254]">
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="7">7</option>
						<option value="9">9</option>
						<option value="11">11</option>
					</select>
				</label>
				<label class="w-full text-xl font-semibold text-[#2c2254] flex flex-col items-start">
					<span class="mb-2">${t.difficultyLabel}:</span>
					<select id="difficulty-select"
						class="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/60 backdrop-blur text-[#2c2254]">
						<option value="easy">${t.difficultyEasy ?? 'Easy'}</option>
						<option value="normal" selected>${t.difficultyNormal ?? 'Normal'}</option>
						<option value="hard">${t.difficultyHard ?? 'Hard'}</option>
						<option value="crazy">${t.difficultyCrazy ?? 'Crazy'}</option>
					</select>
				</label>
				<button id="start-game-btn" class="mx-auto w-2/3 py-4 text-2xl font-bold text-[#2c2254] bg-gradient-to-r from-[#e8d5ff] to-[#6c4fa3] border-none rounded-full shadow-lg hover:from-[#6c4fa3] hover:to-[#e8d5ff] hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all duration-200">
					${t.startGame}
				</button>
				<div id="selection-error" class="text-red-600 text-xl text-center"></div>
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
