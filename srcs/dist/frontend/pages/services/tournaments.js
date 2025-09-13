export function renderTournamentsPage(container) {
    container.innerHTML = `
		<h2>Tournaments</h2>
		<button id="new-tournament">New Tournament</button>
		<button id="show-stats">Show Stats</button>
		<div id="tournament-results"></div>`;
    const newTournamentBtn = document.getElementById('new-tournament');
    const showStatsBtn = document.getElementById('show-stats');
    const resultDiv = document.getElementById('tournament-results');
    newTournamentBtn.addEventListener('click', () => {
        alert('New Tournament feature coming soon!');
    });
    showStatsBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('../../backend/routes/tournamentRouts');
            if (!response.ok)
                throw new Error('Failed to fetch tournaments');
            const tournaments = await response.json();
            if (tournaments.length === 0) {
                resultDiv.innerHTML = '<p>No tournaments found.</p>';
                return;
            }
            resultDiv.innerHTML = `
				<h3>All Tournaments:</h3>
				<ul>
				${tournaments.map((t) => `
					<li>
					<strong>${t.name}</strong> - Winner: ${t.team_winner}, 
					Victories: ${t.team_victories}, 
					Size: ${t.size}
					</li>
				`).join('')}
				</ul>`;
        }
        catch (err) {
            resultDiv.innerText = `❌ Failed to load tournaments: ${err.message}`;
        }
    });
}
