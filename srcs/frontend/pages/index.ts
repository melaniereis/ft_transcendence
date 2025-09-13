// srcs/frontend/pages/index.ts
// Updated to include Gris-inspired main menu when not logged in

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
import { CelestialAnimations, initializeCelestialAnimations } from './CelestialAnimations.js';

// DOM elements - Top bar
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement | null;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement | null;
const profileBtn = document.getElementById('profile-btn') as HTMLButtonElement;
const friendRequestsBtn = document.getElementById('friend-requests-btn') as HTMLButtonElement;
const friendRequestsBadge = document.getElementById('friend-requests-badge') as HTMLSpanElement;
const appDiv = document.getElementById('app') as HTMLDivElement;
const languageBtn = document.getElementById('language-btn') as HTMLButtonElement;
const languageOptions = document.getElementById('language-options') as HTMLDivElement;
const topBar = document.getElementById('top-bar') as HTMLDivElement;

// Gris main menu elements
const grisMainMenu = document.getElementById('gris-main-menu') as HTMLDivElement;
const grisLoginBtn = document.getElementById('gris-login') as HTMLButtonElement;
const grisRegisterBtn = document.getElementById('gris-register') as HTMLButtonElement;
const grisLanguageBtn = document.getElementById('gris-language-btn') as HTMLButtonElement;
const grisLanguageOptions = document.getElementById('gris-language-options') as HTMLDivElement;

// Celestial animations instance
let celestialAnimations: CelestialAnimations | null = null;

// Route navigation
export function navigateTo(path: string): void {
	history.pushState({}, '', path);
	renderRoute(path);
}

window.onpopstate = () => {
	renderRoute(window.location.pathname);
};

