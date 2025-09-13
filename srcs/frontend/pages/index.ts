// srcs/frontend/pages/index.ts - Simplified main entry point

import { GrisMenuController, createGrisMenuController } from './GrisMenuController.js';
import { grisTransitions } from './GrisMenuTransitions.js';

// Define custom event types
interface GrisNavigateEvent extends CustomEvent {
	detail: { path: string };
}

interface GrisLanguageChangeEvent extends CustomEvent {
	detail: { language: 'en' | 'es' | 'pt' };
}

interface AuthSuccessEvent extends CustomEvent {
	detail: { user: User };
}

interface AuthErrorEvent extends CustomEvent {
	detail: { error: string };
}

// App state management
interface AppState {
	isLoggedIn: boolean;
	currentUser: User | null;
	currentPage: string;
	language: 'en' | 'es' | 'pt';
}

interface User {
	id: string;
	name: string;
	username: string;
	team?: string;
}

class GrisPongApp {
	private static instance: GrisPongApp;
	private state: AppState;
	private grisMenuController: GrisMenuController;
	private appElement: HTMLElement | null = null;

	constructor() {
		this.state = {
			isLoggedIn: false,
			currentUser: null,
			currentPage: 'menu',
			language: this.getStoredLanguage()
		};

		// Initialize Gris menu controller
		this.grisMenuController = createGrisMenuController({
			enableAnimations: true,
			enableParticles: true,
			enableSound: true,
			language: this.state.language
		});
	}

	public static getInstance(): GrisPongApp {
		if (!GrisPongApp.instance) {
			GrisPongApp.instance = new GrisPongApp();
		}
		return GrisPongApp.instance;
	}

	/**
	 * Initialize the application
	 */
	public async initialize(): Promise<void> {
		console.log('Initializing Gris Pong App...');

		// Get app container
		this.appElement = document.getElementById('app');
		if (!this.appElement) {
			console.error('App container not found');
			return;
		}

		// Initialize menu controller
		await this.grisMenuController.initialize();

		// Setup global event listeners
		this.setupGlobalEventListeners();

		// Check authentication state
		this.checkAuthState();

		// Show appropriate UI
		this.updateUI();

		console.log('Gris Pong App initialized successfully');
	}

	/**
	 * Get stored language preference
	 */
	private getStoredLanguage(): 'en' | 'es' | 'pt' {
		try {
			const stored = localStorage.getItem('preferredLanguage') as 'en' | 'es' | 'pt';
			return stored || 'en';
		} catch {
			return 'en';
		}
	}

	/**
	 * Setup global event listeners
	 */
	private setupGlobalEventListeners(): void {
		// Navigation events from Gris menu
		window.addEventListener('gris-navigate', ((e: GrisNavigateEvent) => {
			const { path } = e.detail;
			this.navigate(path);
		}) as EventListener);

		// Language change events
		window.addEventListener('gris-language-changed', ((e: GrisLanguageChangeEvent) => {
			const { language } = e.detail;
			this.updateLanguage(language);
		}) as EventListener);

		// Top bar navigation
		this.setupTopBarEventListeners();

		// Authentication events
		this.setupAuthEventListeners();
	}

	/**
	 * Setup top bar event listeners
	 */
	private setupTopBarEventListeners(): void {
		// Play button handlers
		const playTournament = document.getElementById('play-tournament');
		const playPlay = document.getElementById('play-play');
		const playMatchmaking = document.getElementById('play-matchmaking');

		if (playTournament) {
			playTournament.addEventListener('click', () => this.navigate('/tournament'));
		}

		if (playPlay) {
			playPlay.addEventListener('click', () => this.navigate('/play'));
		}

		if (playMatchmaking) {
			playMatchmaking.addEventListener('click', () => this.navigate('/matchmaking'));
		}

		// Other navigation buttons
		const teamsBtn = document.getElementById('teams-btn');
		const friendRequestsBtn = document.getElementById('friend-requests-btn');
		const profileBtn = document.getElementById('profile-btn');
		const settingsBtn = document.getElementById('settings-btn');
		const logoutBtn = document.getElementById('logout-btn');

		if (teamsBtn) {
			teamsBtn.addEventListener('click', () => this.navigate('/teams'));
		}

		if (friendRequestsBtn) {
			friendRequestsBtn.addEventListener('click', () => this.navigate('/friend-requests'));
		}

		if (profileBtn) {
			profileBtn.addEventListener('click', () => this.navigate('/profile'));
		}

		if (settingsBtn) {
			settingsBtn.addEventListener('click', () => this.navigate('/settings'));
		}

		if (logoutBtn) {
			logoutBtn.addEventListener('click', () => this.logout());
		}

		// Top bar login/register buttons
		const topLoginBtn = document.getElementById('login-btn');
		const topRegisterBtn = document.getElementById('register-btn');

		if (topLoginBtn) {
			topLoginBtn.addEventListener('click', () => this.navigate('/login'));
		}

		if (topRegisterBtn) {
			topRegisterBtn.addEventListener('click', () => this.navigate('/register'));
		}
	}

