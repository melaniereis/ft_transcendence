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
import { renderIntroScreen } from './services/renderIntro/renderIntro.js';
import { renderLocalTournamentPage } from './services/quickTournament/quickTournament.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const playOptions = document.getElementById('play-options') as HTMLDivElement;
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
			'/Background2.jpg',
			'/Background5.jpg',
			'/Background7.jpg',
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
		if (path !== '/' && path !== '' && loaderWindow)
			loaderWindow.style.display = 'none';

		if (path === '/' || path === '') {
			if (!isLoggedIn) {
				showLoaderAndRenderIntro(appDiv);
			}
			else {
				appDiv.innerHTML = `
					<div style="display: flex; flex-direction: column; height: 100vh; padding: 80px 20px; text-align: center;">
						<h1 style="font-size: 6rem; font-weight: 900; color: #f0f0f0; margin: 200;">${t.welcomeTo}</h1>
						
						<div style="height: 400px;"></div>

						<h1 style="font-size: 8rem; font-weight: 1000; color: #f0f0f0; margin: 0;margin-top: 200px;">PONG</h1>
					</div>
					`;
			}
			return;
		}
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
						<h1 style="font-size: 6rem; font-weight: 900; color: #f0f0f0; margin: 200;">${t.welcomeTo}</h1>
						
						<div style="height: 400px;"></div>

						<h1 style="font-size: 8rem; font-weight: 1000; color: #f0f0f0; margin: 0;margin-top: 200px;">PONG</h1>
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
		
		// Re-setup play button after login to ensure it works
		setTimeout(() => {
			setupPlayButton();
		}, 100); // Small delay to ensure DOM is updated
	}
}

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
	applyLanguage(localStorage.getItem('preferredLanguage') || 'en');
	if (token) {
		try {
			const response = await fetch('/api/protected', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (response.ok) {
				const { startActivityMonitoring } = await import('./services/activity.js');
				startActivityMonitoring();
				await updateOnlineStatus(true);
				await updateFriendRequestsBadge();
				isLoggedIn = true;
			} else {
				localStorage.removeItem('authToken');
			}
		} 
		catch (error) {
			console.error('Error verifying token on page load:', error);
			localStorage.removeItem('authToken');
		}
	}

	updateUIBasedOnAuth();

	if (document.readyState === 'complete') {
		if (isLoggedIn && loaderWindow) loaderWindow.style.display = 'none';
			renderRoute(window.location.pathname);
	} 
	else {
		window.addEventListener('load', () => {
			if (isLoggedIn && loaderWindow) loaderWindow.style.display = 'none';
				renderRoute(window.location.pathname);
		});
	}
});

function fadeButtonAndNavigate(btn: HTMLButtonElement, navFn: () => void) {
	btn.classList.add('fade-btn-out');
	setTimeout(() => {
		btn.classList.remove('fade-btn-out');
		btn.classList.add('fade-btn-in');
		navFn();
		setTimeout(() => {
			btn.classList.remove('fade-btn-in');
		}, 380);
	}, 380);
}

const playOptionsMap: Record<string, string> = {
	'play-play': '/play',
	'play-matchmaking': '/matchmaking',
	'play-tournament': '/tournaments',
};

languageOptions.querySelectorAll('button[data-lang]').forEach(btn => {
	btn.addEventListener('click', () => {
		const selectedLang = btn.getAttribute('data-lang');
		if (selectedLang) {
		localStorage.setItem('preferredLanguage', selectedLang);
		languageOptions.classList.add('hidden');  
		applyLanguage(selectedLang);
		location.reload();
		}
	});
});

playOptions.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const route = playOptionsMap[target.id];
    if (route) {
        // Hide the dropdown and clear any inline styles
        playOptions.classList.add('hidden');
        playOptions.style.display = '';
        playOptions.style.visibility = '';
        playOptions.style.opacity = '';
        navigateTo(route);
    }
});

if (settingsBtn) {
	settingsBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(settingsBtn, () => navigateTo('/settings'));
	});
}
if (teamsBtn) {
	teamsBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(teamsBtn, () => navigateTo('/teams'));
	});
}
if (loginBtn) {
	loginBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(loginBtn, () => navigateTo('/login'));
	});
}
if (registerBtn) {
	registerBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(registerBtn, () => navigateTo('/register'));
	});
}
if (profileBtn) {
	profileBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(profileBtn, () => navigateTo('/profile'));
	});
}
if (friendRequestsBtn) {
	friendRequestsBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(friendRequestsBtn, () => navigateTo('/friends'));
	});
}
if (tournamentsBtn) {
	tournamentsBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(tournamentsBtn, () => navigateTo('/tournaments'));
	});
}
if (quickPlayBtn) {
	quickPlayBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(quickPlayBtn, () => navigateTo('/quick-play'));
	});
}
if (matchmakingBtn) {
	matchmakingBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(matchmakingBtn, () => navigateTo('/matchmaking'));
	});
}
if (quickTournamentBtn) {
	quickTournamentBtn.addEventListener('click', () => {
		fadeButtonAndNavigate(quickTournamentBtn, () => navigateTo('/quick-tournament'));
	});
}

