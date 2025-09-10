import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderSettingsPage(container: HTMLElement) {
	container.innerHTML = `
		<h2>${t.playerSettings}</h2>

		<button id="show-users">${t.showAllUsers}</button>
		<button id="show-stats">${t.showUserStats}</button>

		<h3>${t.deleteUser}</h3>
		<label>
			${t.enterUsernameToDelete}
			<input type="text" id="delete-username" />
		</label>
		<button id="delete-user">${t.deleteUserBtn}</button>

		<div id="result"></div>
	`;

	const result = document.getElementById('result') as HTMLDivElement;
	const showUsersBtn = document.getElementById('show-users') as HTMLButtonElement;
	const showStatsBtn = document.getElementById('show-stats') as HTMLButtonElement;
	const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;

	showUsersBtn.addEventListener('click', async () => {
		try {
			const response = await fetch('/users');
			if (!response.ok) throw new Error(t.failedToFetchUsers);

			const users = await response.json();
			result.innerHTML = `
				<h3>${t.allUsers}</h3>
				<ul>
					${users.map((user: any) => `<li>${user.name} (${user.username}) - ${user.team}</li>`).join('')}
				</ul>`;
		} catch (err) {
			result.innerText = `${(err as Error).message}`;
		}
	});

	showStatsBtn.addEventListener('click', async () => {
		try {
			const response = await fetch('/stats');
			if (!response.ok) throw new Error(t.failedToFetchStats);

			const stats = await response.json();
			result.innerHTML = `
				<h3>${t.userStats}</h3>
				<ul>
					${stats.map((stat: any) => `
						<li>
							${t.userId}: ${stat.user_id}, ${t.matchesPlayed}: ${stat.matches_played}, ${t.wins}: ${stat.matches_won}, ${t.losses}: ${stat.matches_lost}, 
							${t.pointsScored}: ${stat.points_scored}, ${t.pointsConceded}: ${stat.points_conceded}, ${t.winRate}: ${(stat.win_rate * 100).toFixed(2)}%
						</li>`).join('')}
				</ul>`;
		} catch (err) {
			result.innerText = `${(err as Error).message}`;
		}
	});

	deleteBtn.addEventListener('click', async () => {
		const usernameToDelete = (document.getElementById('delete-username') as HTMLInputElement).value.trim();
		if (!usernameToDelete) {
			result.innerText = t.enterUsernameWarning;
			return;
		}

		try {
			const response = await fetch('/users');
			if (!response.ok) throw new Error(t.failedToFetchUsers);

			const users = await response.json();
			const user = users.find((u: any) => u.username === usernameToDelete);

			if (!user) {
				result.innerText = `${t.userNotFound} "${usernameToDelete}"`;
				return;
			}

			await fetch(`/users/${user.id}`, { method: 'DELETE' });
			result.innerText = `🗑️ ${t.userDeleted} "${usernameToDelete}" (ID: ${user.id})`;
		} catch (err) {
			result.innerText = `${(err as Error).message}`;
		}
	});
}
