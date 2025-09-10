import { startTournament } from './startTournament.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export async function renderTournamentsPage(container: HTMLDivElement) {
	// Set container style for consistent layout
	container.className = 'flex flex-col items-center justify-center min-h-screen p-8 bg-transparent rounded-lg shadow-lg';

	// Header
	container.innerHTML = `<h2 class="text-3xl font-bold text-black mb-4">${t.tournaments}</h2>`; // Adjusted margin for title to move closer to the top

	const token = localStorage.getItem('authToken');
	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	if (!token || !loggedInPlayerId) {
		container.innerHTML += `<p class="text-red-600 font-bold">${t.loginRequired}</p>`;
		return;
	}

	// Fetch all registered users
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

	// Tournament creation form container
	const formContainer = document.createElement('div');
	formContainer.className = 'bg-transparent p-8 rounded-lg shadow-xl space-y-6 w-full max-w-xl backdrop-blur-md';

	// Tournament creation form
	const form = document.createElement('form');
	form.className = 'space-y-4'; // Space between form elements
	form.innerHTML = `
		<input type="text" id="tournament-name" placeholder="${t.tournamentNamePlaceholder}" required class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black font-bold" />
		<label class="block text-black font-bold">${t.selectOpponentsLabel}</label>
		<select id="player-select" multiple size="8" required class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black font-bold"></select>
		<div id="selected-preview" class="text-black font-bold">${t.noPlayersSelected}</div>
		<button type="submit" class="w-full bg-transparent border-2 border-black text-black font-bold p-4 rounded-lg hover:bg-black hover:text-white transition">${t.createTournamentButton}</button>
	`;
	formContainer.appendChild(form);
	container.appendChild(formContainer);

	const playerSelect = form.querySelector('#player-select') as HTMLSelectElement;
	const preview = form.querySelector('#selected-preview') as HTMLDivElement;

	// Populate player select dropdown
	users.forEach((user) => {
		if (user.id === loggedInPlayerId) return; // Skip logged-in user
		const option = document.createElement('option');
		option.value = user.id;
		option.textContent = `${user.name} (${user.username}) - Team: ${user.team}`;
		playerSelect.appendChild(option);
	});

	// Live preview of selected players
	playerSelect.addEventListener('change', () => {
		const selected = Array.from(playerSelect.selectedOptions).map(opt => userMap.get(Number(opt.value)));
		if (selected.length === 0) {
			preview.innerHTML = t.noPlayersSelected;
		} else {
			preview.innerHTML = `
				<strong class="text-black font-bold">Selected Players:</strong>
				<ul class="list-disc pl-6">
					<li class="text-black font-bold">${loggedInPlayer.name} (${loggedInPlayer.username}) - Team: ${loggedInPlayer.team} <em class="italic text-blue-600">(You)</em></li>
					${selected.map(u => `<li class="text-black font-bold">${u.name} (${u.username}) - Team: ${u.team}</li>`).join('')}
				</ul>
			`;
		}
	});

	// Tournament creation
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = (document.getElementById('tournament-name') as HTMLInputElement).value;
		const selectedPlayers = Array.from(playerSelect.selectedOptions).map(opt => Number(opt.value));

		if (selectedPlayers.length !== 3) {
			alert(t.selectOpponentsAlert);
			return;
		}

		const allPlayerIds = [...selectedPlayers, loggedInPlayerId];

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
				<p class="text-green-600 font-bold">${t.tournamentCreated.replace('{name}', tournament.name)}</p>
				<button id="start-btn" class="bg-transparent border-2 border-green-500 text-green-500 font-bold p-4 rounded-lg hover:bg-green-500 hover:text-white transition">${t.startTournamentButton}</button>
			`;

			document.getElementById('start-btn')?.addEventListener('click', async () => {
				const verifiedPlayers = new Set<number>();
				verifiedPlayers.add(loggedInPlayerId); // Already verified

				const selectedPlayerObjects = users.filter(u => allPlayerIds.includes(u.id));
				const playersToVerify = selectedPlayerObjects.filter(p => p.id !== loggedInPlayerId);

				container.innerHTML = `<h3 class="text-2xl font-bold text-black mb-4">${t.playerVerificationTitle}</h3><div id="verification-forms" class="space-y-4"></div><div id="start-status"></div>`;
				const formsContainer = document.getElementById('verification-forms') as HTMLDivElement;
				const statusDiv = document.getElementById('start-status') as HTMLDivElement;

				playersToVerify.forEach(player => {
					const form = document.createElement('form');
					form.className = 'space-y-2'; // Space between form elements
					form.innerHTML = `
						<h4 class="text-lg font-bold text-black">${player.name} (${player.username})</h4>
						<input type="password" name="password" placeholder="Password" required class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-transparent backdrop-blur-sm text-black font-bold" />
						<button type="submit" class="bg-transparent border-2 border-black text-black font-bold p-4 rounded-lg hover:bg-black hover:text-white transition">${t.verifyButton}</button>
						<div class="result text-red-600"></div>
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
								resultDiv.textContent = '✅ Verified';
								verifiedPlayers.add(player.id);
								form.querySelector('button')!.disabled = true;

								if (verifiedPlayers.size === 4) {
									statusDiv.innerHTML = `<p class="text-green-600 font-bold">${t.allPlayersVerified}</p>`;
									formsContainer.innerHTML = '';

									setTimeout(async () => {
										const token = localStorage.getItem('authToken') || '';
										await startTournament(container, tournament, selectedPlayerObjects, token);
									}, 500);
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
			alert(`Error: ${error.error}`);
		}
	});

}
