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
import { renderIntroScreen } from './services/renderIntro/renderIntro.js';
import { renderLocalTournamentPage } from './services/quickTournament/quickTournament.js';


const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement | null;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement | null;
const profileBtn = document.getElementById('profile-btn') as HTMLButtonElement;
const friendRequestsBtn = document.getElementById('friend-requests-btn') as HTMLButtonElement;
const friendRequestsBadge = document.getElementById('friend-requests-badge') as HTMLSpanElement;
const quickPlayBtn = document.getElementById('quick-play-btn') as HTMLButtonElement;
const appDiv = document.getElementById('app') as HTMLDivElement;
const languageBtn = document.getElementById('language-btn') as HTMLButtonElement;
const languageOptions = document.getElementById('language-options') as HTMLDivElement;
const loaderWindow = document.getElementById('loader-window') as HTMLDivElement;
const tournamentsBtn = document.getElementById('tournaments-btn') as HTMLButtonElement;
const matchmakingBtn = document.getElementById('matchmaking-btn') as HTMLButtonElement;
const quickTournamentBtn = document.getElementById('quick-tournament-btn') as HTMLButtonElement | null;

// Route navigation
export function navigateTo(path: string): void {
	history.pushState({}, '', path);
	renderRoute(path);
}

window.onpopstate = () => {
	renderRoute(window.location.pathname);
};

// Route rendering with fade effect and background change

// Helper to preload images
function preloadImages(urls: string[]): Promise<void[]> {
	return Promise.all(urls.map(url => new Promise<void>((resolve, reject) => {
		const img = new window.Image();
		img.onload = () => resolve();
		img.onerror = () => resolve(); // Ignore errors, resolve anyway
		img.src = url;
	})));
}

// Helper to preload audio
function preloadAudio(url: string): Promise<void> {
	return new Promise<void>((resolve) => {
		const audio = new window.Audio();
		audio.oncanplaythrough = () => resolve();
		audio.onerror = () => resolve();
		audio.src = url;
	});
}

async function showLoaderAndRenderIntro(appDiv: HTMLElement) {
	// Only show loader if NOT logged in
	const token = localStorage.getItem('authToken');
	const isLoggedIn = !!token;
	if (!isLoggedIn && loaderWindow) 
		loaderWindow.style.display = 'flex';
	await Promise.all([
		preloadImages([
			'/Background4.jpg',
			'/Background5.png',
			'/Background.jpg',
			'/Background1.jpg',
			'Background2.jpg',
			'Background5.jpg',
			'Background7.jpg',
		]),
		preloadAudio('/ambient.mp3'),
	]);
	// Render intro visuals and initialize animations before hiding loader
	renderIntroScreen(appDiv, (route: string) => navigateTo(route));
	// Wait a short moment to ensure all animations/canvases are initialized
	setTimeout(() => {
		if (loaderWindow) loaderWindow.style.display = 'none';
	}, 250);
}

