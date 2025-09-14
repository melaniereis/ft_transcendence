import { translations } from '../language/translations.js';

export function renderMatchReadyScreen(container: HTMLDivElement,playerName: string,
opponentName: string,maxGames: number, onConfirm: () => void,) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div class="flex flex-col items-center justify-center p-6 bg-white bg-opacity-90 rounded-xl shadow-lg max-w-md mx-auto">
			<h2 class="text-4xl font-extrabold text-indigo-700 mb-6">${t.matchmaking}</h2>
			<div class="space-y-4 text-left w-full text-gray-800 text-xl">
			<p><span class="font-semibold">${t.profile}:</span> <span class="text-indigo-600">${playerName}</span></p>
			<p><span class="font-semibold">${t.opponentLabel}:</span> <span class="text-indigo-600">${opponentName}</span></p>
			<p><span class="font-semibold">${t.maxGamesLabel}:</span> <span class="text-indigo-600">${maxGames}</span></p>
			</div>
			<button
			id="confirmBtn"
			class="mt-8 w-full py-4 text-2xl font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
			>
			${t.startGame}
			</button>
		</div>
		`;

	const btn = container.querySelector('#confirmBtn') as HTMLButtonElement;
	if (!btn) {
		console.error('Confirm button not found!');
		return;
	}
	btn.onclick = () => {
		onConfirm();
	};
}
