import { startTournament } from './startTournament.js';
import { translations } from '../language/translations.js';

export async function renderTournamentsPage(container: HTMLDivElement) {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `<h2>${t.tournaments}</h2>`;

	const token = localStorage.getItem('authToken');
	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	if (!token || !loggedInPlayerId) {
		container.innerHTML += `<p>${t.mustBeLoggedIn}</p>`;
		return;
	}

	let users: any[] = [];
	try {
		const res = await fetch('/users', {
		headers: { Authorization: `Bearer ${token}` }
		});
		users = await res.json();
	}
	catch (err) {
		container.innerHTML += `<p>${t.failedToLoadUsers}</p>`;
		return;
	}

	const loggedInPlayer = users.find(u => u.id === loggedInPlayerId);
	if (!loggedInPlayer) {
		container.innerHTML += `<p>${t.loggedInUserNotFound}</p>`;
		return;
	}

	const userMap = new Map<number, any>();
	users.forEach(user => userMap.set(user.id, user));

	// Tournament creation form
	const form = document.createElement('form');
	form.innerHTML = `
		<input type="text" id="tournament-name" placeholder="${t.tournamentsname}" required />
		<label>${t.selectOpponentTitle}</label>
		<select id="player-select" multiple size="8" required></select>
		<div id="selected-preview"><em>${t.noPlayersSelected}</em></div>
		<button type="submit">${t.startGame}</button>
	`;
	container.appendChild(form);

	const playerSelect = form.querySelector('#player-select') as HTMLSelectElement;
	const preview = form.querySelector('#selected-preview') as HTMLDivElement;

	users.forEach((user) => {
		if (user.id === loggedInPlayerId) return; // Skip logged-in user
		const option = document.createElement('option');
		option.value = user.id.toString();
		option.textContent = `${user.name} (${user.username}) - Team: ${user.team}`;
		playerSelect.appendChild(option);
	});

	// Live preview of selected players
	playerSelect.addEventListener('change', () => {
		const selected = Array.from(playerSelect.selectedOptions).map(opt => userMap.get(Number(opt.value)));
		if (selected.length === 0) {
		preview.innerHTML = `<em>${t.noPlayersSelected}</em>`;
		} else {
		preview.innerHTML = `
			<strong>${t.selectOpponentTitle}:</strong>
			<ul>
			<li>${loggedInPlayer.name} (${loggedInPlayer.username}) - Team: ${loggedInPlayer.team} <em>(You)</em></li>
			${selected.map(u => `<li>${u.name} (${u.username}) - Team: ${u.team}</li>`).join('')}
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
			alert(t.invalidOpponent);
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
				<p>${t.tournaments} "<strong>${tournament.name}</strong>" ${t.tournamentCreated}</p>
				<button id="start-btn">${t.startGame}</button>
		`;

		document.getElementById('start-btn')?.addEventListener('click', async () => {
			const verifiedPlayers = new Set<number>();
			verifiedPlayers.add(loggedInPlayerId); // Already verified

			const selectedPlayerObjects = users.filter(u => allPlayerIds.includes(u.id));
			const playersToVerify = selectedPlayerObjects.filter(p => p.id !== loggedInPlayerId);

			container.innerHTML = `<h3>${t.verifyOpponent}</h3><div id="verification-forms"></div><div id="start-status"></div>`;
			const formsContainer = document.getElementById('verification-forms') as HTMLDivElement;
			const statusDiv = document.getElementById('start-status') as HTMLDivElement;

			playersToVerify.forEach(player => {
			const form = document.createElement('form');
			form.innerHTML = `
				<h4>${player.name} (${player.username})</h4>
				<input type="text" name="username" placeholder="${t.verifyUsername}" required />
				<input type="password" name="password" placeholder="${t.verifyPassword}" required />
				<button type="submit">${t.verifyStart}</button>
				<div class="result"></div>
			`;
			formsContainer.appendChild(form);

			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				const formData = new FormData(form);
				const username = formData.get('username') as string;
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
						resultDiv.textContent = t.verifySuccess;
						verifiedPlayers.add(player.id);
						form.querySelector('button')!.disabled = true;

						if (verifiedPlayers.size === 4) {
						statusDiv.innerHTML = `<p>${t.allPlayersVerified}</p>`;
						formsContainer.innerHTML = '';

						setTimeout(async () => {
							await startTournament(container, tournament, selectedPlayerObjects);
						}, 500);
						}
					} 
					else
						resultDiv.textContent = t.verifyInvalid;
				} 
				catch {
					resultDiv.textContent = t.verifyFailed;
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

	// Existing tournaments list
	const list = document.createElement('div');
	list.innerHTML = `<h3>${t.tournaments}</h3>`;
	container.appendChild(list);

	try {
		const res = await fetch('/api/tournaments', {
		headers: { Authorization: `Bearer ${token}` }
		});
		const tournaments = await res.json();

		if (tournaments.length === 0)
		list.innerHTML += `<p>${t.noTournaments}</p>`;
		else {
			tournaments.forEach((tournament: any) => {
				const item = document.createElement('div');
				item.className = 'tournament-card';

				const getUserName = (id: number) => userMap.get(id)?.name || `User ${id}`;

				item.innerHTML = `
				<strong>${tournament.name}</strong> (ID: ${tournament.id})<br/>
				Players: ${getUserName(tournament.player1_id)}, ${getUserName(tournament.player2_id)}, ${getUserName(tournament.player3_id)}, ${getUserName(tournament.player4_id)}<br/>
				Semifinal Winners: ${getUserName(tournament.semifinal1_winner_id) || 'TBD'}, ${getUserName(tournament.semifinal2_winner_id) || 'TBD'}<br/>
				Finalists: ${getUserName(tournament.final_player1_id) || 'TBD'} vs ${getUserName(tournament.final_player2_id) || 'TBD'}<br/>
				Winner: ${getUserName(tournament.winner_id) || 'TBD'}
				`;
				list.appendChild(item);
			});
		}
	} 
	catch (err) {
		list.innerHTML += `<p>${t.errorLoadingTournaments}</p>`;
	}

	// Delete tournament form
	const deleteForm = document.createElement('form');
	deleteForm.innerHTML = `
		<h3>${t.deleteTournamentTitle}</h3>
		<input type="text" id="delete-name" placeholder="${t.deleteTournamentPlaceholder}" required />
		<button type="submit">${t.deleteButton}</button>
	`;
	container.appendChild(deleteForm);

	deleteForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = (document.getElementById('delete-name') as HTMLInputElement).value;

		try {
			const res = await fetch(`/api/tournaments?name=${encodeURIComponent(name)}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (res.ok)
				alert(`${t.tournaments} "${name}" ${t.tournamentCreated}`);
			else {
				const error = await res.json();
				alert(`Error: ${error.error}`);
			}
		} 
		catch (err) {
			alert('Error deleting tournament.');
		}
	});
}