function renderRoute(path: string): void {
	appDiv.innerHTML = '';
	appDiv.classList.add('fade-out');
	setTimeout(() => {
		setBackgroundForRoute(path);
		appDiv.classList.remove('fade-out');
		appDiv.classList.add('fade-in');
		const token = localStorage.getItem('authToken');
		const isLoggedIn = !!token;
		// Hide loader for all non-intro routes
		if (path !== '/' && path !== '' && loaderWindow) {
			loaderWindow.style.display = 'none';
		}
		// Only show loader for route '/'
		if (path === '/' || path === '') {
			if (!isLoggedIn) {
				showLoaderAndRenderIntro(appDiv);
			} else {
				appDiv.innerHTML = `
			<div style="
			display: flex;
			height: 100vh;
			justify-content: center;
			align-items: center;
			text-align: center;
			padding: 0 20px;
			">
			<h1 style="
				font-size: 4rem;
				font-weight: 900;
				text-transform: uppercase;
				color: #f0f0f0;
				text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
				letter-spacing: 0.15em;
				max-width: 800px;
				line-height: 1.2;
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			">
				Welcome to GRIS PONG!<br />
			</h1>
			</div>
			`;
			}
			return;
		}
		// Other routes: no loader
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
			case '/quick-tournament':
				renderLocalTournamentPage(appDiv);
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
			backgroundUrl = 'url("/Background1.jpg")';
			break;
		case '/tournaments':
			backgroundUrl = 'url("/Background2.jpg")';
			break;
		case '/teams':
			backgroundUrl = 'url("/Background5.jpg")';
			break;
		case '/friends':
			backgroundUrl = 'url("/Background4.jpg")';
			break;
		case '/matchmaking':
			backgroundUrl = 'url("/Background7.jpg")';
			break;
		default:
			backgroundUrl = 'url("/Background.jpg")';
	}

	appDiv.style.backgroundImage = backgroundUrl;
}

// UI updates
export function updateUIBasedOnAuth(): void {
	const isLoggedIn = !!localStorage.getItem('authToken');

	const topBar = document.getElementById('top-bar') as HTMLElement;
	if (topBar) {
		topBar.style.display = isLoggedIn ? 'flex' : 'none';
	}
	
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

// On page load initialization
// Inject fade-in/fade-out animation styles for buttons
if (!document.getElementById('fade-btn-animations')) {
	const style = document.createElement('style');
	style.id = 'fade-btn-animations';
	style.textContent = `
		.fade-btn-out {
			opacity: 0;
			transform: scale(0.96);
			transition: opacity 0.38s cubic-bezier(.6,.2,.3,1), transform 0.38s cubic-bezier(.6,.2,.3,1);
		}
		.fade-btn-in {
			opacity: 1;
			transform: scale(1);
			transition: opacity 0.38s cubic-bezier(.6,.2,.3,1), transform 0.38s cubic-bezier(.6,.2,.3,1);
		}
	`;
	document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('authToken');
	let isLoggedIn = false;
	if (token) {
		try {
			const response = await fetch('/api/protected', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (response.ok) {
				const { startActivityMonitoring } = await import('./services/activity.js');
				startActivityMonitoring();
				await updateOnlineStatus(true);
				updateFriendRequestsBadge();
				isLoggedIn = true;
			} else {
				localStorage.removeItem('authToken');
			}
		} catch (error) {
			console.error('Error verifying token on page load:', error);
			localStorage.removeItem('authToken');
		}
	}

	updateUIBasedOnAuth();
	// Only render intro screen after all resources are loaded
	if (document.readyState === 'complete') {
		// If logged in, hide loader immediately
		if (isLoggedIn && loaderWindow) loaderWindow.style.display = 'none';
		renderRoute(window.location.pathname);
	} else {
		window.addEventListener('load', () => {
			if (isLoggedIn && loaderWindow) loaderWindow.style.display = 'none';
			renderRoute(window.location.pathname);
		});
	}
});

// Event listeners for navigation buttons
function fadeButtonAndNavigate(btn: HTMLButtonElement, navFn: () => void) {
	btn.classList.add('fade-btn-out');
	setTimeout(() => {
		btn.classList.remove('fade-btn-out');
		btn.classList.add('fade-btn-in');
		navFn();
		setTimeout(() => {
			btn.classList.remove('fade-btn-in');
		}, 400);
	}, 380);
}

playBtn.addEventListener('click', () => fadeButtonAndNavigate(playBtn, () => navigateTo('/play')));
settingsBtn.addEventListener('click', () => fadeButtonAndNavigate(settingsBtn, () => navigateTo('/settings')));
tournamentsBtn.addEventListener('click', () => fadeButtonAndNavigate(tournamentsBtn, () => navigateTo('/tournaments')));
teamsBtn.addEventListener('click', () => fadeButtonAndNavigate(teamsBtn, () => navigateTo('/teams')));
if(loginBtn){
	loginBtn.addEventListener('click', () => fadeButtonAndNavigate(loginBtn, () => {
		renderLoginForm(appDiv, () => {
			updateUIBasedOnAuth();
			navigateTo('/');
		});
	}));
}
if (quickTournamentBtn) {
  quickTournamentBtn.addEventListener('click', () => {
    fadeButtonAndNavigate(quickTournamentBtn, () => navigateTo('/quick-tournament'));
  });
}

if(registerBtn)
	registerBtn.addEventListener('click', () => fadeButtonAndNavigate(registerBtn, () => navigateTo('/register')));

profileBtn.addEventListener('click', () => fadeButtonAndNavigate(profileBtn, () => navigateTo('/profile')));
friendRequestsBtn.addEventListener('click', () => fadeButtonAndNavigate(friendRequestsBtn, () => navigateTo('/friends')));
quickPlayBtn.addEventListener('click', () => fadeButtonAndNavigate(quickPlayBtn, () => navigateTo('/quick-play')));
logoutBtn.addEventListener('click', () => fadeButtonAndNavigate(logoutBtn, () => {
	localStorage.removeItem('authToken');
	updateUIBasedOnAuth();
	if (loaderWindow) loaderWindow.style.display = 'flex';
	setTimeout(() => {
		renderIntroScreen(appDiv, (route: string) => navigateTo(route));
		setTimeout(() => {
			if (loaderWindow) loaderWindow.style.display = 'none';
		}, 250);
	}, 250);
}));
matchmakingBtn.addEventListener('click', () => fadeButtonAndNavigate(matchmakingBtn, () => navigateTo('/matchmaking')));

export async function fetchPendingFriendRequests(): Promise<number> {
	// Mock API call; replace with actual API call to fetch pending friend requests count
	return new Promise(resolve => setTimeout(() => resolve(3), 300));
}

export function applyLanguage(lang: string): void {
	const safeLang = (['en', 'es', 'pt'].includes(lang) ? lang : 'en') as Language;
	const t = translations[safeLang];

	playBtn.innerHTML = `🎮 ${t.play}`;
	settingsBtn.innerHTML = `⚙️ ${t.settings}`;
	teamsBtn.innerHTML = `👥 ${t.teams}`;
	if (loginBtn) 
		loginBtn.innerHTML = `🔑 ${t.login}`;
	if (logoutBtn) 
		logoutBtn.innerHTML = `🚪 ${t.logout}`;
	if (registerBtn) 
		registerBtn.innerHTML = `📝 ${t.register}`;
	profileBtn.innerHTML = `👤 ${t.profile}`;
	friendRequestsBtn.innerHTML = `📧 ${t.friendRequests}`;
	languageBtn.innerHTML = `🌐 ${t.language}`;
	if (quickPlayBtn) 
		quickPlayBtn.textContent = `⚡ ${t.quickPlay || 'Quick Play'}`;
	const playOptionPlay = document.getElementById('play-play');
	const playOptionTournament = document.getElementById('play-tournament');
	const playOptionMatchmaking = document.getElementById('play-matchmaking');
	if (playOptionPlay) 
		playOptionPlay.textContent = t.play;
	if (playOptionTournament) 
		playOptionTournament.textContent = t.tournaments;
	if (playOptionMatchmaking) 
		playOptionMatchmaking.textContent = t.matchmaking;
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

	// Only update the text node after the SVG for each button, preserving SVG markup
	function setButtonText(btn: HTMLButtonElement, text: string) {
		if (!btn) return;
		// Find the first text node after the SVG
		const svg = btn.querySelector('svg');
		if (svg) {
			// Remove all text nodes after SVG
			let next = svg.nextSibling;
			while (next) {
				const toRemove = next;
				next = next.nextSibling;
				if (toRemove.nodeType === Node.TEXT_NODE || (toRemove.nodeType === Node.ELEMENT_NODE && toRemove.nodeName === 'SPAN')) {
					btn.removeChild(toRemove);
				}
			}
			// Add a single space and the new text
			btn.appendChild(document.createTextNode(' ' + text));
		}
	}

	setButtonText(playBtn, t.play);
	setButtonText(settingsBtn, t.settings);
	setButtonText(tournamentsBtn, t.tournaments);
	setButtonText(teamsBtn, t.teams);
	if(loginBtn)
		setButtonText(loginBtn, t.login);
	setButtonText(logoutBtn, t.logout);
	if(registerBtn)
		setButtonText(registerBtn, t.register);
	setButtonText(profileBtn, t.profile);
	setButtonText(friendRequestsBtn, t.friendRequests);
	setButtonText(quickPlayBtn, t.quickPlay);
	setButtonText(matchmakingBtn, t.matchmaking);
	setButtonText(languageBtn, t.language);
	

// On load, apply preferred language
const storedLang = localStorage.getItem('preferredLanguage') || 'en';
applyLanguage(storedLang);

// Export friend requests badge update function
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

// Update online status
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

languageBtn.addEventListener('click', () => {
	const isHidden = getComputedStyle(languageOptions).display === 'none';
	languageOptions.style.display = isHidden ? 'block' : 'none';
});
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
