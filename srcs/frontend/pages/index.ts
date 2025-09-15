import { renderPlayMenu } from './services/renderPlayMenu.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournament/tournaments.js';
import { renderTeamsPage } from './services/teams.js';
import { renderRegistrationForm } from './services/renderRegistrationForm.js';
import { renderLoginForm } from './services/renderLoginForm.js';
import { renderProfilePage } from './services/renderProfilePage/profile.js';
import { renderFriendRequestsPage } from './services/renderFriendRequestPage.js';
import { startMatchmaking } from './services/remote/matchmaking.js';
import { renderQuickGameSetup } from './services/quickGame/quickGame.js';
import { renderPlayerSelection } from './services/renderPlayerSelection.js';
import { translations } from './services/language/translations.js';
import { Language } from '../types/language.js';

// DOM elements
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement | null;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement | null;
const profileBtn = document.getElementById('profile-btn') as HTMLButtonElement;
const friendRequestsBtn = document.getElementById('friend-requests-btn') as HTMLButtonElement;
const friendRequestsBadge = document.getElementById('friend-requests-badge') as HTMLSpanElement;
const quickPlayBtn = document.getElementById('quick-play-btn') as HTMLButtonElement;  // NEW
const appDiv = document.getElementById('app') as HTMLDivElement;
const languageBtn = document.getElementById('language-btn') as HTMLButtonElement;
const languageOptions = document.getElementById('language-options') as HTMLDivElement;

// Route navigation
export function navigateTo(path: string): void {
	history.pushState({}, '', path);
	renderRoute(path);
}

window.onpopstate = () => {
	renderRoute(window.location.pathname);
};

// Route rendering
export function renderRoute(path: string): void {
	appDiv.innerHTML = '';
	appDiv.classList.add('fade-out');

	setTimeout(() => {
		setBackgroundForRoute(path);
		appDiv.classList.remove('fade-out');
		appDiv.classList.add('fade-in');

		switch (path) {
			case '/play':
				renderPlayerSelection(appDiv);
				break;
			case '/settings':
				renderSettingsPage(appDiv);
				break;
			case '/tournaments':
				renderTournamentsPage(appDiv);
				break;
			case '/teams':
				renderTeamsPage(appDiv);
				break;
			case '/login':
				renderLoginForm(appDiv, async () => {
					updateUIBasedOnAuth();
					await updateFriendRequestsBadge();
					await setOnlineOnLoad();
					navigateTo('/');
				});
				break;
			case '/register':
				renderRegistrationForm(appDiv);
				break;
			case '/profile':
				renderProfilePage(appDiv);
				break;
			case '/friends':
				renderFriendRequestsPage(appDiv);
				break;
			case '/quick-play':  // NEW route for Quick Play
				renderQuickGameSetup(appDiv);
				break;
			case '/matchmaking':
				const playerId = Number(localStorage.getItem('playerId'));
				const playerName = localStorage.getItem('playerName') || 'Unknown';
				const difficulty = 'normal';
				startMatchmaking(appDiv, playerId, playerName, difficulty);
				break;
			default:
				appDiv.innerHTML = `
					<div style="display: flex; flex-direction: column; height: 100vh; padding: 80px 20px; text-align: center;">
						<h1 style="font-size: 4rem; font-weight: 900; color: #f0f0f0; margin: 0;">Welcome to</h1>
						
						<div style="height: 400px;"></div>

						<h1 style="font-size: 6rem; font-weight: 1000; color: #f0f0f0; margin: 0;">PONG</h1>
					</div>
					`;
		}
	}, 500);
}

// Set background image for route
function setBackgroundForRoute(route: string): void {
	let backgroundUrl = '';

	switch (route) {
		case '/settings':
			backgroundUrl = 'url("https://cdn.staticneo.com/ew/thumb/c/c8/Gris_Ch2-2_Kp08J.jpg/730px-Gris_Ch2-2_Kp08J.jpg")';
			break;
		case '/tournaments':
			backgroundUrl = 'url("https://i0.wp.com/epiloguegaming.com/wp-content/uploads/2019/02/IMG_20190225_191501.jpg?fit=1280%2C720&ssl=1")';
			break;
		case '/teams':
			backgroundUrl = 'url("https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/683320/ss_631d99cc6462cce94081032b7e600a6b87c3f7d3.1920x1080.jpg?t=1755285422")';
			break;
		case '/friends':
			backgroundUrl = 'url("/Background4.jpg")';
			break;
		case '/matchmaking':
			backgroundUrl = 'url("https://assets.rockpapershotgun.com/images/2018/12/GRIS-a.jpg")';
			break;
		default:
			backgroundUrl = 'url("https://images.gog-statics.com/2711f1155f42d68a57c9ad2fb755a49839e6bc17a22b4a0bc262b0e35cb73115.jpg")'; // Default background
	}

	appDiv.style.backgroundImage = backgroundUrl;
}

