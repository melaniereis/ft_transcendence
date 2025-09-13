import { updateFriendRequestsBadge } from '../index.js';
import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
  ? localStorage.getItem('preferredLanguage')
  : 'en') as keyof typeof translations;
const t = translations[lang];


export async function renderProfilePage(container: HTMLElement) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    container.innerHTML = `<p>${t.loginRequired}</p>`;
    return;
  }

  let editMode = false;
  let originalProfile: any = {};

  // Fetch and render profile + sections
  async function loadAndRender() {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const profile = await res.json();
      originalProfile = { ...profile };
      renderContent(profile, editMode);
      await loadStats(profile.id);
      await loadHistory();
      await loadFriends();
    } catch {
      container.innerHTML = '<p>Error loading profile.</p>';
    }
  }

  function renderContent(profile: any, isEdit: boolean) {
    const editIcon = !isEdit
      ? `<button id="edit-btn" title="Edit profile"
           style="background:none;border:none;cursor:pointer;font-size:18px;margin-left:10px">🖊️</button>`
      : '';

    const headerHTML = isEdit
      ? `
      <div style="display:flex;align-items:center;gap:20px;margin:20px 0">
        <img src="${profile.avatar_url}" width="100" alt="Avatar"/>
        <div style="flex:1">
          <label><strong>Username:</strong>
            <input id="username-input" type="text" value="${profile.username}"
                   style="margin-left:10px;padding:5px;border:1px solid #ddd;border-radius:4px"/>
          </label><pt/>
          <label><strong>Display Name:</strong>
            <input id="display-input" type="text" value="${profile.display_name||profile.name}"
                   style="margin-left:10px;padding:5px;border:1px solid #ddd;border-radius:4px"/>
          </label><pt/>
          <label><strong>Email:</strong>
            <input id="email-input" type="email" value="${profile.email||''}"
                   style="margin-left:10px;padding:5px;border:1px solid #ddd;border-radius:4px"/>
          </label><pt/>
          <p><strong>Team:</strong> ${profile.team}</p>
          <p><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</p>
          <div style="margin-top:15px;display:flex;gap:10px">
            <button id="save-btn" style="background:#28a745;color:#fff;
                    border:none;padding:8px 16px;border-radius:4px;cursor:pointer">💾 Save</button>
            <button id="cancel-btn" style="background:#6c757d;color:#fff;
                    border:none;padding:8px 16px;border-radius:4px;cursor:pointer">❌ Cancel</button>
            <button id="pass-btn" style="background:#ffc107;color:#000;
                    border:none;padding:8px 16px;border-radius:4px;cursor:pointer">🔒 Password</button>
          </div>
        </div>
      </div>`
      : `
      <div style="display:flex;align-items:center;gap:20px;margin:20px 0">
        <img src="${profile.avatar_url}" width="100" alt="Avatar"/>
        <div>
          <h3>@${profile.username}${editIcon}</h3>
          <p><strong>Name:</strong> ${profile.display_name||profile.name}</p>
          <p><strong>Email:</strong> ${profile.email||'Not provided'}</p>
          <p><strong>Team:</strong> ${profile.team}</p>
          <p><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>`;

    container.innerHTML = `
      <h2>Profile</h2>
      ${headerHTML}
      <h3>📊 Statistics</h3>
      <div id="stats" style="background:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0">
        <p>Loading stats...</p>
      </div>
      <h3>🏆 Match History</h3>
      <div id="history" style="margin:10px 0">
        <p>Loading history...</p>
      </div>
      <h3>👥 Friends</h3>
      <div id="friends-section">
        <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:10px 0;display:flex;gap:10px">
          <input id="friend-input" placeholder="Username..." style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px"/>
          <button id="friend-add" style="background:#007bff;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer">
            ➕ Add
          </button>
        </div>
        <div id="friends" style="margin:10px 0"><p>Loading friends...</p></div>
      </div>
      <div id="notification" style="display:none;position:fixed;top:20px;right:20px;
           background:#28a745;color:#fff;padding:15px;border-radius:5px;z-index:1000"></div>
      <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);
           justify-content:center;align-items:center;z-index:2000">
        <div style="background:#fff;padding:30px;border-radius:8px;width:320px">
          <h3>🔒 Change Password</h3>
          <form id="pass-form">
            <label>Current:</><input id="pass-cur" type="password" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/></label><pt/><pt/>
            <label>New:<pt/><input id="pass-new" type="password" minlength="6" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/></label><pt/><pt/>
            <label>Confirm:<pt/><input id="pass-conf" type="password" minlength="6" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/></label><pt/><pt/>
            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" id="pass-cancel" style="background:#6c757d;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer">Cancel</button>
              <button type="submit" style="background:#007bff;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer">Confirm</button>
            </div>
            <div id="pass-error" style="color:red;margin-top:8px"></div>
          </form>
        </div>
      </div>`;
    setupUI();
  }

  function setupUI() {
    document.getElementById('edit-btn')?.addEventListener('click', () => {
      editMode = true;
      renderContent(originalProfile, true);
      setupUI();
    });
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      editMode = false;
      renderContent(originalProfile, false);
      setupUI();
    });
    document.getElementById('save-btn')?.addEventListener('click', saveProfile);
    document.getElementById('pass-btn')?.addEventListener('click', () => {
      (document.getElementById('pass-modal') as HTMLElement).style.display = 'flex';
    });
    setupPassModal();
    setupAddFriend();
  }

  async function saveProfile() {
    const btn = document.getElementById('save-btn') as HTMLButtonElement;
    btn.disabled = true; btn.textContent = 'Saving...';
    const username = (document.getElementById('username-input') as HTMLInputElement).value.trim();
    const display_name = (document.getElementById('display-input') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email-input') as HTMLInputElement).value.trim();
    if (!username || username.length < 3) return notify('Username ≥3 chars','error');
    if (email && !email.includes('@')) return notify('Invalid email','error');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
        body: JSON.stringify({ username, display_name, email })
      });
      if (res.ok) {
        notify('Profile saved','success');
        editMode = false;
        await loadAndRender();
      } else {
        const err = await res.json();
        notify(err.error||'Save failed','error');
      }
    } catch {
      notify('Network error','error');
    }
    btn.disabled = false; btn.textContent = 'Save';
  }

  function setupPassModal() {
    const modal = document.getElementById('pass-modal') as HTMLElement;
    document.getElementById('pass-cancel')?.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
    document.getElementById('pass-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const cur = (document.getElementById('pass-cur') as HTMLInputElement).value;
      const nw = (document.getElementById('pass-new') as HTMLInputElement).value;
      const cf = (document.getElementById('pass-conf') as HTMLInputElement).value;
      const errDiv = document.getElementById('pass-error')!;
      if (nw !== cf) return errDiv.textContent = 'Mismatch';
      if (nw.length < 6) return errDiv.textContent = 'Min 6 chars';
      try {
        const r = await fetch('/api/profile/change-password', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
          body: JSON.stringify({ currentPassword: cur, newPassword: nw })
        });
        if (r.ok) { modal.style.display='none'; notify('Password changed','success'); }
        else { const { error } = await r.json(); errDiv.textContent = error; }
      } catch { errDiv.textContent = 'Network error'; }
    });
  }

  async function setupAddFriend() {
    const input = document.getElementById('friend-input') as HTMLInputElement;
    const btn = document.getElementById('friend-add') as HTMLButtonElement;
    btn.onclick = async () => {
      const name = input.value.trim();
      if (!name) return notify('Enter username','error');
      try {
        const r = await fetch('/api/friends/request', {
          method:'POST',
          headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
          body: JSON.stringify({ friendUsername: name })
        });
        const j = await r.json();
        if (r.ok) { notify(j.message,'success'); input.value=''; await loadFriends(); }
        else notify(j.error||'Failed','error');
      } catch { notify('Network error','error'); }
    };
  }

  async function loadStats(userId: number) {
    const res = await fetch(`/stats/${userId}`);
    if (res.ok) {
      const s = await res.json();
      document.getElementById('stats')!.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
          <div><strong>Matches:</strong>${s.matches_played}</div>
          <div><strong>Wins:</strong>${s.matches_won}</div>
          <div><strong>Losses:</strong>${s.matches_lost}</div>
          <div><strong>Win Rate:</strong>${(s.win_rate*100).toFixed(1)}%</div>
          <div><strong>Scored:</strong>${s.points_scored}</div>
          <div><strong>Conceded:</strong>${s.points_conceded}</div>
          <div><strong>Tournaments:</strong>${s.tournaments_won}</div>
        </div>`;
    } else {
      document.getElementById('stats')!.innerHTML = '<p>No stats</p>';
    }
  }

  async function loadHistory() {
    const res = await fetch('/api/match-history', {
      headers:{ 'Authorization':`Bearer ${token}` }
    });
    if (res.ok) {
      const h = await res.json();
      if (!h.length) {
        document.getElementById('history')!.innerHTML = '<p>No history</p>';
        return;
      }
      document.getElementById('history')!.innerHTML = `
        <table style="width:100%;border-collapse:collapse">
          <thead style="background:#f0f0f0">
            <tr><th>Date</th><th>Opponent</th><th>Score</th><th>Result</th></tr>
          </thead>
          <tbody>
            ${h.map((m:any)=>`
              <tr>
                <td>${new Date(m.date_played).toLocaleDateString()}</td>
                <td>Player ${m.opponent_id}</td>
                <td>${m.user_score}-${m.opponent_score}</td>
                <td style="color:${m.result==='win'?'green':'red'};font-weight:bold">${m.result.toUpperCase()}</td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } else {
      document.getElementById('history')!.innerHTML = '<p>Failed to load history</p>';
    }
  }

  async function loadFriends() {
    try {
      const res = await fetch('/api/friends', { headers:{'Authorization':`Bearer ${token}`}});
      if (!res.ok) throw new Error();
      const { friends } = await res.json();
      const div = document.getElementById('friends')!;
      if (!friends.length) {
        div.innerHTML = '<p>No friends yet</p>';
        return;
      }
      div.innerHTML = `
        <ul style="list-style:none;padding:0">
          ${friends.map((f:any)=>`
            <li class="friend-item" data-id="${f.friend_id}" data-name="${f.display_name||f.name}"
                style="padding:10px;border:1px solid #ddd;margin:5px 0;position:relative;transition:background .2s">
              <strong>${f.display_name||f.name}</strong> (@${f.username})
              <button class="rm-btn" title="Remove friend"
                      style="display:none;position:absolute;top:8px;right:8px;
                             background:#dc3545;color:#fff;border:none;border-radius:50%;
                             width:24px;height:24px;cursor:pointer;font-size:14px">×
              </button>
            </li>`).join('')}
        </ul>`;
      document.querySelectorAll('.friend-item').forEach(item => {
        const btn = item.querySelector('.rm-btn') as HTMLElement;
        item.addEventListener('mouseenter', ()=> { btn.style.display='block'; (item as HTMLElement).style.background='#f8f9fa'; });
        item.addEventListener('mouseleave', ()=> { btn.style.display='none'; (item as HTMLElement).style.background=''; });
        btn.addEventListener('click', () => {
          const id = item.getAttribute('data-id')!, nm = item.getAttribute('data-name')!;
          if (confirm(`Confirm remove ${nm}?`)) removeFriend(id, nm);
        });
      });
    } catch {
      document.getElementById('friends')!.innerHTML = '<p>Failed to load friends</p>';
    }
  }

  async function removeFriend(id: string, nm: string) {
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` }
      });
      if (res.ok) {
        notify(`${nm} removed`, 'success');
        await loadFriends();
        updateFriendRequestsBadge();
      } else {
        const { error } = await res.json();
        notify(error||'Failed','error');
      }
    } catch {
      notify('Network error','error');
    }
  }

  function notify(msg: string, type: 'success'|'error') {
    const n = document.getElementById('notification') as HTMLElement;
    n.textContent = msg;
    n.style.backgroundColor = type==='success'?'#28a745':'#dc3545';
    n.style.display = 'block';
    setTimeout(()=> n.style.display='none',3000);
  }

  // Initial load
  loadAndRender();
}

updateFriendRequestsBadge();