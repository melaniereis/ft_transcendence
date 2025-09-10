import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderSettingsPage(container: HTMLElement) {
	container.innerHTML = `
		<div class="settings-container">
			<h2>${t.playerSettings}</h2>

			<h3>${t.deleteUser}</h3>
			<p>${t.deleteUserWarning}</p>

			<button id="delete-user" class="delete-btn">${t.deleteUserBtn}</button>

			<div id="result" class="result"></div>
		</div>
	`;

	const result = document.getElementById('result') as HTMLDivElement;
	const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;

	deleteBtn.addEventListener('click', async () => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			result.innerText = t.notLoggedIn;
			return;
		}

		// Confirmation popup before deletion
		const confirmed = window.confirm(t.confirmDeleteUser);
		if (!confirmed) return;

		try {
			// Fetch current user's ID
			const response = await fetch('/users/me', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) throw new Error(t.failedToFetchUser);

			const user = await response.json();
			if (!user || !user.id) {
				result.innerText = t.userNotFound;
				return;
			}

			// Send the DELETE request to the backend
			const deleteResponse = await fetch(`/users/${user.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!deleteResponse.ok) throw new Error(t.failedToDeleteUser);

			// Notify the user and log them out immediately
			result.innerText = `🗑️ ${t.userDeleted} "${user.username}"`;

			// Log out and clear session
			localStorage.removeItem('authToken');
			container.innerHTML = `<p>${t.loggedOutMessage}</p>`;

			// Optional: Update UI state or navigate to another page
			// updateUIBasedOnAuth();
		} catch (err) {
			result.innerText = `${(err as Error).message}`;
		}
	});
}
