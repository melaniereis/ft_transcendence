import { renderPlayMenu } from './services/renderPlayMenu.js';
import { renderSettingsPage } from './services/settings.js';
import { renderTournamentsPage } from './services/tournaments.js';
import { renderTeamsPage } from './services/teams.js';
import { renderRegistrationForm } from './services/renderRegistrationForm.js';
import { renderLoginForm, startActivityMonitoring } from './services/renderLoginForm.js';
import { renderProfilePage } from './services/renderProfilePage.js';
import { renderFriendRequestsPage } from './services/renderFriendRequestPage.js';

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
  profileBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

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

logoutBtn.addEventListener('click', async () => {
  // Update status to offline before logout
  const token = localStorage.getItem('authToken');
  if (token) {
      try {
          await fetch('/api/profile/status', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ online: false })
          });
      } catch (error) {
          console.error('Failed to update status on logout:', error);
      }
  }
  
  localStorage.removeItem('authToken');
  appDiv.innerHTML = '<p>You have been logged out.</p>';
  updateUIBasedOnAuth();
  
  // Clean up activity monitoring
  document.removeEventListener('visibilitychange', () => {});
  window.removeEventListener('beforeunload', () => {});
});

profileBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderProfilePage(appDiv);
});

// Update friend requests badge
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

// Friend requests button event listener
friendRequestsBtn.addEventListener('click', () => {
  appDiv.innerHTML = '';
  renderFriendRequestsPage(appDiv);
});

// 🚀 Initialize UI
updateUIBasedOnAuth();


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
    } catch (error) {
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
  } catch (err) {
    console.error('Failed to set online on load:', err);
  }
}