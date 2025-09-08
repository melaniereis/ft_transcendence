import { translations } from "./language/translations.js";

export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
	const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
		? localStorage.getItem('preferredLanguage')
		: 'en') as keyof typeof translations;
	const t = translations[lang];

	container.innerHTML = `
		<h2>${t.loginTitle}</h2>
		<form id="login-form">
			<label>
				${t.username}:
				<input type="text" name="username" placeholder="${t.username}" required />
			</label>
			<label>
				${t.password}:
				<input type="password" name="password" placeholder="${t.password}" required />
			</label>
			<button type="submit">${t.login}</button>
		</form>
		<div id="login-result"></div>
	`;

	const form = document.getElementById('login-form') as HTMLFormElement;
	const resultDiv = document.getElementById('login-result') as HTMLDivElement;

	form.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const formData = new FormData(form);
		const data = {
			username: formData.get('username') as string,
			password: formData.get('password') as string,
		};

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await res.json();
			if (result.token) {
				localStorage.setItem('authToken', result.token);
				localStorage.setItem('playerId', result.user.id);
				localStorage.setItem('playerName', result.user.username);
				resultDiv.textContent = t.success;
				onLoginSuccess();
			} else {
				resultDiv.textContent = t.invalid;
			}
		} catch (err) {
			resultDiv.textContent = t.failed;
		}
	});
}

// Activity monitoring system
let activityTimer: ReturnType<typeof setTimeout>;
let isUserActive = true;

export function startActivityMonitoring() {

	updateOnlineStatus(true); // Set online on start

	const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
	const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

	// Reset activity timer
	function resetActivityTimer() {
		clearTimeout(activityTimer);
		if (!isUserActive) {
			isUserActive = true;
			updateOnlineStatus(true);
		}

		activityTimer = setTimeout(() => {
			isUserActive = false;
			updateOnlineStatus(false);
		}, ACTIVITY_TIMEOUT);
	}

	// Track user activities
	const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
	events.forEach(event => {
		document.addEventListener(event, resetActivityTimer, true);
	});

	// Update last_seen periodically
	setInterval(() => {
		if (isUserActive) {
			updateLastSeen();
		}
	}, UPDATE_INTERVAL);

	// Handle page visibility
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			updateOnlineStatus(false);
		} else {
			resetActivityTimer();
		}
	});

	// Handle beforeunload (user closing browser/tab)
	window.addEventListener('beforeunload', () => {
		updateOnlineStatus(false);
	});

	// Start the timer
	resetActivityTimer();
}

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

async function updateLastSeen() {
	const token = localStorage.getItem('authToken');
	if (!token) return;

	try {
		await fetch('/api/profile/update-last-seen', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
	} catch (error) {
		console.error('Failed to update last seen:', error);
	}
}