	/**
	 * Setup authentication event listeners
	 */
	private setupAuthEventListeners(): void {
		// Listen for successful authentication
		window.addEventListener('auth-success', ((e: AuthSuccessEvent) => {
			const { user } = e.detail;
			this.handleAuthSuccess(user);
		}) as EventListener);

		// Listen for auth errors
		window.addEventListener('auth-error', ((e: AuthErrorEvent) => {
			const { error } = e.detail;
			this.handleAuthError(error);
		}) as EventListener);
	}

	/**
	 * Check authentication state on app load
	 */
	private checkAuthState(): void {
		try {
			const storedUser = localStorage.getItem('currentUser');
			const authToken = localStorage.getItem('authToken');

			if (storedUser && authToken) {
				this.state.currentUser = JSON.parse(storedUser);
				this.state.isLoggedIn = true;
			}
		} catch (error) {
			console.warn('Failed to check auth state:', error);
			this.clearAuthData();
		}
	}

	/**
	 * Handle successful authentication
	 */
	private handleAuthSuccess(user: User): void {
		this.state.currentUser = user;
		this.state.isLoggedIn = true;

		try {
			localStorage.setItem('currentUser', JSON.stringify(user));
		} catch (error) {
			console.warn('Failed to store user data:', error);
		}

		this.updateUI();
		this.navigate('/dashboard');
	}

	/**
	 * Handle authentication error
	 */
	private handleAuthError(error: string): void {
		console.error('Authentication error:', error);
		this.clearAuthData();
		this.updateUI();
		this.showNotification(error, 'error');
	}

	/**
	 * Clear authentication data
	 */
	private clearAuthData(): void {
		this.state.currentUser = null;
		this.state.isLoggedIn = false;

		try {
			localStorage.removeItem('currentUser');
			localStorage.removeItem('authToken');
		} catch (error) {
			console.warn('Failed to clear auth data:', error);
		}
	}

	/**
	 * Logout user
	 */
	private logout(): void {
		this.clearAuthData();
		this.updateUI();
		this.navigate('/');
		this.showNotification('Logged out successfully', 'success');
	}

	/**
	 * Update language
	 */
	private updateLanguage(language: 'en' | 'es' | 'pt'): void {
		this.state.language = language;
		this.grisMenuController.updateLanguage(language);

		try {
			localStorage.setItem('preferredLanguage', language);
		} catch (error) {
			console.warn('Failed to save language preference:', error);
		}
	}

	/**
	 * Navigate to a specific route
	 */
	public navigate(path: string): void {
		console.log(`Navigating to: ${path}`);

		this.state.currentPage = path;

		// Handle navigation based on path
		switch (path) {
			case '/':
			case '/menu':
				this.showMainMenu();
				break;
			case '/login':
				this.showLoginForm();
				break;
			case '/register':
				this.showRegistrationForm();
				break;
			case '/dashboard':
				this.showDashboard();
				break;
			case '/profile':
				this.showProfile();
				break;
			case '/settings':
				this.showSettings();
				break;
			case '/play':
				this.showGameInterface();
				break;
			case '/tournament':
				this.showTournament();
				break;
			case '/matchmaking':
				this.showMatchmaking();
				break;
			case '/teams':
				this.showTeams();
				break;
			case '/friend-requests':
				this.showFriendRequests();
				break;
			default:
				this.show404();
				break;
		}

		this.updateUI();
	}

