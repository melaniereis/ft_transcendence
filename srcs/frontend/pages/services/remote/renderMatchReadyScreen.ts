// renderMatchReadyScreen.ts
import { translations } from '../language/translations.js';

export function renderMatchReadyScreen(container: HTMLDivElement, playerName: string,
	opponentName: string, maxGames: number, onConfirm: () => void,) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<div style="position:relative;min-height:100vh;">
			<div style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;background:url('/Background3.jpg') center center / cover no-repeat fixed;"></div>
			<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;">
				<div style="background:rgba(44,34,84,0.10);backdrop-filter:blur(8px);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18),0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 3rem;max-width:420px;width:100%;text-align:center;">
					<h2 style="font-size:2.5rem;font-weight:700;color:#e8d5ff;text-shadow:0 0 20px rgba(232,213,255,0.3);letter-spacing:0.08em;font-family:'Segoe UI',sans-serif;margin-bottom:2rem;">${t.matchmaking}</h2>
					<p style="font-size:1.3rem;color:#6c4fa3;margin-bottom:1.2rem;">${t.profile}: <strong>${playerName}</strong></p>
					<p style="font-size:1.3rem;color:#2d1b4e;margin-bottom:1.2rem;">${t.opponentLabel}: <strong>${opponentName}</strong></p>
					<p style="font-size:1.3rem;color:#6c4fa3;margin-bottom:2rem;">${t.maxGamesLabel}: <strong>${maxGames}</strong></p>
					<button id="confirmBtn" style="width:100%;padding:1rem 0;font-size:1.5rem;font-weight:700;color:#2c2254;background:linear-gradient(90deg,#e8d5ff 0%,#6c4fa3 100%);border:none;border-radius:1.5rem;box-shadow:0 2px 16px rgba(44,34,84,0.18),0 1px 4px rgba(44,34,84,0.12);transition:background 0.3s,box-shadow 0.3s,color 0.3s,transform 0.2s;cursor:pointer;">
						${t.startGame}
					</button>
					<div id="waitingMessage" style="display:none;margin-top:2.5rem;">
						<div class="spinning-loader" style="margin-bottom:1.2rem;width:48px;height:48px;border:6px solid #e8d5ff;border-top:6px solid #6c4fa3;border-radius:50%;animation:spin 1s linear infinite;margin:auto;"></div>
						<p style="font-size:1.2rem;color:#6c4fa3;">${t.waitingForPlayer || 'Waiting for the player to join...'}</p>
					</div>
				</div>
			</div>
		</div>
		<style>
		@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
		</style>
	`;

	const btn = container.querySelector('#confirmBtn') as HTMLButtonElement;
	const waitingMsg = container.querySelector('#waitingMessage') as HTMLDivElement;
	if (!btn) {
		console.error('Confirm button not found!');
		return;
	}
	btn.onclick = () => {
		btn.style.display = 'none';
		if (waitingMsg) waitingMsg.style.display = 'block';
		onConfirm();
	};
}
