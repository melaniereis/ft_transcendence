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
import {Language} from '../types/language.js';

// Button references
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

	friendRequestsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
	if (isLoggedIn) {
		updateFriendRequestsBadge();
		setOnlineOnLoad();
	}
}

// 🧠 Event Listeners
playBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderPlayerSelection(appDiv);
});

settingsBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderSettingsPage(appDiv);
});

tournamentsBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderTournamentsPage(appDiv);
});

teamsBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderTeamsPage(appDiv);
});

loginBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderLoginForm(appDiv, updateUIBasedOnAuth);
});

registerBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderRegistrationForm(appDiv);
});

logoutBtn.addEventListener('click', () => {
	localStorage.removeItem('authToken');
	appDiv.innerHTML = '<p>You have been logged out.</p>';
	updateUIBasedOnAuth();
});

profileBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderProfilePage(appDiv);
});

friendRequestsBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderFriendRequestsPage(appDiv);
});

quickPlayBtn.addEventListener('click', () => {
	appDiv.innerHTML = '';
	renderQuickGameSetup(appDiv);
});

matchmakingBtn.addEventListener('click', () => {
	const playerId = Number(localStorage.getItem('playerId'));
	const playerName = localStorage.getItem('playerName') || 'Unknown';
	const difficulty = 'normal';
	startMatchmaking(appDiv, playerId, playerName, difficulty);
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

// In index.ts - replace the DOMContentLoaded section
document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('authToken');
	if (token) {
		// Verify token is still valid
		try {
			const response = await fetch('/api/protected', {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				// Token is valid, start activity monitoring
				const { startActivityMonitoring } = await import('./services/renderLoginForm.js');
				startActivityMonitoring();

				// Set user as online
				await updateOnlineStatus(true);

				// Update friend requests badge
				updateFriendRequestsBadge();
			} else {
				// Token is invalid, remove it
				localStorage.removeItem('authToken');
				updateUIBasedOnAuth();
			}
		} 
		catch (error) {
			console.error('Error verifying token on page load:', error);
			localStorage.removeItem('authToken');
			updateUIBasedOnAuth();
		}
	}
});

// Add this helper function to index.ts
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
	} 
	catch (error) {
		console.error('Failed to set online on load:', error);
	}
}

// Toggle language options visibility
languageBtn.addEventListener('click', () => {
	languageOptions.style.display = languageOptions.style.display === 'none' ? 'block' : 'none';
});

// Handle language selection
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

// 🚀 Initialize UI
const storedLang = localStorage.getItem('preferredLanguage') || 'en';
applyLanguage(storedLang);
updateUIBasedOnAuth();