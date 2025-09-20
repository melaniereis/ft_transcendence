import { startTournament } from './startTournament.js';
import { GRIS_COLORS } from '../renderGame/constants.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export async function renderTournamentsPage(container: HTMLDivElement) {
	container.className = 'flex flex-col items-center justify-center min-h-screen p-8';
	container.style.backgroundImage = 'url("/Background2.jpg")'; 
	container.style.borderRadius = '2rem';
	container.style.boxShadow = '0 8px 32px 0 rgba(44, 34, 84, 0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10)';
	container.style.backdropFilter = 'blur(8px)';

	const token = localStorage.getItem('authToken');
	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	if (!token || !loggedInPlayerId) {
		container.innerHTML = `<p>${t.loginRequired}</p>`;
		return;
	}
	container.className = 'flex flex-col items-center justify-center min-h-screen p-8 bg-transparent rounded-lg shadow-lg';
	container.innerHTML = `<h2 class="text-3xl font-bold text-black mb-4">${t.tournaments}</h2>`;

	let users: any[] = [];
	try {
		const res = await fetch('/users', {
			headers: { Authorization: `Bearer ${token}` }
		});
		users = await res.json();
	} catch (err) {
		container.innerHTML += `<p class="text-red-600 font-bold">${t.errorLoadingUsers}</p>`;
		return;
	}

	const loggedInPlayer = users.find(u => u.id === loggedInPlayerId);
	if (!loggedInPlayer) {
		container.innerHTML += `<p class="text-red-600 font-bold">${t.userNotFound}</p>`;
		return;
	}

	const userMap = new Map<number, any>();
	users.forEach(user => userMap.set(user.id, user));

	const formContainer = document.createElement('div');
	formContainer.className = '';
	formContainer.style.background = 'rgba(255,251,230,0.92)';
	formContainer.style.padding = '2.5rem';
	formContainer.style.borderRadius = '2rem';
	formContainer.style.boxShadow = '0 8px 32px 0 rgba(44,34,84,0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10)';
	formContainer.style.backdropFilter = 'blur(8px)';
	formContainer.style.width = '100%';
	formContainer.style.maxWidth = '480px';

	const form = document.createElement('form');
	form.className = '';
	form.innerHTML = `
		<input type="text" id="tournament-name" placeholder="${t.tournamentNamePlaceholder}" required style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.primary};border-radius:1.2rem;background:rgba(255,255,255,0.98);color:${GRIS_COLORS.primary};font-weight:700;font-size:1.1rem;box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<label style="display:block;color:${GRIS_COLORS.primary};font-weight:700;margin-bottom:0.5rem;">${t.enterThreeOpponents}</label>
		<input type="text" id="opponent1" placeholder="${t.opponent1Placeholder}" required style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<input type="text" id="opponent2" placeholder="${t.opponent2Placeholder}" required style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<input type="text" id="opponent3" placeholder="${t.opponent3Placeholder}" required style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.secondary};border-radius:1.2rem;background:rgba(255,255,255,0.98);color:${GRIS_COLORS.secondary};font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
		<div id="selected-preview" style="color:${GRIS_COLORS.primary};font-weight:700;margin-bottom:1rem;">${t.noPlayersSelected}</div>
		<button type="submit" style="width:100%;background:${GRIS_COLORS.gradients.sunrise};border:2px solid ${GRIS_COLORS.primary};color:${GRIS_COLORS.primary};font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">${t.createTournamentButton}</button>
	`;
	formContainer.appendChild(form);
	container.appendChild(formContainer);

	const preview = form.querySelector('#selected-preview') as HTMLDivElement;

	function validateOpponents() {
		const opp1 = (document.getElementById('opponent1') as HTMLInputElement).value.trim();
		const opp2 = (document.getElementById('opponent2') as HTMLInputElement).value.trim();
		const opp3 = (document.getElementById('opponent3') as HTMLInputElement).value.trim();
		const displayNames = [opp1, opp2, opp3];
		const uniqueDisplayNames = Array.from(new Set(displayNames));
		let valid = true;
		let selectedUsers: any[] = [];
		let errors: string[] = [];

		displayNames.forEach((dname, idx) => {
			if (!dname) {
				valid = false;
				errors.push(t.opponentRequired.replace('{index}', String(idx + 1)));
				return;
			}
			const user = users.find(u => u.name === dname && u.id !== loggedInPlayerId);
			if (!user) {
				valid = false;
				errors.push(t.opponentNotFound.replace('{index}', String(idx + 1)).replace('{name}', dname));
			} else {
				selectedUsers.push(user);
			}
		});
		if (uniqueDisplayNames.length !== 3) {
			valid = false;
			errors.push(t.duplicateOpponentNames);
		}
		if (valid) {
			preview.innerHTML = `
				<strong style="color:${GRIS_COLORS.primary};font-weight:700;">${t.selectedPlayers}</strong>
				<ul style="padding-left:1.2rem;">
					<li style="color:${GRIS_COLORS.primary};font-weight:700;">${loggedInPlayer.name} (${loggedInPlayer.username}) <em style="color:${GRIS_COLORS.secondary};font-style:italic;">${t.youLabel}</em></li>
					${selectedUsers.map(u => `<li style="color:${GRIS_COLORS.primary};font-weight:700;">${u.name} (${u.username}) - ${t.teamLabel}: ${u.team}</li>`).join('')}
				</ul>
			`;
		} else {
			preview.innerHTML = `<span style="color:${GRIS_COLORS.error};font-weight:700;">${errors.join('<br>')}</span>`;
		}
		return valid ? selectedUsers : null;
	}

	['opponent1', 'opponent2', 'opponent3'].forEach(id => {
		form.querySelector(`#${id}`)!.addEventListener('input', validateOpponents);
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = (document.getElementById('tournament-name') as HTMLInputElement).value;
		const selectedUsers = validateOpponents();
		if (!selectedUsers || selectedUsers.length !== 3) {
			alert(t.invalidOpponentList);
			return;
		}
		const allPlayerIds = [...selectedUsers.map(u => u.id), loggedInPlayerId];
		const res = await fetch('/api/tournaments', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ name, playerIds: allPlayerIds })
		});
		if (res.ok) {
			const tournament = await res.json();
			container.innerHTML = `
				<div style="background:rgba(255,251,230,0.92);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 2rem;margin:2rem auto;max-width:480px;text-align:center;">
					<p style="color:${GRIS_COLORS.success};font-weight:700;font-size:1.2rem;margin-bottom:1.5rem;">${t.tournamentCreated.replace('{name}', tournament.name)}</p>
					<button id="start-btn" style="width:100%;background:${GRIS_COLORS.gradients.sunrise};border:2px solid ${GRIS_COLORS.primary};color:${GRIS_COLORS.primary};font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">${t.startTournamentButton}</button>
				</div>
			`;

			document.getElementById('start-btn')?.addEventListener('click', async () => {
				const verifiedPlayers = new Set<number>();
				verifiedPlayers.add(loggedInPlayerId);

				const selectedPlayerObjects = users.filter(u => allPlayerIds.includes(u.id));
				const playersToVerify = selectedPlayerObjects.filter(p => p.id !== loggedInPlayerId);

				container.innerHTML = `<div style="background:rgba(255,251,230,0.92);border-radius:2rem;box-shadow:0 8px 32px 0 rgba(44,34,84,0.18), 0 1.5px 8px 0 rgba(44,34,84,0.10);padding:2.5rem 2rem;margin:2rem auto;max-width:480px;text-align:center;">
					<h3 style="font-size:1.6rem;font-weight:700;color:${GRIS_COLORS.primary};margin-bottom:1.5rem;font-family:'Poppins',sans-serif;letter-spacing:0.03em;">${t.playerVerificationTitle}</h3>
					<div id="verification-forms"></div>
					<div id="start-status"></div>
				</div>`;
				const formsContainer = document.getElementById('verification-forms') as HTMLDivElement;
				const statusDiv = document.getElementById('start-status') as HTMLDivElement;

				playersToVerify.forEach(player => {
					const form = document.createElement('form');
					form.className = '';
					form.innerHTML = `
						<h4 style="font-size:1.1rem;font-weight:700;color:${GRIS_COLORS.primary};margin-bottom:0.5rem;">${player.name} (${player.username})</h4>
						<input type="password" name="password" placeholder="${t.passwordPlaceholder}" required style="width:100%;padding:1.2rem;border:2px solid ${GRIS_COLORS.primary};border-radius:1.2rem;background:rgba(255,255,255,0.98);color:${GRIS_COLORS.primary};font-weight:700;font-size:1.05rem;box-shadow:0 2px 8px rgba(44,34,84,0.08);margin-bottom:1rem;" />
						<button type="submit" style="width:100%;background:${GRIS_COLORS.gradients.sunrise};border:2px solid ${GRIS_COLORS.primary};color:${GRIS_COLORS.primary};font-weight:700;padding:1.2rem;border-radius:1.2rem;font-size:1.05rem;box-shadow:0 4px 16px rgba(44,34,84,0.10);transition:background 0.2s,color 0.2s;cursor:pointer;">${t.verifyButton}</button>
						<div class="result" style="color:${GRIS_COLORS.error};font-weight:700;margin-top:0.5rem;"></div>
					`;
					formsContainer.appendChild(form);

					form.addEventListener('submit', async (e) => {
						e.preventDefault();
						const formData = new FormData(form);
						const username = player.username;
						const password = formData.get('password') as string;
						const resultDiv = form.querySelector('.result') as HTMLDivElement;

						try {
							const res = await fetch('/api/login', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ username, password })
							});
							const result = await res.json();

							if (res.ok && result.user.id === player.id) {
								resultDiv.textContent = t.verified;
								verifiedPlayers.add(player.id);
								form.querySelector('button')!.disabled = true;

								if (verifiedPlayers.size === 4) {
									container.innerHTML = '';
									const token = localStorage.getItem('authToken') || '';
									await startTournament(container, tournament, selectedPlayerObjects, token);
								}
							}
							else {
								resultDiv.textContent = t.invalidCredentials;
							}
						}
						catch {
							resultDiv.textContent = t.loginFailed;
						}
					});
				});
			});
		}
		else {
			const error = await res.json();
			alert(`${t.error}: ${error.error}`);
		}
	});
}