import { startTournament } from './startQuickTournament.js';
import { GRIS_COLORS } from '../renderGame/constants.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '') 
? localStorage.getItem('preferredLanguage') 
: 'en') as keyof typeof translations;
const t = translations[lang];

export async function renderLocalTournamentPage(container: HTMLDivElement) {
	container.className = 'flex flex-col items-center justify-center min-h-screen p-8';
	container.style.background = "url('Background6.jpg') center center / cover no-repeat fixed";
	container.style.borderRadius = '2rem';
	container.style.boxShadow = '0 8px 32px 0 rgba(44, 34, 84, 0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10)';
	container.style.backdropFilter = 'blur(8px)';
	container.innerHTML = `<h2 class="text-3xl font-bold text-black mb-4">${t.tournaments} </h2>`;

	const formContainer = document.createElement('div');
	formContainer.style.background = 'rgba(255,251,230,0.92)';
	formContainer.style.padding = '2.5rem';
	formContainer.style.borderRadius = '2rem';
	formContainer.style.boxShadow = '0 8px 32px 0 rgba(44,34,84,0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10)';
	formContainer.style.backdropFilter = 'blur(8px)';
	formContainer.style.width = '100%';
	formContainer.style.maxWidth = '480px';

	const form = document.createElement('form');
	form.innerHTML = `
		<input type="text" id="tournament-name" placeholder="${t.tournamentNamePlaceholder}" required
		style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.primary};border-radius:1.2rem;
		background:rgba(255,255,255,0.98);color:${GRIS_COLORS.primary};font-weight:700;font-size:1.1rem;
		box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<label style="display:block;color:${GRIS_COLORS.primary};font-weight:700;margin-bottom:0.5rem;">${t.enterFourPlayers}</label>
		<input type="text" id="player1" placeholder="${t.player1Placeholder || 'Player 1 (You)'}" required
		style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;
		background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;
		box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<input type="text" id="player2" placeholder="${t.player2Placeholder || 'Player 2'}" required
		style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;
		background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;
		box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<input type="text" id="player3" placeholder="${t.player3Placeholder || 'Player 3'}" required
		style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;
		background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;
		box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<input type="text" id="player4" placeholder="${t.player4Placeholder || 'Player 4'}" required
		style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;
		background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;
		box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<div id="selected-preview" style="color:${GRIS_COLORS.primary};font-weight:700;margin-bottom:1rem;">${t.noPlayersSelected}</div>
		<button type="submit" style="width:100%;background:${GRIS_COLORS.gradients.sunrise};border:2px solid ${GRIS_COLORS.primary};
		color:${GRIS_COLORS.primary};font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;
		box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">${t.createTournamentButton}</button>
	`;
	formContainer.appendChild(form);
	container.appendChild(formContainer);

	const preview = form.querySelector('#selected-preview') as HTMLDivElement;

	function validatePlayers() {
		const p1 = (document.getElementById('player1') as HTMLInputElement).value.trim();
		const p2 = (document.getElementById('player2') as HTMLInputElement).value.trim();
		const p3 = (document.getElementById('player3') as HTMLInputElement).value.trim();
		const p4 = (document.getElementById('player4') as HTMLInputElement).value.trim();

		const names = [p1, p2, p3, p4];
		const uniqueNames = Array.from(new Set(names));
		const errors: string[] = [];
		let valid = true;

		names.forEach((name, i) => {
		if (!name) {
			valid = false;
			errors.push(t.playerRequired?.replace('{index}', String(i + 1)) || `Player ${i + 1} is required.`);
		}
		});

		if (uniqueNames.length !== 4) {
		valid = false;
		errors.push(t.duplicatePlayerNames || 'Duplicate player names are not allowed.');
		}

		if (valid) {
		preview.innerHTML = `
			<strong style="color:${GRIS_COLORS.primary};font-weight:700;">${t.selectedPlayers}</strong>
			<ul style="padding-left:1.2rem;">
			${names.map(n => `<li style="color:${GRIS_COLORS.primary};font-weight:700;">${n}</li>`).join('')}
			</ul>
		`;
		} else {
		preview.innerHTML = `<span style="color:${GRIS_COLORS.error};font-weight:700;">${errors.join('<br>')}</span>`;
		}

		return valid ? names : null;
	}

	['player1', 'player2', 'player3', 'player4'].forEach(id => {
		form.querySelector(`#${id}`)!.addEventListener('input', validatePlayers);
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const tournamentName = (document.getElementById('tournament-name') as HTMLInputElement).value.trim();
		const players = validatePlayers();

		if (!tournamentName) {
			alert(t.tournamentNameRequired || 'Tournament name is required.');
			return;
		}
		if (!players) {
			alert(t.invalidPlayerList || 'Please fix player list errors.');
			return;
		}

		// Build local tournament object with 4 players using input names directly
		const tournament = {
		id: 'local-' + Date.now(), // fake unique ID
		name: tournamentName,
		players: players.map((name, idx) => ({
			id: idx + 1,
			name,
			username: name.toLowerCase().replace(/\s+/g, '_'),
			team: `Team ${idx + 1}`
		})),
		local: true
		};

		// Clear container before starting tournament
		container.innerHTML = '';
		await startTournament(container, tournament, tournament.players);
	});
}
