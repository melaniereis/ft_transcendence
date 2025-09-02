import { renderPlayMenu } from './services/renderPlayMenu.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournament/tournaments.js';
import { renderTeamsPage } from './services/teams.js';
import { renderRegistrationForm } from './services/renderRegistrationForm.js';
import { renderLoginForm } from './services/renderLoginForm.js';
import { renderProfilePage } from './services/renderProfilePage.js';
import { renderFriendRequestsPage } from './services/renderFriendRequestPage.js';
import { startMatchmaking } from './services/remote/matchmaking.js';
import { renderQuickGameSetup } from './services/quickGame/quickGame.js'
import { renderPlayerSelection } from './services/renderPlayerSelection.js';

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

// 🔄 Update UI based on login state
function updateUIBasedOnAuth(): void {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = !!token;

    friendRequestsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    if (isLoggedIn) {
        updateFriendRequestsBadge();
    }

    playBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    settingsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    tournamentsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    teamsBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    profileBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    matchmakingBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

    loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
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

// 🚀 Initialize UI
updateUIBasedOnAuth();