if (logoutBtn) {
	logoutBtn.addEventListener('click', () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('playerId');
		localStorage.removeItem('playerName');
		updateUIBasedOnAuth();
		navigateTo('/');
	});
}

if (languageBtn && languageOptions) {
	languageBtn.addEventListener('click', () => {
		if (languageOptions.classList.contains('hidden'))
			languageOptions.classList.remove('hidden');
		else
			languageOptions.classList.add('hidden');
	});
}

// Store reference to the play button click handler to avoid multiple listeners
let playButtonClickHandler: ((e: Event) => void) | null = null;

// Function to setup play button with fresh DOM references
function setupPlayButton() {
	const playBtnElement = document.getElementById('play-btn') as HTMLButtonElement;
	const playOptionsElement = document.getElementById('play-options') as HTMLDivElement;
	
	if (playBtnElement && playOptionsElement) {
		// Clear any inline styles that might interfere
		playOptionsElement.style.display = '';
		playOptionsElement.style.visibility = '';
		playOptionsElement.style.opacity = '';
		
		// Remove existing event listener if it exists
		if (playButtonClickHandler) {
			playBtnElement.removeEventListener('click', playButtonClickHandler);
		}
		
		// Create new event handler
		playButtonClickHandler = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			
			if (playOptionsElement.classList.contains('hidden')) {
				playOptionsElement.classList.remove('hidden');
			} else {
				playOptionsElement.classList.add('hidden');
			}
		};
		
		// Add the new event listener
		playBtnElement.addEventListener('click', playButtonClickHandler);
		
		console.log('Play button setup completed');
		return true;
	} else {
		console.error('Play button or play options not found during setup:', { playBtnElement, playOptionsElement });
		return false;
	}
}

// Initial setup if elements exist
if (playBtn && playOptions) {
	setupPlayButton();
} else {
	console.error('Play button or play options not found at initialization:', { playBtn, playOptions });
}

document.addEventListener('click', (event) => {
	const target = event.target as HTMLElement;

	// Use fresh DOM queries for language dropdown
	const currentLanguageOptions = document.getElementById('language-options') as HTMLDivElement;
	const currentLanguageBtn = document.getElementById('language-btn') as HTMLButtonElement;
	
	if (currentLanguageOptions && currentLanguageBtn && !currentLanguageOptions.contains(target) && !currentLanguageBtn.contains(target)) {
		if (!currentLanguageOptions.classList.contains('hidden'))
			currentLanguageOptions.classList.add('hidden');
	}

	// Use fresh DOM queries for play dropdown
	const currentPlayOptions = document.getElementById('play-options') as HTMLDivElement;
	const currentPlayBtn = document.getElementById('play-btn') as HTMLButtonElement;
	
	if (currentPlayOptions && currentPlayBtn && target !== currentPlayBtn && !currentPlayOptions.contains(target)) {
		if (!currentPlayOptions.classList.contains('hidden')) {
			currentPlayOptions.classList.add('hidden');
			// Clear any inline styles
			currentPlayOptions.style.display = '';
			currentPlayOptions.style.visibility = '';
			currentPlayOptions.style.opacity = '';
		}
	}
});

export async function updateFriendRequestsBadge(): Promise<void> {
	const token = localStorage.getItem('authToken');
	if (!token) {
		if (friendRequestsBadge) friendRequestsBadge.style.display = 'none';
		return;
	}
	try {
		const response = await fetch('/api/friendRequests/count', {
			headers: { 'Authorization': `Bearer ${token}` }
		});
		if (!response.ok) throw new Error('Failed to fetch friend requests count');
		const { count } = await response.json();
		if (friendRequestsBadge) {
			if (count > 0) {
				friendRequestsBadge.textContent = count.toString();
				friendRequestsBadge.style.display = 'inline-block';
			} else {
				friendRequestsBadge.style.display = 'none';
			}
		}
	} catch (error) {
		console.error('Error updating friend requests badge:', error);
	}
}

async function setOnlineOnLoad(): Promise<void> {
	const token = localStorage.getItem('authToken');
	if (!token) 
		return;
	await updateOnlineStatus(true);
}

async function updateOnlineStatus(isOnline: boolean): Promise<void> {
	const token = localStorage.getItem('authToken');
	if (!token) return;
	try {
		await fetch('/api/profile/status', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ online: isOnline })
		});
	} 
	catch (error) {
		console.error('Failed to update online status:', error);
	}
}

export function applyLanguage(lang: string): void {
	const playOptionPlay = document.getElementById('play-play');
	const playOptionTournament = document.getElementById('play-tournament');
	const playOptionMatchmaking = document.getElementById('play-matchmaking');
	if (playOptionPlay) 
		playOptionPlay.textContent = `${t.play}`;
	if (playOptionTournament) 
		playOptionTournament.textContent = `${t.tournaments}`;
	if (playOptionMatchmaking) 
		playOptionMatchmaking.textContent = `${t.matchmaking}`;
}