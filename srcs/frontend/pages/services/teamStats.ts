import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
    ? localStorage.getItem('preferredLanguage')
    : 'en') as keyof typeof translations;
const t = translations[lang];

export async function renderTeamStats(container: HTMLElement, team: string) {
    try {
        const response = await fetch(`/api/teams/${team}`);
        if (!response.ok) 
            throw new Error(t.failedToLoadTeamStats);

        const members = await response.json();

        if (members.length === 0) {
            container.innerHTML = `<p>${t.noMembersFound} ${formatTeamName(team)}</p>`;
            return;
        }

        members.sort((a: any, b: any) => b.win_rate - a.win_rate);

        const avgWinRate = members.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / members.length;

        container.innerHTML = `
            <h2>${formatTeamName(team)} ${t.stats}</h2>
            <p><em>${t.averageWinRate}: ${avgWinRate.toFixed(2)}%</em></p>
            <ul>
                ${members.map((member: any) => `
                    <li>
                        <strong>${member.members}</strong> — 
                        ${t.wins}: ${member.victories}, 
                        ${t.losses}: ${member.defeats}, 
                        ${t.tournamentsWon}: ${member.tournaments_won}, 
                        ${t.winRate}: ${(member.win_rate ?? 0).toFixed(2)}%
                    </li>
                `).join('')}
            </ul>`;
    } catch (err) {
        container.innerHTML = `<p>${t.errorLoadingTeamStats}: ${(err as Error).message}</p>`;
    }
}

function formatTeamName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
