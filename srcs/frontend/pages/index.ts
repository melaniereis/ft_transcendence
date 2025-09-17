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
const quickPlayBtn = document.getElementById('quick-play-btn') as HTMLButtonElement;  // NEW
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
  renderIntroScreen(appDiv, (route: string) => navigateTo(route));
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

    if (path !== '/' && path !== '' && loaderWindow) {
      loaderWindow.style.display = 'none';
    }

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

  if (document.readyState === 'complete') {
    if (isLoggedIn && loaderWindow) loaderWindow.style.display = 'none';
    renderRoute(window.location.pathname);
  } else {
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
    }, 400);
  }, 380);
}

playBtn.addEventListener('click', () => fadeButtonAndNavigate(playBtn, () => navigateTo('/play')));
settingsBtn.addEventListener('click', () => fadeButtonAndNavigate(settingsBtn, () => navigateTo('/settings')));
tournamentsBtn.addEventListener('click', () => fadeButtonAndNavigate(tournamentsBtn, () => navigateTo('/tournaments')));
teamsBtn.addEventListener('click', () => fadeButtonAndNavigate(teamsBtn, () => navigateTo('/teams')));
if (loginBtn)
  loginBtn.addEventListener('click', () => fadeButtonAndNavigate(loginBtn, () => {
    renderLoginForm(appDiv, () => {
      updateUIBasedOnAuth();
      navigateTo('/');
    });
  }));
if (registerBtn)
  registerBtn.addEventListener('click', () => fadeButtonAndNavigate(registerBtn, () => navigateTo('/register')));
profileBtn.addEventListener('click', () => fadeButtonAndNavigate(profileBtn, () => navigateTo('/profile')));
friendRequestsBtn.addEventListener('click', () => fadeButtonAndNavigate(friendRequestsBtn, () => navigateTo('/friends')));
quickPlayBtn.addEventListener('click', () => fadeButtonAndNavigate(quickPlayBtn, () => navigateTo('/quick-play')));
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('playerId');
  localStorage.removeItem('playerName');
  updateUIBasedOnAuth();
  navigateTo('/');
});
languageBtn.addEventListener('click', () => {
  languageOptions.style.display = languageOptions.style.display === 'block' ? 'none' : 'block';
});
matchmakingBtn.addEventListener('click', () => fadeButtonAndNavigate(matchmakingBtn, () => navigateTo('/matchmaking')));
if (quickTournamentBtn)
  quickTournamentBtn.addEventListener('click', () => fadeButtonAndNavigate(quickTournamentBtn, () => renderLocalTournamentPage(appDiv)));

// Language selection buttons
document.querySelectorAll('#language-options button').forEach(button => {
  button.addEventListener('click', (e) => {
    const selectedLang = (e.target as HTMLButtonElement).dataset.lang as Language;
    if (selectedLang) {
      localStorage.setItem('preferredLanguage', selectedLang);
      window.location.reload();
    }
  });
});

// Update friend requests badge count
async function updateFriendRequestsBadge(): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    friendRequestsBadge.style.display = 'none';
    return;
  }
  try {
    const response = await fetch('/api/friend-requests/count', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const { count } = await response.json();
      if (count > 0) {
        friendRequestsBadge.textContent = count.toString();
        friendRequestsBadge.style.display = 'inline-block';
      } else {
        friendRequestsBadge.style.display = 'none';
      }
    } else {
      friendRequestsBadge.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to update friend requests badge:', error);
    friendRequestsBadge.style.display = 'none';
  }
}

// Online status management
async function updateOnlineStatus(isOnline: boolean): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    await fetch('/api/online-status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ online: isOnline }),
    });
  } catch (error) {
    console.error('Failed to update online status:', error);
  }
}

function setOnlineOnLoad(): void {
  window.addEventListener('focus', () => updateOnlineStatus(true));
  window.addEventListener('blur', () => updateOnlineStatus(false));
  window.addEventListener('beforeunload', () => updateOnlineStatus(false));
}
