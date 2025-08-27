import { loadFriends, loadHistory, loadProfile, loadStats } from './api.js';
import { renderAllCharts } from './charts.js';
import { setupEvents, rerenderFriends } from './events.js';
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
    container.innerHTML = layout(profile, stats, history, friends, state.activeStatsTab, state.activeHistoryView, state.editMode);

    // Inject tab content
    const statsEl = document.getElementById('stats-content')!;
    const histEl = document.getElementById('history-content')!;
    statsEl.innerHTML = statsOverview(state.stats, state.history);
    histEl.innerHTML = state.history.length ? historyList(state.history) :
      '<div style="padding:40px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px"><div style="font-size:48px;margin-bottom:15px">🎮</div><h4 style="margin:0 0 10px 0">No Match History</h4><p style="margin:0;color:#999">Your game history will appear here once you start playing!</p></div>';

    setupEvents(container);

    setTimeout(async () => {
      const { setupFriendHoverEffects, setupRemoveFriendEvents } = await import('./events.js');
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