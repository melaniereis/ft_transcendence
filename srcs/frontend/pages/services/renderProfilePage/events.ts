// renderProfilePage/events.ts - FIXED VERSION
import { loadFriends, changePassword, addFriendApi, removeFriendApi, updateProfile, loadProfile, loadMatchesWithPagination } from './api.js';
import { renderAllCharts } from './charts.js';
import { state } from './state.js';
import { layout, statsOverview, statsPerformance, historyList, historyDetailed, historyAnalysis, friendsList } from './templates.js';
import { Profile, Match } from './types.js';

function setHTML(el: HTMLElement, html: string) { el.innerHTML = html; }

function showNotification(message: string, color: string) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = message;
  (el as HTMLElement).style.backgroundColor = color;
  (el as HTMLElement).style.display = 'block';
  setTimeout(() => ((el as HTMLElement).style.display = 'none'), 3000);
}

function showInlineMessage(id: string, message: string, color: string) {
  const el = document.getElementById(id) as HTMLElement | null;
  if (!el) return;
  el.textContent = message;
  el.style.color = color;
  setTimeout(() => { el.textContent = ''; }, 3000);
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

export function render(container: HTMLElement) {
  if (!state.profile) return;
  container.innerHTML = layout(
    state.profile,
    state.stats,
    state.history,
    state.friends,
    state.activeStatsTab,
    state.activeHistoryView,
    state.editMode
  );
  
  // Inject tab content after layout renders
  const statsEl = document.getElementById('stats-content')!;
  const histEl = document.getElementById('history-content')!;
  
  if (state.activeStatsTab === 'overview') statsEl.innerHTML = statsOverview(state.stats, state.history);
  if (state.activeStatsTab === 'performance') statsEl.innerHTML = statsPerformance(state.stats, state.history);
  
  if (state.activeHistoryView === 'list') histEl.innerHTML = historyList(state.history);
  if (state.activeHistoryView === 'detailed') histEl.innerHTML = historyDetailed(state.history);
  if (state.activeHistoryView === 'analysis') histEl.innerHTML = historyAnalysis(state.history);
  
  renderAllCharts();
}

// FIX: Improved remove friend functionality
export function setupRemoveFriendEvents() {
  document.querySelectorAll('.remove-friend-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      const friendId = target.dataset.friendId;
      const friendName = target.dataset.friendName;
      
      if (!friendId || !friendName) {
        console.error('Missing friend data:', { friendId, friendName });
        return;
      }
      
      if (confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
        try {
          await removeFriendApi(friendId);
          showNotification(`${friendName} removed from friends list`, '#28a745');
          
          // Reload friends list and re-render
          const friends = await loadFriends();
          state.friends = friends;
          rerenderFriends();
        } catch (err: any) {
          console.error('Error removing friend:', err);
          showNotification('Error while removing friend: ' + (err.message || 'Unknown error'), '#dc3545');
        }
      }
    });
  });
}