// UI updates
export function updateUIBasedOnAuth(): void {
	const isLoggedIn = !!localStorage.getItem('authToken');

	friendRequestsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	playBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	settingsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	teamsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	profileBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

	if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
	if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

	// Show Quick Play only if NOT logged in
	if (quickPlayBtn) quickPlayBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

	if (isLoggedIn) {
		updateFriendRequestsBadge();
		setOnlineOnLoad();
	}
}


export async function updateFriendRequestsBadge(): Promise<void> {
	const pendingCount = await fetchPendingFriendRequests();
	if (pendingCount > 0) {
		friendRequestsBadge.textContent = pendingCount.toString();
		friendRequestsBadge.style.display = 'inline-block';
	} else {
		friendRequestsBadge.style.display = 'none';
	}
}

export async function fetchPendingFriendRequests(): Promise<number> {
	// Mock API call; replace with actual API call to fetch pending friend requests count
	return new Promise(resolve => setTimeout(() => resolve(3), 300));
}

export async function setOnlineOnLoad(): Promise<void> {
	const token = localStorage.getItem('authToken');
	if (!token) return;

	try {
		await fetch('/api/online', {
			method: 'POST',
			headers: { 'Authorization': `Bearer ${token}` }
		});
	} catch (err) {
		console.error('Failed to set online:', err);
	}
}

export async function updateOnlineStatus(isOnline: boolean): Promise<void> {
	const token = localStorage.getItem('authToken');
	if (!token) return;

	try {
		await fetch('/api/online', {
			method: isOnline ? 'POST' : 'DELETE',
			headers: { 'Authorization': `Bearer ${token}` }
		});
	} catch (err) {
		console.error('Failed to update status:', err);
	}
}

export function applyLanguage(lang: string): void {
	const safeLang = (['en', 'es', 'pt'].includes(lang) ? lang : 'en') as Language;
	const t = translations[safeLang];

	playBtn.innerHTML = `🎮 ${t.play}`;
	settingsBtn.innerHTML = `⚙️ ${t.settings}`;
	teamsBtn.innerHTML = `👥 ${t.teams}`;
	if (loginBtn) loginBtn.innerHTML = `🔑 ${t.login}`;
	if (logoutBtn) logoutBtn.innerHTML = `🚪 ${t.logout}`;
	if (registerBtn) registerBtn.innerHTML = `📝 ${t.register}`;
	profileBtn.innerHTML = `👤 ${t.profile}`;
	friendRequestsBtn.innerHTML = `📧 ${t.friendRequests}`;
	languageBtn.innerHTML = `🌐 ${t.language}`;

	// Quick Play button label
	if (quickPlayBtn) quickPlayBtn.textContent = `⚡ ${t.quickPlay || 'Quick Play'}`;

	const playOptionPlay = document.getElementById('play-play');
	const playOptionTournament = document.getElementById('play-tournament');
	const playOptionMatchmaking = document.getElementById('play-matchmaking');

	if (playOptionPlay) playOptionPlay.textContent = t.play;
	if (playOptionTournament) playOptionTournament.textContent = t.tournaments;
	if (playOptionMatchmaking) playOptionMatchmaking.textContent = t.matchmaking;
}

// Event listeners for buttons
quickPlayBtn?.addEventListener('click', () => navigateTo('/quick-play'));

languageBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	languageOptions.classList.toggle('hidden');
});

languageOptions.querySelectorAll('button').forEach((btn) => {
	btn.addEventListener('click', () => {
		const lang = btn.getAttribute('data-lang') || 'en';
		localStorage.setItem('preferredLanguage', lang);
		applyLanguage(lang);
		location.reload();
	});
});

document.addEventListener('click', (e) => {
	if (!languageOptions.contains(e.target as Node) && e.target !== languageBtn) {
		languageOptions.classList.add('hidden');
	}
});

const playOptions = document.getElementById('play-options');
document.getElementById('play-tournament')?.addEventListener('click', () => navigateTo('/tournaments'));
document.getElementById('play-play')?.addEventListener('click', () => navigateTo('/play'));
document.getElementById('play-matchmaking')?.addEventListener('click', () => navigateTo('/matchmaking'));

registerBtn?.addEventListener('click', () => navigateTo('/register'));
loginBtn?.addEventListener('click', () => navigateTo('/login'));
logoutBtn.addEventListener('click', () => {
	localStorage.clear();
	updateUIBasedOnAuth();
	navigateTo('/');
});
settingsBtn.addEventListener('click', () => navigateTo('/settings'));
teamsBtn.addEventListener('click', () => navigateTo('/teams'));
profileBtn.addEventListener('click', () => navigateTo('/profile'));
friendRequestsBtn.addEventListener('click', () => navigateTo('/friends'));

// Initial page load setup
window.onload = () => {
	const lang = localStorage.getItem('preferredLanguage') || 'en';
	applyLanguage(lang);
	updateUIBasedOnAuth();
	renderRoute(window.location.pathname);
};