// Route rendering with Gris menu integration
export function renderRoute(path: string): void {
	const isLoggedIn = !!localStorage.getItem('authToken');

	// Hide Gris menu when navigating to specific routes (unless showing it)
	if (path !== '/' || isLoggedIn) {
		hideGrisMainMenu();
	}

	appDiv.innerHTML = '';
	appDiv.classList.add('fade-out');

	setTimeout(() => {
		setBackgroundForRoute(path);
		appDiv.classList.remove('fade-out');
		appDiv.classList.add('fade-in');

		switch (path) {
			case '/play':
				if (isLoggedIn) {
					renderPlayerSelection(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/settings':
				if (isLoggedIn) {
					renderSettingsPage(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/tournaments':
				if (isLoggedIn) {
					renderTournamentsPage(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/teams':
				if (isLoggedIn) {
					renderTeamsPage(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/login':
				hideGrisMainMenu();
				renderLoginForm(appDiv, async () => {
					updateUIBasedOnAuth();
					await updateFriendRequestsBadge();
					await setOnlineOnLoad();
					navigateTo('/');
				});
				break;
			case '/register':
				hideGrisMainMenu();
				renderRegistrationForm(appDiv);
				break;
			case '/profile':
				if (isLoggedIn) {
					renderProfilePage(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/friends':
				if (isLoggedIn) {
					renderFriendRequestsPage(appDiv);
				} else {
					showGrisMainMenu();
				}
				break;
			case '/quick-play':
				hideGrisMainMenu();
				renderQuickGameSetup(appDiv);
				break;
			case '/matchmaking':
				if (isLoggedIn) {
					const playerId = Number(localStorage.getItem('playerId'));
					const playerName = localStorage.getItem('playerName') || 'Unknown';
					const difficulty = 'normal';
					startMatchmaking(appDiv, playerId, playerName, difficulty);
				} else {
					showGrisMainMenu();
				}
				break;
			default:
				if (isLoggedIn) {
					hideGrisMainMenu();
					appDiv.innerHTML = `
                        <div style="display: flex; flex-direction: column; height: 100vh; justify-content: space-between; padding: 80px 20px; text-align: center;">
                            <h1 style="font-size: 4rem; font-weight: 900; color: #f0f0f0;">Welcome to</h1>
                            <h1 style="font-size: 6rem; font-weight: 1000; color: #f0f0f0;">PONG</h1>
                        </div>
                    `;
				} else {
					showGrisMainMenu();
				}
				break;
		}
	}, 500);
}

// Show Gris main menu
function showGrisMainMenu(): void {
	if (grisMainMenu) {
		grisMainMenu.classList.add('active');
		// Wait for DOM to be ready and canvases to exist
		if (!celestialAnimations) {
			if (document.readyState === 'complete' || document.readyState === 'interactive') {
				celestialAnimations = initializeCelestialAnimations();
			} else {
				window.addEventListener('DOMContentLoaded', () => {
					celestialAnimations = initializeCelestialAnimations();
				});
			}
		} else {
			celestialAnimations.startAnimation();
		}
	}
	// Hide regular app content
	appDiv.style.display = 'none';
}

// Hide Gris main menu
function hideGrisMainMenu(): void {
	if (grisMainMenu) {
		grisMainMenu.classList.remove('active');
		if (celestialAnimations) {
			celestialAnimations.stopAnimation();
		}
	}
	// Show regular app content
	appDiv.style.display = 'block';
}

// Set background image for route
function setBackgroundForRoute(route: string): void {
	let backgroundUrl = ''; // Default background

	// Set the background URL based on the current route
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
		case '/friend-requests':
			backgroundUrl = 'url("assets/Background4.jpg")';
			break;
		case '/matchmaking':
			backgroundUrl = 'url("https://assets.rockpapershotgun.com/images/2018/12/GRIS-a.jpg")';
			break;
		default:
			backgroundUrl = 'url("https://images.gog-statics.com/2711f1155f42d68a57c9ad2fb755a49839e6bc17a22b4a0bc262b0e35cb73115.jpg")'; // Default background
	}

	// Apply the new background (only matters when app div is visible)
	appDiv.style.backgroundImage = backgroundUrl;
}

// UI updates based on authentication status
export function updateUIBasedOnAuth(): void {
	const isLoggedIn = !!localStorage.getItem('authToken');

	if (isLoggedIn) {
		// Hide Gris menu and show top bar elements
		hideGrisMainMenu();

		// Show logged-in elements
		friendRequestsBtn.style.display = 'inline-block';
		playBtn.style.display = 'inline-block';
		settingsBtn.style.display = 'inline-block';
		teamsBtn.style.display = 'inline-block';
		logoutBtn.style.display = 'inline-block';
		profileBtn.style.display = 'inline-block';

		// Hide login/register buttons
		if (loginBtn) loginBtn.style.display = 'none';
		if (registerBtn) registerBtn.style.display = 'none';

		updateFriendRequestsBadge();
		setOnlineOnLoad();
	} else {
		// Show Gris menu when not logged in
		showGrisMainMenu();

		// Hide logged-in elements
		friendRequestsBtn.style.display = 'none';
		playBtn.style.display = 'none';
		settingsBtn.style.display = 'none';
		teamsBtn.style.display = 'none';
		logoutBtn.style.display = 'none';
		profileBtn.style.display = 'none';

		// Show login/register buttons in top bar (though Gris menu will be primary)
		if (loginBtn) loginBtn.style.display = 'inline-block';
		if (registerBtn) registerBtn.style.display = 'inline-block';
	}
}

// Gris menu event listeners
function setupGrisMenuEventListeners(): void {
	// Gris Login button
	grisLoginBtn?.addEventListener('click', () => {
		fadeGrisButtonAndNavigate(grisLoginBtn, () => navigateTo('/login'));
	});

	// Gris Register button
	grisRegisterBtn?.addEventListener('click', () => {
		fadeGrisButtonAndNavigate(grisRegisterBtn, () => navigateTo('/register'));
	});

	// Gris Language selector
	grisLanguageBtn?.addEventListener('click', (e) => {
		e.stopPropagation();
		grisLanguageOptions?.classList.toggle('hidden');
	});

	// Gris Language option buttons
	grisLanguageOptions?.querySelectorAll('button').forEach(btn => {
		btn.addEventListener('click', () => {
			const selectedLang = btn.getAttribute('data-lang') || 'en';
			localStorage.setItem('preferredLanguage', selectedLang);
			applyLanguage(selectedLang);
			grisLanguageOptions?.classList.add('hidden');
		});
	});

	// Close gris language dropdown on outside click
	document.addEventListener('click', (e) => {
		if (!grisLanguageOptions?.contains(e.target as Node) && e.target !== grisLanguageBtn) {
			grisLanguageOptions?.classList.add('hidden');
		}
	});
}

// Fade button effect for Gris menu
function fadeGrisButtonAndNavigate(btn: HTMLButtonElement, navFn: () => void): void {
	btn.style.transform = 'translateY(2px)';
	btn.style.opacity = '0.7';

	setTimeout(() => {
		btn.style.transform = 'translateY(-2px)';
		btn.style.opacity = '1';
		navFn();

		setTimeout(() => {
			btn.style.transform = 'translateY(0)';
		}, 200);
	}, 150);
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

	// Update top bar buttons
	playBtn.innerHTML = `🎮 ${t.play}`;
	settingsBtn.innerHTML = `⚙️ ${t.settings}`;
	teamsBtn.innerHTML = `👥 ${t.teams}`;
	if (loginBtn) loginBtn.innerHTML = `🔑 ${t.login}`;
	if (logoutBtn) logoutBtn.innerHTML = `🚪 ${t.logout}`;
	if (registerBtn) registerBtn.innerHTML = `📝 ${t.register}`;
	profileBtn.innerHTML = `👤 ${t.profile}`;
	friendRequestsBtn.innerHTML = `📧 ${t.friendRequests}`;
	languageBtn.innerHTML = `🌐 ${t.language}`;

	// Update Gris menu buttons
	if (grisLoginBtn) grisLoginBtn.innerHTML = `🔑 ${t.login}`;
	if (grisRegisterBtn) grisRegisterBtn.innerHTML = `📝 ${t.register}`;
	if (grisLanguageBtn) grisLanguageBtn.innerHTML = `🌐 ${t.language}`;

	// Update play dropdown options
	const playOptionPlay = document.getElementById('play-play');
	const playOptionTournament = document.getElementById('play-tournament');
	const playOptionMatchmaking = document.getElementById('play-matchmaking');
	if (playOptionPlay) playOptionPlay.textContent = t.play;
	if (playOptionTournament) playOptionTournament.textContent = t.tournaments;
	if (playOptionMatchmaking) playOptionMatchmaking.textContent = t.matchmaking;
}

// Language handling for top bar
languageBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	languageOptions.classList.toggle('hidden');
});

languageOptions.querySelectorAll('button').forEach((btn) => {
	btn.addEventListener('click', () => {
		const lang = btn.getAttribute('data-lang') || 'en';
		localStorage.setItem('preferredLanguage', lang);
		applyLanguage(lang);
		languageOptions.classList.add('hidden');
	});
});

document.addEventListener('click', (e) => {
	if (!languageOptions.contains(e.target as Node) && e.target !== languageBtn) {
		languageOptions.classList.add('hidden');
	}
});

// Play dropdown
const playOptions = document.getElementById('play-options');
document.getElementById('play-tournament')?.addEventListener('click', () => navigateTo('/tournaments'));
document.getElementById('play-play')?.addEventListener('click', () => navigateTo('/play'));
document.getElementById('play-matchmaking')?.addEventListener('click', () => navigateTo('/matchmaking'));

// Navigation events
settingsBtn.addEventListener('click', () => navigateTo('/settings'));
teamsBtn.addEventListener('click', () => navigateTo('/teams'));
profileBtn.addEventListener('click', () => navigateTo('/profile'));
friendRequestsBtn.addEventListener('click', () => navigateTo('/friends'));
logoutBtn.addEventListener('click', () => {
	localStorage.removeItem('authToken');
	updateUIBasedOnAuth();
	navigateTo('/');
});
if (loginBtn) loginBtn.addEventListener('click', () => navigateTo('/login'));
if (registerBtn) registerBtn.addEventListener('click', () => navigateTo('/register'));

// Startup logic
document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('authToken');
	if (token) {
		try {
			const res = await fetch('/api/protected', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const { startActivityMonitoring } = await import('./services/activity.js');
				startActivityMonitoring();
				await updateOnlineStatus(true);
				await updateFriendRequestsBadge();
			} else {
				localStorage.removeItem('authToken');
			}
		} catch (err) {
			console.error('Token verification failed:', err);
			localStorage.removeItem('authToken');
		}
	}

	// Setup event listeners
	setupGrisMenuEventListeners();

	updateUIBasedOnAuth();
	const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
	applyLanguage(preferredLang);
	renderRoute(window.location.pathname);
});
