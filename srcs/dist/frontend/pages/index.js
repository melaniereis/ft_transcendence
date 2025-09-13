import { renderAuthModal, renderUserListModal } from './services/render.js';
import { circleRotation } from './animations/circleRotation.js';
import { renderPlayMenu } from './services/renderPlayMenu.js';
const playMenuPlayBtn = document.getElementById('playMenu-play-btn');
const playBtn = document.getElementById('play-btn');
const loginBtn = document.getElementById('login-btn');
const settingsBtn = document.getElementById('settings-btn');
const tournamentsBtn = document.getElementById('tournaments-btn');
const logoutBtn = document.getElementById('logout-btn');
const usersBtn = document.getElementById('users-btn');
const profileBtn = document.getElementById('profile-btn');
const appDiv = document.getElementById('app');
console.log('Setting up button event listeners...');
// 🧠 Event Listeners
playMenuPlayBtn.addEventListener('click', () => {
    appDiv.innerHTML = '';
    renderPlayMenu(appDiv);
});
// Check if user is logged in
function isUserLoggedIn() {
    const userData = localStorage.getItem('currentUser');
    return userData !== null;
}
// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        }
        catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('currentUser');
            return null;
        }
    }
    return null;
}
// Show/hide buttons based on login state
function updateButtonVisibility() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (isUserLoggedIn()) {
        // User is logged in - change login button to profile, show logout
        if (loginBtn) {
            loginBtn.textContent = 'Profile';
            loginBtn.style.display = 'block';
        }
        if (logoutBtn)
            logoutBtn.style.display = 'block';
    }
    else {
        // User is not logged in - show login, hide logout
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.style.display = 'block';
        }
        if (logoutBtn)
            logoutBtn.style.display = 'none';
    }
}
// Check if user is already logged in and restore their name
function restoreUserSession() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const centerText = document.getElementById('center-text');
            if (centerText && user.name) {
                centerText.textContent = user.name.toUpperCase();
                console.log(`Restored session for user: ${user.name}`);
            }
        }
        catch (err) {
            console.error('Error restoring user session:', err);
            localStorage.removeItem('currentUser'); // Clear invalid data
        }
    }
    updateButtonVisibility();
}
// Show logout button
function showLogoutButton() {
    console.log('showLogoutButton called');
    const logoutBtn = document.getElementById('logout-btn');
    console.log('logoutBtn element:', logoutBtn);
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
        console.log('Logout button should now be visible');
    }
    else {
        console.error('Logout button not found in DOM');
    }
}
// Hide logout button
function hideLogoutButton() {
    console.log('hideLogoutButton called');
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
        console.log('Logout button hidden');
    }
}
// Logout function
function logout() {
    // Clear user data
    localStorage.removeItem('currentUser');
    // Reset center text to PONG
    const centerText = document.getElementById('center-text');
    if (centerText) {
        centerText.textContent = 'PONG';
    }
    // Update button visibility
    updateButtonVisibility();
    console.log('User logged out');
}
// Restore user session on page load
restoreUserSession();
// Initialize circle rotation system
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the circles animation to load
    setTimeout(() => {
        circleRotation.init('rotatable-circle');
    }, 1000);
});
// Function to show indicator for a button
function showIndicator(buttonId) {
    const indicatorId = buttonId.replace('-btn', '-indicator');
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
        indicator.classList.add('active');
    }
}
// Function to hide indicator for a button
function hideIndicator(buttonId) {
    const indicatorId = buttonId.replace('-btn', '-indicator');
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
        indicator.classList.remove('active');
    }
}
// Function to hide all indicators
function hideAllIndicators() {
    const indicators = document.querySelectorAll('.button-indicator');
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
}
// Add hover effects to buttons
function addButtonHoverEffects() {
    const buttons = ['play-btn', 'login-btn', 'settings-btn', 'tournaments-btn', 'logout-btn', 'users-btn'];
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('mouseenter', () => {
                showIndicator(buttonId);
            });
            button.addEventListener('mouseleave', () => {
                hideIndicator(buttonId);
            });
        }
    });
}
playBtn;
// Initialize hover effects
addButtonHoverEffects();
// Navigation handlers
function setupNavigationHandlers() {
    // Play button handler
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = 'game.html';
        });
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupNavigationHandlers();
});
// Existing event listeners
if (playBtn) {
    console.log('playBtn found');
    playBtn.addEventListener('click', () => {
        if (isUserLoggedIn()) {
            // Redirect to game.html if logged in
            window.location.href = 'game.html';
        }
        else {
            console.log('User not logged in - opening registration form');
            renderAuthModal('register'); // Open with register tab for new players
        }
    });
}
if (loginBtn) {
    console.log('loginBtn found');
    loginBtn.addEventListener('click', () => {
        if (!isUserLoggedIn()) {
            // User not logged in - show login modal
            console.log('Login button clicked - opening auth modal');
            renderAuthModal('login');
        }
        else {
            console.log('Profile button clicked - redirecting to profile.html');
            window.location.href = 'profile.html';
        }
    });
}
if (settingsBtn) {
    console.log('settingsBtn found');
    settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked - opening user list modal');
        renderUserListModal(); // Show all users
    });
}
if (tournamentsBtn) {
    console.log('tournamentsBtn found');
    tournamentsBtn.addEventListener('click', () => {
        console.log('Tournaments button clicked - opening auth modal');
        renderAuthModal('login'); // Open with login tab active for tournaments/settings
    });
}
if (logoutBtn) {
    console.log('logoutBtn found');
    logoutBtn.addEventListener('click', () => {
        console.log('Logout button clicked');
        logout();
    });
}
if (usersBtn) {
    console.log('usersBtn found');
    usersBtn.addEventListener('click', () => {
        console.log('Users button clicked - opening user list modal');
        renderUserListModal();
    });
}
// Function to setup play button after SVG loads
function setupPlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        console.log('SVG play button found, adding event listener');
        playBtn.addEventListener('click', () => {
            if (isUserLoggedIn()) {
                // Redirect to game.html if logged in
                window.location.href = 'game.html';
            }
            else {
                console.log('User not logged in - opening registration form');
                renderAuthModal('register'); // Open with register tab for new players
            }
        });
    }
    else {
        console.log('SVG play button not found');
    }
}
window.setupPlayButton = setupPlayButton; // Make setupPlayButton available globally// Call setupPlayButton from circles loading function
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the circles animation to load
    setTimeout(() => {
        circleRotation.init('rotatable-circle');
        setupPlayButton(); // Setup play button after SVG loads
    }, 1000);
});
// Listen for SVG play button clicks
window.addEventListener('svgPlayButtonClicked', () => {
    console.log('Received SVG play button click event');
    if (isUserLoggedIn()) {
        window.location.href = 'game.html';
    }
    else {
        console.log('User not logged in - opening registration form');
        renderAuthModal('register');
    }
});
