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

// 🧭 Route rendering logic with smooth background change
// Route rendering logic with fade-out and fade-in background effect
function renderRoute(path: string): void {
  appDiv.innerHTML = ''; // Clear current content

  // Start fade-out before changing background
  appDiv.classList.add('fade-out');

  // After the fade-out animation is completed, change the background
  setTimeout(() => {
    // Change the background based on the current route
    setBackgroundForRoute(path);

    // Wait for the background change to finish and fade-in the new content
    appDiv.classList.remove('fade-out'); // Remove fade-out class
    appDiv.classList.add('fade-in'); // Apply fade-in

    // After fade-in animation ends, remove fade-in class
    setTimeout(() => {
      appDiv.classList.remove('fade-in');
    }, 1000); // Wait for 1s (matching opacity fade-in time)

    // Render the appropriate content
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
  }, 1000); // Delay background change to sync with fade-out duration
}

// Function to set background based on route
// Function to set background based on route
function setBackgroundForRoute(route: string): void {
  let backgroundUrl = ''; // Default background

  // Set the background URL based on the current route
  switch (route) {
    case '/play':
      backgroundUrl = 'url("https://geekculture.co/wp-content/uploads/2018/08/Screen-Shot-2018-08-14-at-12.03.49-PM.jpg")';
      break;
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
      backgroundUrl = 'url("https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/software/switch/70070000024948/a58ef68683b6fe60a74972d0233e05332c66fa59b95139ba634c4f29cc90f578")';
      break;
    case '/matchmaking':
      backgroundUrl = 'url("https://www.thisiscolossal.com/wp-content/uploads/2018/09/Gris-1.jpg")';
      break;
    default:
      backgroundUrl = 'url("https://images.gog-statics.com/2711f1155f42d68a57c9ad2fb755a49839e6bc17a22b4a0bc262b0e35cb73115.jpg")'; // Default background
  }

  // Apply the new background with transition effect
  appDiv.style.transition = 'background-image 1s ease-in-out';
  appDiv.style.backgroundImage = backgroundUrl;
  appDiv.style.backgroundSize = 'cover'; /* Ensure the image always covers the full background */
  appDiv.style.backgroundPosition = 'center'; /* Center the image */
}



// 🔄 Update UI based on login state
function updateUIBasedOnAuth(): void {
  const token = localStorage.getItem('authToken');
  const isLoggedIn = !!token;

  // Show/hide buttons based on login state
  friendRequestsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

  playBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  settingsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  tournamentsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  teamsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  profileBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  matchmakingBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

  // Quick Play button should only be visible when NOT logged in
  quickPlayBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

  loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
  registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

  if (isLoggedIn) {
    updateFriendRequestsBadge();
    setOnlineOnLoad();
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

// 🧭 Event Listeners for Navigation
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

languageBtn.addEventListener('click', () => {
  const isHidden = getComputedStyle(languageOptions).display === 'none';
  languageOptions.style.display = isHidden ? 'block' : 'none';
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

  playBtn.innerHTML = `🎮 ${t.play}`;
  settingsBtn.innerHTML = `⚙️ ${t.settings}`;
  tournamentsBtn.innerHTML = `🏆 ${t.tournaments}`;
  teamsBtn.innerHTML = `👥 ${t.teams}`;
  loginBtn.innerHTML = `🔑 ${t.login}`;
  logoutBtn.innerHTML = `🚪 ${t.logout}`;
  registerBtn.innerHTML = `📝 ${t.register}`;
  profileBtn.innerHTML = `👤 ${t.profile}`;
  friendRequestsBtn.innerHTML = `🤝 ${t.friendRequests}`;
  quickPlayBtn.innerHTML = `⚡ ${t.quickPlay}`;
  matchmakingBtn.innerHTML = `🎯 ${t.matchmaking}`;
  languageBtn.innerHTML = `🌐 ${t.language}`;
}

// 🚀 Apply language preference
const storedLang = localStorage.getItem('preferredLanguage') || 'en';
applyLanguage(storedLang);
