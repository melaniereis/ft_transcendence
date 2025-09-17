import { translations } from '../language/translations.js';

export function renderMatchReadyScreen(container: HTMLDivElement, playerName: string,
	opponentName: string, maxGames: number, onConfirm: () => void,) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div style="position:relative;z-index:1;">
			<div style="text-align:center; margin-top: 2rem;">
				<h2>${t.matchmaking}</h2>
				<p>${t.profile}: <strong>${playerName}</strong></p>
				<p>${t.opponentLabel}: <strong>${opponentName}</strong></p>
				<p>${t.maxGamesLabel}: <strong>${maxGames}</strong></p>
				<button id="confirmBtn">${t.startGame}</button>
			</div>
		</div>
		<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
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
