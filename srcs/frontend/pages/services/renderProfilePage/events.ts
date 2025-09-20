// renderProfilePage/events.ts
import { state } from './state.js';
import { changePassword, updateProfile, loadProfile } from './api.js';
import { showNotification } from './utils.js';
import { Profile, Match } from './types.js';
import { render } from './render.js';
import { rerenderFriends, setupFriendsEvents, setupFriendHoverEffects } from './friends-events.js';
import { setupHistoryEvents } from './history-events.js';

// Re-export everything from the split files
export {
	setupFriendHoverEffects, render, setupFriendsEvents,
	setupHistoryEvents,
	rerenderFriends
}

export function setupTabEvents(container: HTMLElement) {
	container.addEventListener('click', (e) => {
		const t = e.target as HTMLElement;
		// Main Tabs
		if (t.classList && t.classList.contains('main-tab')) {
			const tab = t.dataset.mainTab as any;
			if (!tab) return;
			if (state.activeMainTab !== tab) {
				state.activeMainTab = tab;
				// Reset subtabs ao trocar de main tab
				if (tab === 'stats') state.activeStatsTab = 'overview';
				if (tab === 'history') state.activeHistoryView = 'list';
				render(container);
			}
			return;
		}
		// Stats Tabs
		if (t.classList && t.classList.contains('stats-tab')) {
			const tab = t.dataset.tab as any;
			if (!tab) return;
			if (state.activeStatsTab !== tab) {
				state.activeStatsTab = tab;
				render(container);
			}
			return;
		}
		// History Tabs
		if (t.classList && t.classList.contains('history-tab')) {
			const view = t.dataset.view as any;
			if (!view) return;
			if (state.activeHistoryView !== view) {
				state.activeHistoryView = view;
				render(container);
			}
			return;
		}
	}, true);
}

export function setupProfileEvents(container: HTMLElement) {
	container.addEventListener('click', async (e) => {
		const t = e.target as HTMLElement;
		const id = t.id;

		if (id === 'edit-btn') {
			state.editMode = true;
			render(container);
			return;
		}

		if (id === 'cancel-btn') {
			state.editMode = false;
			render(container);
			return;
		}

		if (id === 'save-btn') {
			if (e && typeof e.preventDefault === 'function') e.preventDefault();
			const username = (document.getElementById('username-input') as HTMLInputElement)?.value?.trim();
			const display_name = (document.getElementById('display-input') as HTMLInputElement)?.value?.trim();
			const email = (document.getElementById('email-input') as HTMLInputElement)?.value?.trim();
			const avatar_url = (document.getElementById('avatar-url-input') as HTMLInputElement)?.value?.trim() || (document.getElementById('avatar-preview') as HTMLImageElement)?.src;
			const bio = (document.getElementById('bio-input') as HTMLInputElement)?.value?.trim();

			if (!username || username.length < 3) {
				const err = document.getElementById('save-error');
				if (err) err.textContent = 'Username must be at least 3 characters';
				return;
			}

			try {
				const patch = await updateProfile({ username, display_name, email, avatar_url, bio });
				// Always reload the full profile after saving
				const full = await loadProfile();
				state.profile = full ? full : { ...(state.profile || {}), ...(patch as any) };
				state.editMode = false;
				state.activeMainTab = 'profile';
				render(container);
				showNotification('Profile updated successfully!', '#28a745');
			} catch (err: any) {
				const errEl = document.getElementById('save-error');
				if (errEl) errEl.textContent = err?.message || 'Failed to save profile';
			}
			return;
		}

		if (id === 'pass-btn') {
			const modal = document.getElementById('pass-modal');
			if (modal) modal.style.display = 'flex';
			return;
		}

		if (id === 'avatar-btn') {
			const modal = document.getElementById('avatar-modal');
			if (modal) modal.style.display = 'flex';
			return;
		}

		if (id === 'avatar-modal-close') {
			const modal = document.getElementById('avatar-modal') as HTMLElement | null;
			if (modal) modal.style.display = 'none';
			return;
		}

		if (id === 'pass-cancel') {
			const modal = document.getElementById('pass-modal') as HTMLElement | null;
			if (modal) modal.style.display = 'none';
			const form = document.getElementById('pass-form') as HTMLFormElement | null;
			if (form) form.reset();
			return;
		}

		// Avatar grid selection
		if (t.closest('.avatar-option')) {
			const option = t.closest('.avatar-option') as HTMLElement;
			document.querySelectorAll('.avatar-option').forEach(o => (o as HTMLElement).style.borderColor = 'transparent');
			option.style.borderColor = '#007bff';
			const confirm = document.getElementById('avatar-confirm') as HTMLButtonElement;
			confirm.disabled = false;
			confirm.style.opacity = '1';
			// Remove previous click listeners
			confirm.replaceWith(confirm.cloneNode(true));
			const newConfirm = document.getElementById('avatar-confirm') as HTMLButtonElement;
			newConfirm.disabled = false;
			newConfirm.style.opacity = '1';
			newConfirm.onclick = () => {
				const selected = option.getAttribute('data-avatar');
				const preview = document.getElementById('avatar-preview') as HTMLImageElement;
				if (selected && preview) preview.src = selected;
				// Also update the header avatar live
				const headerAvatar = document.querySelector('.header-view img, .gris-avatar img') as HTMLImageElement;
				if (selected && headerAvatar) headerAvatar.src = selected;
				// Update hidden input for avatar_url
				const avatarInput = document.getElementById('avatar-url-input') as HTMLInputElement;
				if (selected && avatarInput) avatarInput.value = selected;
				document.getElementById('avatar-modal')!.style.display = 'none';
			};
		}
	});

	container.addEventListener('submit', async (e) => {
		const form = e.target as HTMLFormElement;
		if (form.id === 'pass-form') {
			e.preventDefault();
			const cur = (document.getElementById('pass-cur') as HTMLInputElement).value;
			const np = (document.getElementById('pass-new') as HTMLInputElement).value;
			const cf = (document.getElementById('pass-conf') as HTMLInputElement).value;

			if (np !== cf) {
				const err = document.getElementById('pass-error');
				if (err) err.textContent = 'Passwords do not match';
				return;
			}

			try {
				await changePassword(cur, np); // FIX: Correct parameter names
				document.getElementById('pass-modal')!.style.display = 'none';
				(document.getElementById('pass-form') as HTMLFormElement).reset();
				showNotification('Password updated successfully!', '#28a745');
			} catch (err: any) {
				const el = document.getElementById('pass-error');
				if (el) el.textContent = err?.message || 'Failed to update password';
			}
			return;
		}
	});
}

export function setupEvents(container: HTMLElement) {
	setupTabEvents(container);
	setupProfileEvents(container);
	setupFriendsEvents(container);
	setupHistoryEvents(container);
	setTimeout(() => {
		setupFriendHoverEffects();
	}, 100);
}

// Optional execution code (if this is the entry point)
state.activeMainTab = 'friends';
if (state.container) {
	// @ts-ignore
	if (typeof window.renderProfilePage === 'function') {
		window.renderProfilePage(state.container, state.onBadgeUpdate);
	} else {
		// fallback para render padrão
		render(state.container);
	}
}
