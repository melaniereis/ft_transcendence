export async function renderTeamStats(container: HTMLElement, team: string) {
    try {
        const response = await fetch(`https://localhost:3000/api/teams/${team}`);
        if (!response.ok) 
            throw new Error('Failed to load team stats');

        const members = await response.json();

        if (members.length === 0) {
            container.innerHTML = `<p>No members found for ${formatTeamName(team)}</p>`; // 🟡 Changed to use formatTeamName for consistency
            return;
        }

        members.sort((a: any, b: any) => b.win_rate - a.win_rate);

        const avgWinRate = members.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / members.length;

        container.innerHTML = `
        <h2>${formatTeamName(team)} Stats</h2>
        <p><em>Average Win Rate: ${avgWinRate.toFixed(2)}%</em></p> <!-- 🟡 Added team average win rate -->
        <ul>
            ${members.map((member: any) => `
            <li>
                <strong>${member.members}</strong> — 
                Wins: ${member.victories}, 
                Losses: ${member.defeats}, 
                Tournaments Won: ${member.tournaments_won}, 
                Win Rate: ${(member.win_rate ?? 0).toFixed(2)}% <!-- 🟡 Added fallback for null/undefined win_rate -->
            </li>
            `).join('')}
        </ul>`;
    } 
    catch (err) {
        container.innerHTML = `<p>Error loading team stats: ${(err as Error).message}</p>`;
    }
}

function formatTeamName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}