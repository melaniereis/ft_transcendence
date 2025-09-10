import { loadFriends, loadHistory, loadProfile, loadStats } from './api.js';
import { renderAllCharts } from './charts.js';
import { setupEvents, rerenderFriends, setupFriendHoverEffects, setupFriendsEvents, setupRemoveFriendEvents } from './events.js';
import { state } from './state.js';
import { layout, statsOverview, statsPerformance, statsTrends, historyList, historyDetailed, historyAnalysis } from './templates.js';
import { translations } from '../language/translations.js';


const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
    ? localStorage.getItem('preferredLanguage')
    : 'en') as keyof typeof translations;
const t = translations[lang];


export async function renderProfilePage(container: HTMLElement, onBadgeUpdate?: () => void) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        container.innerHTML = `<p>${t.pleaseLogin}</p>`;
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

        // Including translated tab labels in layout
        container.innerHTML = layout(
          profile, 
          stats, 
          history, 
          friends, 
          state.activeStatsTab, 
          state.activeHistoryView, 
          state.editMode, 
          state.activeMainTab || 'profile',
        );

        const statsEl = document.getElementById('stats-content')!;
        const histEl = document.getElementById('history-content')!;
        statsEl.innerHTML = statsOverview(state.stats, state.history);
        histEl.innerHTML = state.history.length ? historyList(state.history) :
            `<div style="padding:40px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px">
              <div style="font-size:48px;margin-bottom:15px">🎮</div>
              <h4 style="margin:0 0 10px 0">${t.noMatchHistoryTitle}</h4>
              <p style="margin:0;color:#999">${t.noMatchHistoryMessage}</p>
            </div>`;

        const friendsContainer = document.getElementById('friends-container');
        if (friendsContainer) {
            friendsContainer.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;">
                <div style="width:48px;height:48px;border:5px solid #eaeaea;border-top:5px solid #b6a6ca;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px;"></div>
                <div style="font-size:18px;color:#b6a6ca;font-weight:500;">${t.loadingFriends2}</div>
                <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
            </div>`;
            setTimeout(() => {
                rerenderFriends();
            }, 350);
        }

        setupEvents(container);

        container.addEventListener('click', (e) => {
            const tEl = e.target as HTMLElement;
            if (tEl.id === 'friends-prev' || tEl.id === 'friends-next') {
                if (!window.state) window.state = {};
                const total = Math.ceil(state.friends.length / 10);
                if (tEl.id === 'friends-prev') {
                    window.state.friendsPage = Math.max(0, (window.state.friendsPage || 0) - 1);
                } else {
                    window.state.friendsPage = Math.min(total - 1, (window.state.friendsPage || 0) + 1);
                }
                const friendsPanel = document.getElementById('friends-panel');
                if (friendsPanel) {
                    friendsPanel.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;">
                        <div style="width:48px;height:48px;border:5px solid #eaeaea;border-top:5px solid #b6a6ca;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px;"></div>
                        <div style="font-size:18px;color:#b6a6ca;font-weight:500;">${t.loadingFriends2}</div>
                        <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
                    </div>`;
                }
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

        try { onBadgeUpdate?.(); } catch { }
    } catch (err: any) {
        container.innerHTML = `<p>${err?.message || t.errorLoadingProfile2}</p>`;
    }
}

export async function refreshFriends() {
    const res = await fetch('/api/friends', { headers: { Authorization: `Bearer ${state.token}` } });
    if (res.ok) {
        state.friends = await res.json();
        rerenderFriends();
        try {
            state.onBadgeUpdate?.();
        }
        catch { }
    }
}
