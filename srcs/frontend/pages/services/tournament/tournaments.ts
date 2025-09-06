import { startTournament } from './startTournament.js';

export async function renderTournamentsPage(container: HTMLDivElement) {
	container.innerHTML = `<h2>Tournaments</h2>`;

	const token = localStorage.getItem('authToken');
	const loggedInPlayerId = Number(localStorage.getItem('playerId'));
	if (!token || !loggedInPlayerId) {
		container.innerHTML += `<p>Please log in to view tournaments.</p>`;
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
		container.innerHTML += `<p>Error loading users.</p>`;
		return;
	}

	const loggedInPlayer = users.find(u => u.id === loggedInPlayerId);
	if (!loggedInPlayer) {
		container.innerHTML += `<p>Logged-in user not found.</p>`;
		return;
	}

	const userMap = new Map<number, any>();
	users.forEach(user => userMap.set(user.id, user));

	// Tournament creation form
	const form = document.createElement('form');
	form.innerHTML = `
		<input type="text" id="tournament-name" placeholder="Tournament Name" required />
		<label>Select 3 Opponents (you will be auto-included):</label>
		<select id="player-select" multiple size="8" required></select>
		<div id="selected-preview"><em>No players selected yet.</em></div>
		<button type="submit">Create Tournament</button>
	`;
	container.appendChild(form);

	const playerSelect = form.querySelector('#player-select') as HTMLSelectElement;
	const preview = form.querySelector('#selected-preview') as HTMLDivElement;

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
			preview.innerHTML = `<em>No players selected yet.</em>`;
		} else {
			preview.innerHTML = `
				<strong>Selected Players:</strong>
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
			alert('Please select exactly 3 opponents.');
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
				<p>Tournament "<strong>${tournament.name}</strong>" created successfully!</p>
				<button id="start-btn">Start Tournament</button>
			`;

			document.getElementById('start-btn')?.addEventListener('click', async () => {
				const verifiedPlayers = new Set<number>();
				verifiedPlayers.add(loggedInPlayerId); // Already verified

				const selectedPlayerObjects = users.filter(u => allPlayerIds.includes(u.id));
				const playersToVerify = selectedPlayerObjects.filter(p => p.id !== loggedInPlayerId);

				container.innerHTML = `<h3>Player Verification</h3><div id="verification-forms"></div><div id="start-status"></div>`;
				const formsContainer = document.getElementById('verification-forms') as HTMLDivElement;
				const statusDiv = document.getElementById('start-status') as HTMLDivElement;

				playersToVerify.forEach(player => {
					const form = document.createElement('form');
					form.innerHTML = `
						<h4>${player.name} (${player.username})</h4>
						<input type="text" name="username" placeholder="Username" required />
						<input type="password" name="password" placeholder="Password" required />
						<button type="submit">Verify</button>
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
								resultDiv.textContent = '✅ Verified';
								verifiedPlayers.add(player.id);
								form.querySelector('button')!.disabled = true;

								if (verifiedPlayers.size === 4) {
									statusDiv.innerHTML = `<p>All players verified. Starting tournament...</p>`;
									formsContainer.innerHTML = '';

									setTimeout(async () => {
										await startTournament(container, tournament, selectedPlayerObjects);
									}, 500);
								}
							} 
							else {
								resultDiv.textContent = '❌ Invalid credentials or wrong user.';
							}
						} 
						catch {
							resultDiv.textContent = '❌ Login failed.';
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
	list.innerHTML = `<h3>Existing Tournaments</h3>`;
	container.appendChild(list);

	try {
		const res = await fetch('/api/tournaments', {
			headers: { Authorization: `Bearer ${token}` }
		});
		const tournaments = await res.json();

		if (tournaments.length === 0) {
			list.innerHTML += `<p>No tournaments found.</p>`;
		} 
		else {
			tournaments.forEach((t: any) => {
				const item = document.createElement('div');
				item.className = 'tournament-card';

				const getUserName = (id: number) => userMap.get(id)?.name || `User ${id}`;

				item.innerHTML = `
					<strong>${t.name}</strong> (ID: ${t.id})<br/>
					Players: ${getUserName(t.player1_id)}, ${getUserName(t.player2_id)}, ${getUserName(t.player3_id)}, ${getUserName(t.player4_id)}<br/>
					Semifinal Winners: ${getUserName(t.semifinal1_winner_id) || 'TBD'}, ${getUserName(t.semifinal2_winner_id) || 'TBD'}<br/>
					Finalists: ${getUserName(t.final_player1_id) || 'TBD'} vs ${getUserName(t.final_player2_id) || 'TBD'}<br/>
					Winner: ${getUserName(t.winner_id) || 'TBD'}
				`;
				list.appendChild(item);
			});
		}
	} 
	catch (err) {
		list.innerHTML += `<p>Error loading tournaments.</p>`;
	}

	// Delete tournament form
	const deleteForm = document.createElement('form');
	deleteForm.innerHTML = `
		<h3>Delete Tournament</h3>
		<input type="text" id="delete-name" placeholder="Tournament Name" required />
		<button type="submit">Delete</button>
	`;
	container.appendChild(deleteForm);

	deleteForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = (document.getElementById('delete-name') as HTMLInputElement).value;

		const res = await fetch('/api/tournaments', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ name })
		});

		const result = await res.json();
		if (res.ok) {
			alert(result.message);
			renderTournamentsPage(container); // refresh view
		} 
		else
			alert(`Error: ${result.error}`);
	});
}
