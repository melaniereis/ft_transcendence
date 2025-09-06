import { loadFriends, loadHistory, loadProfile, loadStats } from './api.js';
import { renderAllCharts } from './charts.js';
import { setupEvents, rerenderFriends, setupFriendHoverEffects, setupFriendsEvents, setupRemoveFriendEvents } from './events.js';
import { state } from './state.js';
import { layout, statsOverview, statsPerformance, statsTrends, historyList, historyDetailed, historyAnalysis } from './templates.js';
import { gamesThisWeek } from './metrics.js';

export async function renderProfilePage(container: HTMLElement, onBadgeUpdate?: () => void) {
	const token = localStorage.getItem('authToken');
	if (!token) {
		container.innerHTML = '<p>Please log in to view your profile.</p>';
		return;
	}
	state.token = token;
	state.container = container;
	state.onBadgeUpdate = onBadgeUpdate;
	state.activeMainTab = 'profile';

	try {
		const profile = await loadProfile();
		state.profile = profile;

		const [stats, history, friends] = await Promise.all([
			loadStats(profile.id),
			loadHistory(),
			loadFriends(),
		]);
		state.stats = stats;
		state.history = history;
		state.friends = friends;


		// Initial render
		container.innerHTML = layout(profile, stats, history, friends, state.activeStatsTab, state.activeHistoryView, state.editMode, state.activeMainTab || 'profile');

		// Inject tab content
		const statsEl = document.getElementById('stats-content')!;
		const histEl = document.getElementById('history-content')!;
		statsEl.innerHTML = statsOverview(state.stats, state.history);
		histEl.innerHTML = state.history.length ? historyList(state.history) :
			'<div style="padding:40px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px"><div style="font-size:48px;margin-bottom:15px">🎮</div><h4 style="margin:0 0 10px 0">No Match History</h4><p style="margin:0;color:#999">Your game history will appear here once you start playing!</p></div>';

		// Show loading spinner in friends section, then render friends list after a short delay
		const friendsContainer = document.getElementById('friends-container');
		if (friendsContainer) {
			friendsContainer.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;">
				<div style="width:48px;height:48px;border:5px solid #eaeaea;border-top:5px solid #b6a6ca;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px;"></div>
				<div style="font-size:18px;color:#b6a6ca;font-weight:500;">Loading friends...</div>
				<style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
			</div>`;
			setTimeout(() => {
				rerenderFriends();
			}, 350);
		}


		setupEvents(container);

		// Event delegation para navegação dos amigos
		container.addEventListener('click', (e) => {
			const t = e.target as HTMLElement;
			if (t.id === 'friends-prev' || t.id === 'friends-next') {
				if (!window.state) window.state = {};
				const total = Math.ceil(state.friends.length / 10);
				if (t.id === 'friends-prev') {
					window.state.friendsPage = Math.max(0, (window.state.friendsPage || 0) - 1);
				} else {
					window.state.friendsPage = Math.min(total - 1, (window.state.friendsPage || 0) + 1);
				}
				// Mostra loading antes de renderizar
				const friendsPanel = document.getElementById('friends-panel');
				if (friendsPanel) {
					friendsPanel.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;">
						<div style="width:48px;height:48px;border:5px solid #eaeaea;border-top:5px solid #b6a6ca;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px;"></div>
						<div style="font-size:18px;color:#b6a6ca;font-weight:500;">Loading friends...</div>
						<style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
					</div>`;
				}
				// Instead of reloading the whole profile, just rerender the friends list after a short delay
				setTimeout(() => {
					rerenderFriends();
				}, 350);
			}
		});

		setTimeout(async () => {
			setupFriendHoverEffects();
			setupRemoveFriendEvents();
		}, 100);

		renderAllCharts();

		try { onBadgeUpdate?.(); } catch { /* ignore */ }
	} catch (err: any) {
		container.innerHTML = `<p>${err?.message || 'Error loading profile. Please try again.'}</p>`;
	}
}

// Optional helpers to refresh sections after mutations
export async function refreshFriends() {
	const res = await fetch('/api/friends', { headers: { Authorization: `Bearer ${state.token}` } });
	if (res.ok) {
		state.friends = await res.json();
		rerenderFriends();
		try { state.onBadgeUpdate?.(); } catch { /* ignore */ }
	}
}
