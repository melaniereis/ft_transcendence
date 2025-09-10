import { state } from './state.js';
import { loadFriends, addFriendApi, removeFriendApi } from './api.js';
import { friendsList } from './templates.js';
import { showNotification, showInlineMessage, setHTML } from './utils.js';
import { translations } from '../language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export async function loadOutgoingFriendRequests() {
	if (!state.token) return;
	try {
		const res = await fetch('/api/friends/outgoing', {
			headers: { 'Authorization': `Bearer ${state.token}` }
		});
		if (res.ok) {
			const data = await res.json();
			state.outgoingFriendRequests = data.outgoing || [];
		}
	} catch (e) {
		// ignore
	}
}

export function setupFriendHoverEffects() {
	const friendItems = document.querySelectorAll('.friend-item');

	friendItems.forEach(item => {
		const removeBtn = item.querySelector('.remove-friend-btn') as HTMLElement;

		item.addEventListener('mouseenter', () => {
			if (removeBtn) {
				removeBtn.style.display = 'block';
				(item as HTMLElement).style.backgroundColor = '#f8f9fa';
			}
		});

		item.addEventListener('mouseleave', () => {
			if (removeBtn) {
				removeBtn.style.display = 'none';
				(item as HTMLElement).style.backgroundColor = '#fff';
			}
		});
	});
}

export function setupRemoveFriendEvents() {
	document.querySelectorAll('.remove-friend-btn').forEach(btn => {
		btn.addEventListener('click', async (e) => {
			e.stopPropagation();
			e.preventDefault();

			const target = e.currentTarget as HTMLElement;
			const friendId = target.dataset.friendId || target.dataset.id;
			const friendName = target.dataset.friendName || target.dataset.name;

			if (!friendId || !friendName) {
				console.error('Missing friend data:', { friendId, friendName });
				return;
			}

			if (confirm(`${t.confirmRemoveFriend} ${friendName}?`)) {
				try {
					await removeFriendApi(friendId);
					showNotification(`${friendName} ${t.friendRemoved}`, '#28a745');

					const friends = await loadFriends();
					state.friends = friends;
					rerenderFriends();
				} catch (err: any) {
					console.error('Error removing friend:', err);
					showNotification(`${t.errorRemovingFriend}: ${err.message || t.unknownError}`, '#dc3545');
				}
			}
		});
	});
}

export function rerenderFriends() {
	const fc = document.getElementById('friends-container');
	if (fc) {
		setHTML(fc, friendsList(state.friends));
		setupFriendHoverEffects();
		setupRemoveFriendEvents();
	} else {
		const friendsPanel = document.getElementById('friends-panel');
		if (friendsPanel) {
			friendsPanel.innerHTML = `
				<div class="gris-section" id="friends-section">
					<div class="gris-section-title">${t.friends}</div>
					<div class="gris-section-content" id="friends-content">
						<form id="friend-form" style="display:flex;gap:10px;justify-content:flex-start;margin-bottom:10px;flex-wrap:wrap" autocomplete="off">
							<input id="friend-input" placeholder="${t.usernamePlaceholder}" style="flex:1;min-width:120px;max-width:180px;padding:8px;border:1.5px solid #b6a6ca;border-radius:8px;font-size:15px;background:rgba(255,255,255,0.7);font-family:'EB Garamond',serif;"/>
							<button id="friend-add" class="gris-action-btn" title="${t.addFriend}" type="submit">${t.add}</button>
						</form>
						<div id="friend-msg" style="margin-top:8px;font-size:12px;color:#fff"></div>
						<div id="friends-container" style="margin:10px 0;text-align:center">${friendsList(state.friends)}</div>
					</div>
				</div>`;
			setupFriendHoverEffects();
			setupRemoveFriendEvents();
		}
	}
}

export function setupFriendsEvents(container: HTMLElement) {
	container.addEventListener('click', async (e) => {
		const tEl = e.target as HTMLElement;
		const id = tEl.id;

		if (id === 'show-all-friends') {
			document.getElementById('friends-modal')!.style.display = 'flex';
			return;
		}

		if (id === 'friends-modal-close') {
			document.getElementById('friends-modal')!.style.display = 'none';
			return;
		}
	});

	container.addEventListener('submit', async (e) => {
		const form = e.target as HTMLFormElement;
		if (form.id === 'friend-form') {
			e.preventDefault();
			const input = document.getElementById('friend-input') as HTMLInputElement;
			const btn = document.getElementById('friend-add') as HTMLButtonElement;
			const username = input.value.trim();
			if (!username) return;
			try {
				const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
				if (!res.ok) {
					showInlineMessage('friend-msg', t.userNotFound, '#dc3545');
					return;
				}
			} catch (e) {
				showInlineMessage('friend-msg', t.errorCheckingUser, '#dc3545');
				return;
			}
			const isFriend = Array.isArray(state.friends) && state.friends.some((f: any) => {
				return (f.username && f.username.toLowerCase() === username.toLowerCase()) ||
					(f.name && f.name.toLowerCase() === username.toLowerCase());
			});
			const isSelf = state.profile && state.profile.username.toLowerCase() === username.toLowerCase();
			if (isFriend || isSelf) {
				showInlineMessage('friend-msg', t.alreadyFriend, '#ffc107');
				return;
			}
			await loadOutgoingFriendRequests();
			if (state.outgoingFriendRequests && Array.isArray(state.outgoingFriendRequests)) {
				const alreadyRequested = state.outgoingFriendRequests.some((req: any) => {
					return (req.username && req.username.toLowerCase() === username.toLowerCase()) ||
						(req.targetUsername && req.targetUsername.toLowerCase() === username.toLowerCase());
				});
				if (alreadyRequested) {
					showInlineMessage('friend-msg', t.requestAlreadySent, '#ffc107');
					return;
				}
			}
			try {
				btn.disabled = true;
				btn.textContent = t.adding;
				await addFriendApi(username);
				input.value = '';
				try { state.friends = await loadFriends(); } catch { }
				await loadOutgoingFriendRequests();
				rerenderFriends();
				showInlineMessage('friend-msg', t.requestSent, '#28a745');
			} catch (err: any) {
				showInlineMessage('friend-msg', t.failedToAddFriend, '#dc3545');
			} finally {
				btn.disabled = false;
				btn.textContent = t.addSymbol;
			}
			return;
		}
	});
}
