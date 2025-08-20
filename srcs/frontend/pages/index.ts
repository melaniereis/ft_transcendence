import { renderPlayMenu } from './services/renderPlayMenu.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournament/tournaments.js';
import { renderTeamsPage } from './services/teams.js';
import { renderRegistrationForm } from './services/renderRegistrationForm.js';
import { renderLoginForm } from './services/renderLoginForm.js';

// Button references
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const tournamentsBtn = document.getElementById('tournaments-btn') as HTMLButtonElement;
const teamsBtn = document.getElementById('teams-btn') as HTMLButtonElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement;

const appDiv = document.getElementById('app') as HTMLDivElement;

// 🔄 Update UI based on login state
function updateUIBasedOnAuth(): void {
  const token = localStorage.getItem('authToken');
  const isLoggedIn = !!token;

  playBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  settingsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  tournamentsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  teamsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

  loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
  registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
}

// 🧠 Event Listeners
playBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderPlayMenu(appDiv);
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

// 🚀 Initialize UI
updateUIBasedOnAuth();
