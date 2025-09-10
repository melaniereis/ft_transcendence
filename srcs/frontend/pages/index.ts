// (Imports remain the same)
import { renderPlayMenu } from './services/renderPlayMenu.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournament/tournaments.js';
import { renderTeamsPage } from './services/teams.js';
import { renderRegistrationForm } from './services/renderRegistrationForm.js';
import { renderLoginForm, startActivityMonitoring } from './services/renderLoginForm.js';
import { renderProfilePage } from './services/renderProfilePage/profile.js';
import { renderFriendRequestsPage } from './services/renderFriendRequestPage.js';
import { startMatchmaking } from './services/remote/matchmaking.js';
import { renderQuickGameSetup } from './services/quickGame/quickGame.js'
import { renderPlayerSelection } from './services/renderPlayerSelection.js';
import { translations } from './services/language/translations.js';
import { Language } from '../types/language.js';

// DOM references (unchanged)
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const tournamentsBtn = document.getElementById('tournaments-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement;
const profileBtn = document.getElementById('profile-btn') as HTMLButtonElement;
const friendRequestsBtn = document.getElementById('friend-requests-btn') as HTMLButtonElement;
const friendRequestsBadge = document.getElementById('friend-requests-badge') as HTMLSpanElement;
const matchmakingBtn = document.getElementById('matchmaking-btn') as HTMLButtonElement;
const quickPlayBtn = document.getElementById('quick-play-btn') as HTMLButtonElement;
const appDiv = document.getElementById('app') as HTMLDivElement;
const languageBtn = document.getElementById('language-btn') as HTMLButtonElement;
const languageOptions = document.getElementById('language-options') as HTMLDivElement;

// 🔁 Navigation handler
function navigateTo(path: string): void {
	history.pushState({}, '', path);
	renderRoute(path);
}

// 🧭 Handle back/forward buttons
window.onpopstate = () => {
	renderRoute(window.location.pathname);
};

// 🧭 Route rendering logic
function renderRoute(path: string): void {
	appDiv.innerHTML = '';

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
			renderLoginForm(appDiv, updateUIBasedOnAuth);
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
		case '/quick-play':
			renderQuickGameSetup(appDiv);
			break;
		case '/matchmaking':
			const playerId = Number(localStorage.getItem('playerId'));
			const playerName = localStorage.getItem('playerName') || 'Unknown';
			const difficulty = 'normal';
			startMatchmaking(appDiv, playerId, playerName, difficulty);
			break;
		default:
			appDiv.innerHTML = '<p>Welcome! Please select a menu option.</p>';
			break;
	}
}

// 🔄 Update UI based on login state
function updateUIBasedOnAuth(): void {
	const token = localStorage.getItem('authToken');
	const isLoggedIn = !!token;

	friendRequestsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

	if (isLoggedIn)
		updateFriendRequestsBadge();

	playBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	settingsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	tournamentsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	teamsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	profileBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	matchmakingBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

	loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
	registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

	if (isLoggedIn) {
		updateFriendRequestsBadge();
		setOnlineOnLoad();
	}
}

// 🧠 Event Listeners (Updated to use navigation)
playBtn.addEventListener('click', () => navigateTo('/play'));
settingsBtn.addEventListener('click', () => navigateTo('/settings'));
tournamentsBtn.addEventListener('click', () => navigateTo('/tournaments'));
teamsBtn.addEventListener('click', () => navigateTo('/teams'));
loginBtn.addEventListener('click', () => navigateTo('/login'));
registerBtn.addEventListener('click', () => navigateTo('/register'));
profileBtn.addEventListener('click', () => navigateTo('/profile'));
friendRequestsBtn.addEventListener('click', () => navigateTo('/friends'));
quickPlayBtn.addEventListener('click', () => navigateTo('/quick-play'));

logoutBtn.addEventListener('click', () => {
	localStorage.removeItem('authToken');
	appDiv.innerHTML = '<p>You have been logged out.</p>';
	updateUIBasedOnAuth();
});

// Matchmaking handled separately (since it uses localStorage data)
matchmakingBtn.addEventListener('click', () => {
	navigateTo('/matchmaking');
});

// 🔔 Update friend requests badge
export async function updateFriendRequestsBadge() {
	const token = localStorage.getItem('authToken');
	if (!token) return;

	try {
		const response = await fetch('/api/friends/pending', {
			headers: { 'Authorization': `Bearer ${token}` }
		});

		if (response.ok) {
			const data = await response.json();
			const pendingCount = data.pending?.length || 0;

			if (pendingCount > 0) {
				friendRequestsBadge.textContent = pendingCount.toString();
				friendRequestsBadge.style.display = 'block';
			} else {
				friendRequestsBadge.style.display = 'none';
			}
		}
	} catch (error) {
		console.error('Error updating friend requests badge:', error);
	}
}

// 🌐 On page load
document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('authToken');
	if (token) {
		try {
			const response = await fetch('/api/protected', {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				const { startActivityMonitoring } = await import('./services/renderLoginForm.js');
				startActivityMonitoring();
				await updateOnlineStatus(true);
				updateFriendRequestsBadge();
			} else {
				localStorage.removeItem('authToken');
			}
		} catch (error) {
			console.error('Error verifying token on page load:', error);
			localStorage.removeItem('authToken');
		}
	}

	updateUIBasedOnAuth();
	renderRoute(window.location.pathname); // ← load initial route
});

// 🌐 Set online status
async function updateOnlineStatus(isOnline: boolean) {
	const token = localStorage.getItem('authToken');
	if (!token) return;

	try {
		await fetch('/api/profile/status', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ online: isOnline })
		});
		console.log(`Status updated to: ${isOnline ? 'online' : 'offline'}`);
	} catch (error) {
		console.error('Failed to update status:', error);
	}
}

async function setOnlineOnLoad() {
	const token = localStorage.getItem('authToken');
	if (!token) return;
	try {
		await fetch('/api/profile/status', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ online: true })
		});
	} catch (error) {
		console.error('Failed to set online on load:', error);
	}
}

// 🌐 Language
languageBtn.addEventListener('click', () => {
	languageOptions.style.display = languageOptions.style.display === 'none' ? 'block' : 'none';
});

languageOptions.querySelectorAll('button').forEach(btn => {
	btn.addEventListener('click', () => {
		const selectedLang = btn.getAttribute('data-lang') || 'en';
		localStorage.setItem('preferredLanguage', selectedLang);
		applyLanguage(selectedLang);
		languageOptions.style.display = 'none';
	});
});

function applyLanguage(lang: string) {
	const safeLang = (['en', 'es', 'pt'].includes(lang) ? lang : 'en') as Language;
	const t = translations[safeLang];

	playBtn.textContent = t.play;
	settingsBtn.textContent = t.settings;
	tournamentsBtn.textContent = t.tournaments;
	teamsBtn.textContent = t.teams;
	loginBtn.textContent = t.login;
	logoutBtn.textContent = t.logout;
	registerBtn.textContent = t.register;
	profileBtn.textContent = t.profile;
	friendRequestsBtn.textContent = t.friendRequests;
	quickPlayBtn.textContent = t.quickPlay;
	matchmakingBtn.textContent = t.matchmaking;
	languageBtn.textContent = t.language;
}

// 🚀 Apply language preference
const storedLang = localStorage.getItem('preferredLanguage') || 'en';
applyLanguage(storedLang);