export function setupEvents(container: HTMLElement) {
  container.addEventListener('click', async (e) => {
    const t = e.target as HTMLElement;
    const id = t.id;
    const action = t.dataset.action;

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
      const username = (document.getElementById('username-input') as HTMLInputElement)?.value?.trim();
      const display_name = (document.getElementById('display-input') as HTMLInputElement)?.value?.trim();
      const email = (document.getElementById('email-input') as HTMLInputElement)?.value?.trim();
      const avatar_url = (document.getElementById('avatar-preview') as HTMLImageElement)?.src;
      
      if (!username || username.length < 3) {
        const err = document.getElementById('save-error'); 
        if (err) err.textContent = 'Username must be at least 3 characters';
        return;
      }
      
      try {
        const patch = await updateProfile({ username, display_name, email, avatar_url });
        
        let full: Profile | null = null;
        try { 
          full = await loadProfile(); 
        } catch { /* ignore */ }

        state.profile = full ? full : { ...(state.profile || {}), ...(patch as any) };
        state.editMode = false;
        render(container);
        showNotification('Profile updated successfully!', '#28a745');
      } catch (err: any) {
        const errEl = document.getElementById('save-error');
        if (errEl) errEl.textContent = err?.message || 'Failed to save profile';
      }
      return;
    }

    if (id === 'load-more-btn') {
      await loadMoreMatches();
      return;
    }
    
    if (id === 'pass-btn') {
      document.getElementById('pass-modal')!.style.display = 'flex';
      return;
    }
    
    if (id === 'avatar-btn') {
      document.getElementById('avatar-modal')!.style.display = 'flex';
      return;
    }
    
    if (id === 'avatar-modal-close') {
      document.getElementById('avatar-modal')!.style.display = 'none';
      return;
    }

    // FIX: Show all friends modal
    if (id === 'show-all-friends') {
      document.getElementById('friends-modal')!.style.display = 'flex';
      return;
    }
    
    if (id === 'friends-modal-close') {
      document.getElementById('friends-modal')!.style.display = 'none';
      return;
    }
    
    if (id === 'friend-add') {
      const input = document.getElementById('friend-input') as HTMLInputElement;
      const username = input.value.trim();
      
      if (!username) {
        showInlineMessage('friend-msg', 'Por favor, insira um username', '#dc3545');
        return;
      }
      
      const addBtn = t as HTMLButtonElement;
      addBtn.disabled = true;
      addBtn.textContent = '⏳ A adicionar...';
      
      try {
        await addFriendApi(username);
        input.value = '';
        showInlineMessage('friend-msg', `Pedido de amizade enviado para ${username}!`, '#28a745');
        
        setTimeout(async () => {
          try {
            const friends = await loadFriends();
            state.friends = friends;
            rerenderFriends();
          } catch (err) {
            console.error('Erro ao recarregar amigos:', err);
          }
        }, 1000);
        
      } catch (err: any) {
        const errorMsg = err?.message || 'Erro ao adicionar amigo';
        showInlineMessage('friend-msg', errorMsg, '#dc3545');
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = '➕ Add';
      }
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
      confirm.onclick = () => {
        const selected = option.getAttribute('data-avatar');
        const preview = document.getElementById('avatar-preview') as HTMLImageElement;
        if (selected && preview) preview.src = selected;
        document.getElementById('avatar-modal')!.style.display = 'none';
      };
    }

    // Tabs - FIX: Merged stats tabs
    if (t.classList.contains('stats-tab')) {
      state.activeStatsTab = (t.dataset.tab as any) ?? 'overview';
      render(container);
      return;
    }
    
    if (t.classList.contains('history-tab')) {
      state.activeHistoryView = (t.dataset.view as any) ?? 'list';
      render(container);
      return;
    }

    // FIX: History pagination
    if (id === 'load-more-matches') {
      state.historyPage = (state.historyPage || 1) + 1;
      const moreMatches = await loadMoreMatches();
      appendMatches(moreMatches);
      return;
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
    }
  });

  // Initial friend hover and remove setup
  setTimeout(() => {
    setupFriendHoverEffects();
    setupRemoveFriendEvents();
  }, 100);
}

export function rerenderFriends() {
  const fc = document.getElementById('friends-container');
  if (fc) setHTML(fc, friendsList(state.friends));
  setupFriendHoverEffects();
  setupRemoveFriendEvents();
}

// Add these functions to your existing events.ts file

export async function loadMoreMatches(): Promise<Match[]> {
  if (state.matchPagination.isLoadingMore || !state.matchPagination.hasMoreMatches) {
    return [];
  }

  state.matchPagination.isLoadingMore = true;
  
  // Update load more button to show loading state
  const loadMoreBtn = document.getElementById('load-more-btn') as HTMLButtonElement;
  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = '⏳ Loading more matches...';
  }

  try {
    const nextPage = state.matchPagination.currentPage + 1;
    const result = await loadMatchesWithPagination(nextPage, 10);
    
    if (result.matches.length > 0) {
      state.matchPagination.currentPage = nextPage;
      state.matchPagination.hasMoreMatches = result.hasMore;
      state.matchPagination.totalMatches = result.totalCount;
      
      // Append new matches to existing history
      appendMatches(result.matches);
      
      return result.matches;
    }
    
    // No more matches
    state.matchPagination.hasMoreMatches = false;
    return [];
  } catch (error) {
    console.error('Error loading more matches:', error);
    return [];
  } finally {
    state.matchPagination.isLoadingMore = false;
    
    // Reset button state
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      if (state.matchPagination.hasMoreMatches) {
        loadMoreBtn.textContent = '📄 Load More Matches';
      } else {
        loadMoreBtn.textContent = '✅ All matches loaded';
        loadMoreBtn.disabled = true;
      }
    }
  }
}

