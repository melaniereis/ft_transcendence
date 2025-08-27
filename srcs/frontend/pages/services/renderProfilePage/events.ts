// renderProfilePage/events.ts
import { loadFriends, changePassword, addFriendApi, removeFriendApi, updateProfile, loadProfile } from './api.js';
import { renderAllCharts } from './charts.js';
import { state } from './state.js';
import { layout, statsOverview, statsPerformance, statsTrends, historyList, historyDetailed, historyAnalysis, friendsList } from './templates.js';
import { gamesThisWeek } from './metrics.js';
import { Profile } from './types.js';

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
    
    // Mouse enter
    item.addEventListener('mouseenter', () => {
      if (removeBtn) {
        removeBtn.style.display = 'block';
        (item as HTMLElement).style.backgroundColor = '#f8f9fa';
      }
    });
    
    // Mouse leave 
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
  if (state.activeStatsTab === 'trends') {
    statsEl.innerHTML = statsTrends(state.stats).replace('Games/Week', `Games/Week`).replace('value: String(gamesThisWeek([]))', '');
    // quick patch: no fake data, charts will show real; label is static
  }
  if (state.activeHistoryView === 'list') histEl.innerHTML = historyList(state.history);
  if (state.activeHistoryView === 'detailed') histEl.innerHTML = historyDetailed(state.history);
  if (state.activeHistoryView === 'analysis') histEl.innerHTML = historyAnalysis(state.history);
  renderAllCharts();
}

export function setupRemoveFriendEvents() {
  document.querySelectorAll('.remove-friend-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent triggering parent click
      
      const target = e.target as HTMLElement;
      const friendId = target.dataset.friendId;
      const friendName = target.dataset.friendName;
      
      if (!friendId || !friendName) return;
      
      // Confirmation dialog
      if (confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
        try {
          await removeFriendApi(friendId);
          showNotification(`${friendName} removed from friends list`, '#28a745');
          
          // Reload friends list and re-render
          const friends = await loadFriends();
          state.friends = friends;
          rerenderFriends();
        } catch (err) {
          showNotification('Error while removing friend', '#dc3545');
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
      state.editMode = true; render(container);
      return;
    }
    if (id === 'cancel-btn') {
      state.editMode = false; render(container);
      return;
    }
    if (id === 'save-btn') {
      const username = (document.getElementById('username-input') as HTMLInputElement)?.value?.trim();
      const display_name = (document.getElementById('display-input') as HTMLInputElement)?.value?.trim();
      const email = (document.getElementById('email-input') as HTMLInputElement)?.value?.trim();
      const avatar_url = (document.getElementById('avatar-preview') as HTMLImageElement)?.src;
      if (!username || username.length < 3) {
        const err = document.getElementById('save-error'); if (err) err.textContent = 'Username must be at least 3 characters';
        return;
      }
      try {
        // Send patch
        const patch = await updateProfile({ username, display_name, email, avatar_url });

        // Prefer a fresh full profile from the server to avoid missing fields
        let full: Profile | null = null;
        try { full = await loadProfile(); } catch { /* ignore */ }

        // Merge as fallback if backend doesn't return full profile
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
        
        // Reload friends list and re-render after a short delay to allow backend processing
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
    if (action === 'remove-friend' && t.dataset.id) {
      try {
        await removeFriendApi(t.dataset.id);
        showNotification('Friend removed successfully!', '#28a745');
      } catch {
        showNotification('Failed to remove friend', '#dc3545');
      }
      return;
    }
    // Avatar grid selection
    if (t.closest('.avatar-option')) {
      const option = t.closest('.avatar-option') as HTMLElement;
      document.querySelectorAll('.avatar-option').forEach(o => (o as HTMLElement).style.borderColor = 'transparent');
      option.style.borderColor = '#007bff';
      const confirm = document.getElementById('avatar-confirm') as HTMLButtonElement;
      confirm.disabled = false; confirm.style.opacity = '1';
      confirm.onclick = () => {
        const selected = option.getAttribute('data-avatar');
        const preview = document.getElementById('avatar-preview') as HTMLImageElement;
        if (selected && preview) preview.src = selected;
        document.getElementById('avatar-modal')!.style.display = 'none';
      };
    }

    // Tabs
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
  });

  container.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement;
    if (form.id === 'pass-form') {
      e.preventDefault();
      const cur = (document.getElementById('pass-cur') as HTMLInputElement).value;
      const np = (document.getElementById('pass-new') as HTMLInputElement).value;
      const cf = (document.getElementById('pass-conf') as HTMLInputElement).value;
      if (np !== cf) {
        const err = document.getElementById('pass-error'); if (err) err.textContent = 'Passwords do not match';
        return;
      }
      try {
        await changePassword(cur, np);
        document.getElementById('pass-modal')!.style.display = 'none';
        (document.getElementById('pass-form') as HTMLFormElement).reset();
        showNotification('Password updated successfully!', '#28a745');
      } catch (err: any) {
        const el = document.getElementById('pass-error'); if (el) el.textContent = err?.message || 'Failed to update password';
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
  // Re-setup hover and remove events
  setupFriendHoverEffects();
  setupRemoveFriendEvents();
}