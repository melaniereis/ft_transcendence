import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
    ? localStorage.getItem('preferredLanguage')
    : 'en') as keyof typeof translations;
const t = translations[lang];

const teams = [
    { key: 'hacktivists', displayName: 'Hacktivists', img: 'assets/hacktivists.png' },
    { key: 'bug_busters', displayName: 'Bug Busters', img: 'assets/bugbusters.png' },
    { key: 'logic_league', displayName: 'Logic League', img: 'assets/logicleague.png' },
    { key: 'code_alliance', displayName: 'Code Alliance', img: 'assets/codealliance.png' },
];

export async function renderTeamsPage(container: HTMLElement) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        container.innerHTML = `<p>${t.loginRequired}</p>`;
        return;
    }
    if (!document.getElementById('global-petals')) {
        const petalsContainer = document.createElement('div');
        petalsContainer.id = 'global-petals';
        petalsContainer.className = 'fixed top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0';  // overflow-visible to ensure petals don't get cut off

        for (let i = 0; i < 40; i++) {
            const petal = document.createElement('div');
            const size = Math.random() * 8 + 4; // 4px - 12px
            petal.className = 'bg-pink-300 rounded-full absolute opacity-70';
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.animation = `fall ${2 + Math.random() * 3}s linear infinite`;
            petal.style.animationDelay = `${Math.random() * 5}s`;
            petalsContainer.appendChild(petal);
        }

        document.body.appendChild(petalsContainer);

        // Add fall animation CSS
        const style = document.createElement('style');
        style.innerHTML = `
        @keyframes fall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0.7; }
            50% { opacity: 1; }
            100% { transform: translateY(120vh) rotate(360deg); opacity: 0.7; }
        }`;
        document.head.appendChild(style);
    }

    // 🔧 Set up the container
    container.className = 'min-h-screen pt-28 p-8 font-sans bg-cover bg-center bg-fixed relative z-10';  // pt-28 adds space to avoid the navbar
    container.style.color = '#000'; // black text for contrast with light cards

    container.innerHTML = `
        <div id="teams-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10 relative"></div>
    `;

    const grid = container.querySelector('#teams-grid') as HTMLElement;

    const statsPromises = teams.map(team => fetchTeamStats(team.key));
    const allTeamsStats = await Promise.all(statsPromises);

    allTeamsStats.forEach((members, idx) => {
        const team = teams[idx];
        grid.appendChild(createTeamStatsCard(team, members));
    });
}

// 🧩 Team Card Creator
function createTeamStatsCard(team: { key: string; displayName: string; img: string }, members: any[] | null) {
    const card = document.createElement('div');
    card.className = 'relative bg-white bg-opacity-80 rounded-xl shadow-lg p-6 flex flex-col text-black overflow-hidden';

    // 🖼️ Team image
    card.innerHTML = `
        <div class="flex justify-center mb-6 relative z-10">
            <img src="${team.img}" alt="${team.displayName}" class="w-24 h-24 rounded-full object-cover border-4 border-indigo-400" />
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'flex-grow overflow-auto text-center relative z-10';

    if (!members || members.length === 0) {
        content.innerHTML = `<p>${t.noMembersFound} ${formatTeamName(team.key)}</p>`;
    } else {
        const avgWinRate = members.reduce((sum: number, m: any) => sum + (m.win_rate ?? 0), 0) / members.length;

        content.innerHTML = `
            <p class="italic mb-2 text-lg">${t.averageWinRate}: <span class="font-semibold">${avgWinRate.toFixed(2)}%</span></p>
            <ul class="text-lg max-h-48 overflow-y-auto space-y-4 text-left">
                ${members.map((member: any) => `
                    <li class="border-b border-gray-300 pb-2">
                        <strong class="block mb-1 text-indigo-700">${member.members}</strong>
                        <div>${t.wins}: ${member.victories}</div>
                        <div>${t.losses}: ${member.defeats}</div>
                        <div>${t.tournamentsWon}: ${member.tournaments_won}</div>
                        <div>${t.winRate}: ${(member.win_rate ?? 0).toFixed(2)}%</div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    card.appendChild(content);
    return card;
}

// 🧠 Helper: Format team name
function formatTeamName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// 🌐 Fetch team stats
async function fetchTeamStats(teamKey: string) {
    try {
        const response = await fetch(`/api/teams/${teamKey}`);
        if (!response.ok) throw new Error(t.failedToLoadTeamStats);
        const members = await response.json();
        members.sort((a: any, b: any) => b.win_rate - a.win_rate);
        return members;
    } catch (err) {
        console.error(`Error loading stats for ${teamKey}:`, err);
        return null;
    }
}