	/**
	 * Update UI based on current state
	 */
	private updateUI(): void {
		const topBar = document.getElementById('top-bar');
		const grisMenu = document.getElementById('gris-main-menu');

		if (!topBar || !grisMenu) return;

		if (this.state.isLoggedIn) {
			topBar.style.display = 'flex';
			this.grisMenuController.hide();
			this.updateTopBarButtons(true);
		} else {
			topBar.style.display = 'none';
			this.grisMenuController.show();
			this.updateTopBarButtons(false);
		}

		this.updateFriendRequestsBadge();
	}

	/**
	 * Update friend requests badge
	 */
	public updateFriendRequestsBadge(count?: number): void {
		const badge = document.getElementById('friend-requests-badge');
		if (!badge) return;

		if (count === undefined) {
			try {
				const storedCount = localStorage.getItem('pendingFriendRequests');
				count = storedCount ? parseInt(storedCount, 10) : 0;
			} catch {
				count = 0;
			}
		}

		if (count > 0) {
			badge.textContent = count.toString();
			badge.classList.remove('hidden');
		} else {
			badge.classList.add('hidden');
		}
	}

	/**
	 * Update top bar button visibility
	 */
	private updateTopBarButtons(isLoggedIn: boolean): void {
		const loggedInElements = [
			'play-btn', 'teams-btn', 'friend-requests-btn',
			'profile-btn', 'settings-btn', 'logout-btn'
		];

		const notLoggedInElements = ['login-btn', 'register-btn'];

		loggedInElements.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				element.style.display = isLoggedIn ? 'block' : 'none';
			}
		});

		notLoggedInElements.forEach(id => {
			const element = document.getElementById(id);
			if (element) {
				element.style.display = isLoggedIn ? 'none' : 'block';
			}
		});
	}

	/**
	 * Show main menu
	 */
	private showMainMenu(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '';
		}
	}

	/**
	 * Show login form
	 */
	private showLoginForm(): void {
		if (!this.appElement) return;

		this.appElement.innerHTML = `
			<div class="auth-container">
				<h2>Login</h2>
				<form id="login-form" class="auth-form">
					<label>
						Username:
						<input type="text" id="login-username" required />
					</label>
					<label>
						Password:
						<input type="password" id="login-password" required />
					</label>
					<button type="submit">Login</button>
				</form>
				<p><a href="#" id="show-register">Don't have an account? Register here</a></p>
				<div id="login-result"></div>
			</div>
		`;

		this.setupLoginForm();
	}

	/**
	 * Show registration form
	 */
	private showRegistrationForm(): void {
		if (!this.appElement) return;

		this.appElement.innerHTML = `
			<div class="auth-container">
				<h2>Register</h2>
				<form id="registration-form" class="auth-form">
					<label>
						Name:
						<input type="text" id="name" required />
					</label>
					<label>
						Username:
						<input type="text" id="username" required />
					</label>
					<label>
						Team:
						<input type="text" id="team" />
					</label>
					<label>
						Password:
						<input type="password" id="password" required />
					</label>
					<button type="submit">Register</button>
				</form>
				<p><a href="#" id="show-login">Already have an account? Login here</a></p>
				<div id="result"></div>
			</div>
		`;

		this.setupRegistrationForm();
	}

	/**
	 * Setup login form
	 */
	private setupLoginForm(): void {
		const form = document.getElementById('login-form') as HTMLFormElement;
		const result = document.getElementById('login-result');
		const showRegister = document.getElementById('show-register');

		if (form && result) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();

				const username = (document.getElementById('login-username') as HTMLInputElement).value;
				const password = (document.getElementById('login-password') as HTMLInputElement).value;

				try {
					const response = await fetch('/auth/login', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ username, password })
					});

					if (!response.ok) {
						throw new Error('Login failed');
					}

					const data = await response.json();
					localStorage.setItem('authToken', data.token);
					this.handleAuthSuccess(data.user);
					result.innerHTML = '✅ Login successful!';
				} catch (err) {
					result.innerHTML = `❌ ${(err as Error).message}`;
				}
			});
		}

		if (showRegister) {
			showRegister.addEventListener('click', (e) => {
				e.preventDefault();
				this.navigate('/register');
			});
		}
	}

	/**
	 * Setup registration form
	 */
	private setupRegistrationForm(): void {
		const form = document.getElementById('registration-form') as HTMLFormElement;
		const result = document.getElementById('result');
		const showLogin = document.getElementById('show-login');

		if (form && result) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();

				const name = (document.getElementById('name') as HTMLInputElement).value;
				const username = (document.getElementById('username') as HTMLInputElement).value;
				const team = (document.getElementById('team') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;

				try {
					const response = await fetch('/users', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ name, username, team, password })
					});

					if (!response.ok) {
						throw new Error('Registration failed');
					}

					const data = await response.json();
					result.innerHTML = `✅ Registered successfully: ${data.username}`;
					form.reset();

					setTimeout(() => {
						this.navigate('/login');
					}, 2000);
				} catch (err) {
					result.innerHTML = `❌ ${(err as Error).message}`;
				}
			});
		}

		if (showLogin) {
			showLogin.addEventListener('click', (e) => {
				e.preventDefault();
				this.navigate('/login');
			});
		}
	}

	/**
	 * Show dashboard
	 */
	private showDashboard(): void {
		if (!this.appElement) return;

		this.appElement.innerHTML = `
			<div class="dashboard-container">
				<h1>Welcome, ${this.state.currentUser?.name || 'Player'}!</h1>
				<div class="dashboard-grid">
					<div class="dashboard-card">
						<h3>Quick Play</h3>
						<button onclick="window.app.navigate('/play')">Start Game</button>
					</div>
					<div class="dashboard-card">
						<h3>Tournaments</h3>
						<button onclick="window.app.navigate('/tournament')">View Tournaments</button>
					</div>
					<div class="dashboard-card">
						<h3>Profile</h3>
						<button onclick="window.app.navigate('/profile')">View Profile</button>
					</div>
					<div class="dashboard-card">
						<h3>Teams</h3>
						<button onclick="window.app.navigate('/teams')">Manage Teams</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Show other pages - SIMPLIFIED versions
	 */
	private showFriendRequests(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Friend Requests</h1><p>Friend requests page coming soon...</p>';
		}
	}

	private showProfile(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Profile Page</h1><p>Profile management coming soon...</p>';
		}
	}

	private showSettings(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Settings Page</h1><p>Settings panel coming soon...</p>';
		}
	}

	private showGameInterface(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Game Interface</h1><p>Pong game coming soon...</p>';
		}
	}

	private showTournament(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Tournament</h1><p>Tournament system coming soon...</p>';
		}
	}

	private showMatchmaking(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Matchmaking</h1><p>Matchmaking system coming soon...</p>';
		}
	}

	private showTeams(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>Teams</h1><p>Team management coming soon...</p>';
		}
	}

	private show404(): void {
		if (this.appElement) {
			this.appElement.innerHTML = '<h1>404 - Page Not Found</h1><p>The requested page could not be found.</p>';
		}
	}

	/**
	 * Show notification
	 */
	private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.textContent = message;
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
			color: white;
			padding: 12px 20px;
			border-radius: 8px;
			z-index: 10000;
			animation: slideIn 0.3s ease-out;
		`;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.style.animation = 'slideOut 0.3s ease-in';
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 300);
		}, 3000);
	}

	/**
	 * Get app state
	 */
	public getState(): AppState {
		return { ...this.state };
	}

	/**
	 * Get current user
	 */
	public getCurrentUser(): User | null {
		return this.state.currentUser;
	}
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
	const app = GrisPongApp.getInstance();
	await app.initialize();
	(window as any).app = app;
});

// Export app instance and required functions
export const app = GrisPongApp.getInstance();

export function navigateTo(path: string): void {
	app.navigate(path);
}

export function updateFriendRequestsBadge(count?: number): void {
	app.updateFriendRequestsBadge(count);
}

export function getCurrentUser(): User | null {
	return app.getCurrentUser();
}

export function getAppState(): AppState {
	return app.getState();
}
