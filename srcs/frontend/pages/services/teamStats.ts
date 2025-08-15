export async function renderTeamStats(container: HTMLElement, team: string) {
try {
	const response = await fetch(`/api/teams/${team}`);
	if (!response.ok) throw new Error('Failed to load team stats');

	const members = await response.json();

	if (members.length === 0) {
	container.innerHTML = `<p>No members found for ${team.replace('_', ' ')}</p>`;
	return;
	}

	container.innerHTML = `
	<h2>${formatTeamName(team)} Stats</h2>
	<ul>
		${members.map((member: any) => `
		<li>
			<strong>${member.members}</strong> — Wins: ${member.victories}, 
			Losses: ${member.defeats}, 
			Tournaments Won: ${member.tournaments_won}, 
			Win Rate: ${member.win_rate.toFixed(2)}%
		</li>
		`).join('')}
	</ul>
	`;
} catch (err) {
	container.innerHTML = `<p>❌ Error loading team stats: ${(err as Error).message}</p>`;
}
}

function formatTeamName(name: string): string {
return name
	.replace('_', ' ')
	.replace(/\b\w/g, c => c.toUpperCase());
}
