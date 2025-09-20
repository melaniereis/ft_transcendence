let activityTimer: ReturnType<typeof setTimeout>;
let isUserActive = true;

export function startActivityMonitoring() {
	const token = localStorage.getItem('authToken');
	if (!token) {
		console.warn('⛔ startActivityMonitoring() called before auth token is set.');
		return;
	}

	updateOnlineStatus(true); // ✅ Set online on start

	const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
	const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

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

	// Events to detect activity
	const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
	events.forEach(event => {
		document.addEventListener(event, resetActivityTimer, true);
	});

	// Periodic "last seen" update
	setInterval(() => {
		if (isUserActive) {
			updateLastSeen();
		}
	}, UPDATE_INTERVAL);

	// Handle tab visibility
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			updateOnlineStatus(false);
		} else {
			updateOnlineStatus(true); // Immediately set online
			resetActivityTimer();
		}
	});

	// 🔐 Clean disconnect on unload
	window.addEventListener('beforeunload', () => {
		const token = localStorage.getItem('authToken');
		if (!token) return;

		try {
			// ✅ Try using fetch with keepalive
			fetch('/api/profile/status', {
				method: 'POST',
				keepalive: true,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ online: false }),
			});
		} catch (err) {
			// 🪂 Fallback: use beacon
			const blob = new Blob(
				[JSON.stringify({ online: false, token })],
				{ type: 'application/json' }
			);
			navigator.sendBeacon('/api/profile/status', blob);
		}
	});

	resetActivityTimer(); // ✅ Initial kickstart
}

async function updateOnlineStatus(isOnline: boolean) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		console.warn('⚠️ Tried to update status, but no token found.');
		return;
	}

	try {
		const res = await fetch('/api/profile/status', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ online: isOnline })
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error(`❌ Status update failed (${res.status}): ${errorText}`);
		}
	} catch (error) {
		console.error('❌ Network error updating status:', error);
	}
}

async function updateLastSeen() {
	const token = localStorage.getItem('authToken');
	if (!token) {
		console.warn('⚠️ No auth token for last seen update.');
		return;
	}

	try {
		const res = await fetch('/api/profile/update-last-seen', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!res.ok) {
			const errText = await res.text();
			console.error(`❌ Last seen update failed: ${res.status} - ${errText}`);
		}
	} catch (error) {
		console.error('❌ Network error updating last seen:', error);
	}
}