export function appendMatches(newMatches: Match[]): void {
  if (!newMatches || newMatches.length === 0) return;

  // Add new matches to the state
  state.history = [...state.history, ...newMatches];
  
  // Get the current active history view
  const currentView = state.activeHistoryView;
  const historyContentEl = document.getElementById('history-content');
  
  if (!historyContentEl) return;

  // Update the display based on current view
  switch (currentView) {
    case 'list':
      appendToHistoryList(newMatches);
      break;
    case 'detailed':
      appendToHistoryDetailed(newMatches);
      break;
    case 'analysis':
      // For analysis view, re-render the entire view since it's chart-based
      rerenderAnalysisView();
      break;
  }
  
  // Update any charts that depend on the full history
  setTimeout(() => {
    try {
      renderAllCharts();
    } catch (e) {
      console.log('Chart update error', e);
    }
  }, 100);
}

function appendToHistoryList(newMatches: Match[]): void {
  const historyContentEl = document.getElementById('history-content');
  if (!historyContentEl) return;

  // Find the matches container or create one
  let matchesContainer = historyContentEl.querySelector('.matches-container');
  if (!matchesContainer) {
    // If no container exists, re-render the entire list
    historyContentEl.innerHTML = historyList(state.history);
    return;
  }

  // Create HTML for new matches
  const newMatchesHtml = newMatches.map(m => {
    const isWin = m.result === 'win';
    const diff = Math.abs(m.user_score - m.opponent_score);
    const type = diff <= 2 ? { label: 'NAIL-BITER', color: '#dc3545' }
      : diff <= 5 ? { label: 'CLOSE', color: '#ffc107' }
      : diff <= 10 ? { label: 'COMPETITIVE', color: '#17a2b8' }
      : { label: 'DOMINANT', color: '#28a745' };

    return `
      <div style="padding:15px;border-bottom:1px solid #f1f3f4;display:flex;align-items:center;gap:15px">
        <div style="width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${isWin ? '#28a745' : '#dc3545'};color:#fff;font-weight:bold;font-size:18px">
          ${isWin ? '🏆' : '❌'}
        </div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <span style="font-weight:bold;color:#333">vs Player ${m.opponent_id}</span>
            <span style="background:${type.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold">${type.label}</span>
          </div>
          <div style="font-size:13px;color:#666">${new Date(m.date_played).toLocaleDateString()} • ${new Date(m.date_played).toLocaleTimeString()}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:monospace;font-size:18px;font-weight:bold;color:#333">${m.user_score} - ${m.opponent_score}</div>
          <div style="font-size:12px;color:${isWin ? '#28a745' : '#dc3545'};font-weight:bold">${isWin ? 'VICTORY' : 'DEFEAT'}</div>
        </div>
        <div style="text-align:center;min-width:60px">
          <div style="font-size:14px;color:#666">⏱️</div>
          <div style="font-size:12px;color:#666">${m.duration || 'N/A'}</div>
        </div>
      </div>`;
  }).join('');

  // Append new matches
  matchesContainer.insertAdjacentHTML('beforeend', newMatchesHtml);
}

function appendToHistoryDetailed(newMatches: Match[]): void {
  const historyContentEl = document.getElementById('history-content');
  if (!historyContentEl) return;

  let filteredMatches = historyContentEl.querySelector('#filtered-matches');
  if (!filteredMatches) {
    // Re-render the entire detailed view
    historyContentEl.innerHTML = historyDetailed(state.history);
    return;
  }

  // Create detailed HTML for new matches
  const startIndex = state.history.length - newMatches.length;
  const newMatchesHtml = newMatches.map((m, idx) => `
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);border-left:5px solid ${m.result === 'win' ? '#28a745' : '#dc3545'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${m.result === 'win' ? '#28a745' : '#dc3545'};color:#fff;font-size:16px">
            ${m.result === 'win' ? '🏆' : '❌'}
          </div>
          <div>
            <h4 style="margin:0;color:#333">Match #${startIndex + idx + 1}</h4>
            <div style="font-size:13px;color:#666">${new Date(m.date_played).toLocaleString()}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-family:monospace;font-size:24px;font-weight:bold;color:#333">${m.user_score} - ${m.opponent_score}</div>
          <div style="font-size:12px;color:${m.result === 'win' ? '#28a745' : '#dc3545'};font-weight:bold">${m.result === 'win' ? 'VICTORY' : 'DEFEAT'}</div>
        </div>
      </div>
      <!-- Additional match details would go here -->
    </div>
  `).join('');

  filteredMatches.insertAdjacentHTML('beforeend', newMatchesHtml);
}

function rerenderAnalysisView(): void {
  const historyContentEl = document.getElementById('history-content');
  if (!historyContentEl) return;
  
  // Re-render the entire analysis view with updated data
  historyContentEl.innerHTML = historyAnalysis(state.history);
  
  // Re-render charts with new data
  renderAllCharts();
}
