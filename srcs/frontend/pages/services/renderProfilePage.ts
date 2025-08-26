// services/renderProfilePage.ts
import { updateFriendRequestsBadge } from '../index.js';

export async function renderProfilePage(container: HTMLElement) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    container.innerHTML = '<p>Please log in to view your profile.</p>';
    return;
  }

  let editMode = false;
  let originalProfile: any = {};
  let currentStats: any = {};
  let currentHistory: any = [];
  let currentFriends: any = [];

  // Available avatars
  const availableAvatars = [
    '/assets/avatar/default.png',
    '/assets/avatar/Blue_002.png',
    '/assets/avatar/Blue_003.png',
    '/assets/avatar/Blue_004.png',
    '/assets/avatar/Blue_005.png',
    '/assets/avatar/Blue_006.png',
    '/assets/avatar/Blue_007.png',
    '/assets/avatar/Blue_008.png',
    '/assets/avatar/Blue_009.png',
    '/assets/avatar/Blue_010.png',
    '/assets/avatar/Blue_011.png',
    '/assets/avatar/Blue_012.png',
    '/assets/avatar/Blue_013.png',
    '/assets/avatar/Blue_014.png',
    '/assets/avatar/Blue_015.png',
    '/assets/avatar/Blue_016.png',
    '/assets/avatar/Blue_017.png',
    '/assets/avatar/Blue_018.png',
    '/assets/avatar/Blue_019.png',
    '/assets/avatar/Blue_020.png'
  ];

  // Main load and render function
  async function loadAndRender() {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const profile = await res.json();
      originalProfile = { ...profile };
      
      // Load all data concurrently
      await Promise.all([
        loadStats(profile.id),
        loadHistory(),
        loadFriends()
      ]);
      
      renderContent(profile, editMode);
      setupEventListeners();
    } catch (error) {
      console.error('Error loading profile:', error);
      container.innerHTML = '<p>Error loading profile. Please try again.</p>';
    }
  }

  function renderContent(profile: any, isEdit: boolean) {
    const avatarSection = isEdit 
      ? `
      <div style="text-align:center;margin-bottom:15px">
        <div style="position:relative;display:inline-block">
          <img id="avatar-preview" src="${profile.avatar_url}" width="100" height="100" 
               style="border-radius:50%;border:3px solid #ddd;object-fit:cover;cursor:pointer" alt="Avatar"/>
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
                      border-radius:50%;display:flex;align-items:center;justify-content:center;
                      opacity:0;transition:opacity 0.3s;cursor:pointer" id="avatar-overlay">
            <span style="color:white;font-size:14px;font-weight:bold">📷 Change</span>
          </div>
        </div>
        <div style="margin-top:10px">
          <button id="avatar-btn" type="button" style="background:#17a2b8;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
            📷 Choose Avatar
          </button>
        </div>
      </div>`
      : `
      <div style="text-align:center;margin-bottom:15px">
        <img src="${profile.avatar_url}" width="100" height="100" 
             style="border-radius:50%;border:3px solid #ddd;object-fit:cover" alt="Avatar"/>
      </div>`;

    const profileHeader = isEdit
      ? `
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
        <div style="display:flex;align-items:flex-start;gap:20px">
          ${avatarSection}
          <div style="flex:1">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px">
              <div>
                <label style="display:block;margin-bottom:5px;font-weight:bold">Username:</label>
                <input id="username-input" type="text" value="${profile.username}" required minlength="3"
                       style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
                <small style="color:#666">Min 3 characters</small>
              </div>
              <div>
                <label style="display:block;margin-bottom:5px;font-weight:bold">Display Name:</label>
                <input id="display-input" type="text" value="${profile.display_name || profile.name}" required
                       style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
                <small style="color:#666">Public name shown in games</small>
              </div>
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Email:</label>
              <input id="email-input" type="email" value="${profile.email || ''}" 
                     style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
              <small style="color:#666">Optional - for account recovery</small>
            </div>
            <div style="display:grid;grid-template-columns:auto auto auto;gap:10px;justify-content:start">
              <button id="save-btn" style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold">
                💾 Save Changes
              </button>
              <button id="cancel-btn" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                ❌ Cancel
              </button>
              <button id="pass-btn" style="background:#ffc107;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                🔒 Change Password
              </button>
            </div>
            <div id="save-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
          </div>
        </div>
        <div style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;font-size:14px">
            <div><strong>Team:</strong> ${profile.team}</div>
            <div><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</div>
            <div><strong>Last seen:</strong> ${new Date(profile.last_seen).toLocaleString()}</div>
            <div><strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'}</div>
          </div>
        </div>
      </div>`
      : `
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
        <div style="display:flex;align-items:center;gap:20px">
          ${avatarSection}
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <h3 style="margin:0;color:#333">@${profile.username}</h3>
              <button id="edit-btn" title="Edit profile" 
                      style="background:none;border:none;cursor:pointer;font-size:18px;color:#007bff">
                🖊️
              </button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:15px">
              <div><strong>Display Name:</strong> ${profile.display_name || profile.name}</div>
              <div><strong>Email:</strong> ${profile.email || 'Not provided'}</div>
              <div><strong>Team:</strong> ${profile.team}</div>
              <div><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</div>
            </div>
            <div style="font-size:12px;color:#666">
              <strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'} • 
              <strong>Last seen:</strong> ${new Date(profile.last_seen).toLocaleString()}
            </div>
          </div>
        </div>
      </div>`;

    container.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;padding:20px">
        <h2 style="color:#333;border-bottom:3px solid #007bff;padding-bottom:10px;margin-bottom:20px">
          👤 Profile
        </h2>
        ${profileHeader}

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:30px;margin-top:30px">
          <div>
            <h3 style="color:#333;border-bottom:2px solid #28a745;padding-bottom:8px;margin-bottom:15px">
              📊 Game Statistics
            </h3>
            <div id="stats-container">
              ${renderStatsContent()}
            </div>

            <h3 style="color:#333;border-bottom:2px solid #ffc107;padding-bottom:8px;margin:30px 0 15px 0">
              🏆 Match History
            </h3>
            <div id="history-container">
              ${renderHistoryContent()}
            </div>
          </div>

          <div>
            <h3 style="color:#333;border-bottom:2px solid #dc3545;padding-bottom:8px;margin-bottom:15px">
              👥 Friends
            </h3>
            
            <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px">
              <h4 style="margin:0 0 10px 0;font-size:14px;color:#666">Add New Friend</h4>
              <div style="display:flex;gap:8px">
                <input id="friend-input" placeholder="Enter username..." 
                       style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px"/>
                <button id="friend-add" style="background:#007bff;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap">
                  ➕ Add
                </button>
              </div>
              <div id="friend-msg" style="margin-top:8px;font-size:12px"></div>
            </div>

            <div id="friends-container">
              ${renderFriendsContent()}
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:#28a745;color:#fff;padding:15px 20px;border-radius:5px;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:1000;max-width:300px"></div>
      
      <!-- Avatar Selection Modal -->
      <div id="avatar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:2000">
        <div style="background:#fff;padding:30px;border-radius:15px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="margin:0;color:#333;font-size:20px">🖼️ Choose Your Avatar</h3>
            <button id="avatar-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
          </div>
          <p style="color:#666;margin-bottom:20px;font-size:14px">Select an avatar from the options below:</p>
          <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:12px">
            ${availableAvatars.map((avatar, index) => `
              <div class="avatar-option" data-avatar="${avatar}" 
                   style="cursor:pointer;border:3px solid transparent;border-radius:12px;padding:8px;transition:all 0.3s;background:#f8f9fa">
                <img src="${avatar}" width="64" height="64" 
                     style="border-radius:50%;object-fit:cover;display:block;width:100%" 
                     alt="Avatar ${index + 1}"/>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:20px;text-align:center">
            <button id="avatar-confirm" disabled style="background:#007bff;color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold;opacity:0.5">
              Select Avatar
            </button>
          </div>
        </div>
      </div>
      
      <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:2000">
        <div style="background:#fff;padding:30px;border-radius:10px;width:400px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
          <h3 style="margin:0 0 20px 0;color:#333">🔒 Change Password</h3>
          <form id="pass-form">
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Current Password:</label>
              <input id="pass-cur" type="password" required 
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">New Password:</label>
              <input id="pass-new" type="password" minlength="6" required 
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
              <small style="color:#666">Minimum 6 characters</small>
            </div>
            <div style="margin-bottom:20px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Confirm Password:</label>
              <input id="pass-conf" type="password" minlength="6" required 
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" id="pass-cancel" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                Cancel
              </button>
              <button type="submit" style="background:#007bff;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                Update Password
              </button>
            </div>
            <div id="pass-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
          </form>
        </div>
      </div>`;
  }

  function renderStatsContent(): string {
    if (!currentStats || Object.keys(currentStats).length === 0) {
      return '<div style="padding:20px;text-align:center;color:#666">No statistics available</div>';
    }

    const winRate = currentStats.matches_played > 0 ? (currentStats.win_rate * 100).toFixed(1) : '0.0';
    const kd = currentStats.points_conceded > 0 ? (currentStats.points_scored / currentStats.points_conceded).toFixed(2) : currentStats.points_scored || '0';

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:15px">
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #007bff;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#007bff">${currentStats.matches_played}</div>
          <div style="font-size:12px;color:#666">Matches Played</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #28a745;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#28a745">${currentStats.matches_won}</div>
          <div style="font-size:12px;color:#666">Wins</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #dc3545;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#dc3545">${currentStats.matches_lost}</div>
          <div style="font-size:12px;color:#666">Losses</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #ffc107;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#ffc107">${winRate}%</div>
          <div style="font-size:12px;color:#666">Win Rate</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #17a2b8;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#17a2b8">${currentStats.points_scored}</div>
          <div style="font-size:12px;color:#666">Points Scored</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #6f42c1;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#6f42c1">${currentStats.points_conceded}</div>
          <div style="font-size:12px;color:#666">Points Conceded</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #e83e8c;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#e83e8c">${kd}</div>
          <div style="font-size:12px;color:#666">Score Ratio</div>
        </div>
        <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #fd7e14;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="font-size:24px;font-weight:bold;color:#fd7e14">${currentStats.tournaments_won}</div>
          <div style="font-size:12px;color:#666">Tournaments Won</div>
        </div>
      </div>`;
  }

  function renderHistoryContent(): string {
    if (!currentHistory || currentHistory.length === 0) {
      return '<div style="padding:20px;text-align:center;color:#666">No match history available</div>';
    }

    return `
      <div style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden">
        <div style="max-height:400px;overflow-y:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f8f9fa;position:sticky;top:0">
                <th style="padding:12px 15px;text-align:left;border-bottom:2px solid #dee2e6;font-size:14px;color:#495057">Date</th>
                <th style="padding:12px 15px;text-align:left;border-bottom:2px solid #dee2e6;font-size:14px;color:#495057">Opponent</th>
                <th style="padding:12px 15px;text-align:center;border-bottom:2px solid #dee2e6;font-size:14px;color:#495057">Score</th>
                <th style="padding:12px 15px;text-align:center;border-bottom:2px solid #dee2e6;font-size:14px;color:#495057">Result</th>
              </tr>
            </thead>
            <tbody>
              ${currentHistory.map((match: any) => `
                <tr style="border-bottom:1px solid #f1f3f4">
                  <td style="padding:12px 15px;font-size:13px">${new Date(match.date_played).toLocaleDateString()}</td>
                  <td style="padding:12px 15px;font-size:13px">Player ${match.opponent_id}</td>
                  <td style="padding:12px 15px;text-align:center;font-family:monospace;font-size:13px">${match.user_score} - ${match.opponent_score}</td>
                  <td style="padding:12px 15px;text-align:center">
                    <span style="color:${match.result === 'win' ? '#28a745' : '#dc3545'};font-weight:bold;font-size:13px">
                      ${match.result === 'win' ? '🏆 WIN' : '❌ LOSS'}
                    </span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function renderFriendsContent(): string {
    if (!currentFriends || currentFriends.length === 0) {
      return '<div style="padding:15px;text-align:center;color:#666;font-size:14px">No friends added yet</div>';
    }

    return `
      <div style="space-y:8px">
        ${currentFriends.map((friend: any) => `
          <div class="friend-item" data-id="${friend.friend_id}" data-name="${friend.display_name || friend.name}"
               style="background:#fff;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:relative;cursor:pointer;transition:all 0.2s">
            <div style="display:flex;align-items:center;gap:10px">
              <img src="${friend.avatar_url}" width="35" height="35" 
                   style="border-radius:50%;object-fit:cover;border:2px solid ${friend.online_status ? '#28a745' : '#6c757d'}" 
                   alt="Avatar"/>
              <div style="flex:1">
                <div style="font-weight:bold;font-size:14px;color:#333">${friend.display_name || friend.name}</div>
                <div style="font-size:12px;color:#666">@${friend.username} • ${friend.team}</div>
                <div style="font-size:11px;color:${friend.online_status ? '#28a745' : '#6c757d'}">
                  ${friend.online_status ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
              <button class="rm-btn" title="Remove friend"
                      style="display:none;background:#dc3545;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px;position:absolute;top:8px;right:8px">
                ×
              </button>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function setupEventListeners() {
    // Edit mode toggle
    document.getElementById('edit-btn')?.addEventListener('click', () => {
      editMode = true;
      renderContent(originalProfile, true);
      setupEventListeners();
    });

    // Cancel edit
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      editMode = false;
      renderContent(originalProfile, false);
      setupEventListeners();
    });

    // Save profile
    document.getElementById('save-btn')?.addEventListener('click', saveProfile);

    // Avatar selection
    setupAvatarSelection();

    // Password change
    document.getElementById('pass-btn')?.addEventListener('click', () => {
      (document.getElementById('pass-modal') as HTMLElement).style.display = 'flex';
    });

    setupPasswordModal();
    setupFriendsHandlers();
  }

  function setupAvatarSelection() {
    const avatarBtn = document.getElementById('avatar-btn');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarOverlay = document.getElementById('avatar-overlay');
    const avatarModal = document.getElementById('avatar-modal') as HTMLElement;
    const avatarModalClose = document.getElementById('avatar-modal-close');
    const avatarConfirm = document.getElementById('avatar-confirm') as HTMLButtonElement;
    
    let selectedAvatar = '';

    // Show modal handlers
    const showAvatarModal = () => {
      avatarModal.style.display = 'flex';
      setupAvatarGrid();
    };

    avatarBtn?.addEventListener('click', showAvatarModal);
    avatarPreview?.addEventListener('click', showAvatarModal);

    // Show overlay on hover (edit mode)
    if (avatarOverlay) {
      avatarPreview?.addEventListener('mouseenter', () => {
        avatarOverlay.style.opacity = '1';
      });
      avatarPreview?.addEventListener('mouseleave', () => {
        avatarOverlay.style.opacity = '0';
      });
      avatarOverlay.addEventListener('click', showAvatarModal);
    }

    // Close modal handlers
    avatarModalClose?.addEventListener('click', () => {
      avatarModal.style.display = 'none';
      selectedAvatar = '';
    });

    avatarModal.addEventListener('click', (e) => {
      if (e.target === avatarModal) {
        avatarModal.style.display = 'none';
        selectedAvatar = '';
      }
    });

    // Setup avatar grid selection
    function setupAvatarGrid() {
      const avatarOptions = document.querySelectorAll('.avatar-option');
      
      avatarOptions.forEach((option) => {
        option.addEventListener('click', () => {
          // Remove previous selection
          avatarOptions.forEach(opt => {
            (opt as HTMLElement).style.border = '3px solid transparent';
            (opt as HTMLElement).style.background = '#f8f9fa';
          });
          
          // Add selection to clicked avatar
          (option as HTMLElement).style.border = '3px solid #007bff';
          (option as HTMLElement).style.background = '#e3f2fd';
          
          selectedAvatar = option.getAttribute('data-avatar') || '';
          avatarConfirm.disabled = false;
          avatarConfirm.style.opacity = '1';
        });
      });
    }

    // Confirm avatar selection
    avatarConfirm?.addEventListener('click', () => {
      if (selectedAvatar) {
        // Update preview
        const preview = document.getElementById('avatar-preview') as HTMLImageElement;
        if (preview) {
          preview.src = selectedAvatar;
        }
        
        // Update original profile data
        originalProfile.avatar_url = selectedAvatar;
        
        // Close modal
        avatarModal.style.display = 'none';
        
        // Show notification
        notify('Avatar updated! Remember to save changes.', 'success');
        
        // Reset selection
        selectedAvatar = '';
        avatarConfirm.disabled = true;
        avatarConfirm.style.opacity = '0.5';
      }
    });
  }

  async function saveProfile() {
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    const errorDiv = document.getElementById('save-error') as HTMLDivElement;
    
    // Clear previous errors
    errorDiv.textContent = '';
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';

    const username = (document.getElementById('username-input') as HTMLInputElement).value.trim();
    const display_name = (document.getElementById('display-input') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email-input') as HTMLInputElement).value.trim();
    const avatar_url = originalProfile.avatar_url;

    // Client-side validation
    if (username.length < 3) {
      showError('Username must be at least 3 characters long');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Changes';
      return;
    }

    if (email && !email.includes('@')) {
      showError('Please enter a valid email address');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Changes';
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ username, display_name, email, avatar_url })
      });

      const result = await res.json();

      if (res.ok) {
        // Update original profile with new data
        originalProfile = { ...originalProfile, username, display_name, email, avatar_url };
        editMode = false;
        notify('Profile updated successfully!', 'success');
        renderContent(originalProfile, false);
        setupEventListeners();
      } else {
        showError(result.error || 'Failed to save profile');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }

    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save Changes';
  }

  function showError(message: string) {
    const errorDiv = document.getElementById('save-error') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      setTimeout(() => errorDiv.textContent = '', 5000);
    }
  }

  function setupPasswordModal() {
    const modal = document.getElementById('pass-modal') as HTMLElement;
    
    document.getElementById('pass-cancel')?.addEventListener('click', () => {
      modal.style.display = 'none';
      clearPasswordForm();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        clearPasswordForm();
      }
    });

    document.getElementById('pass-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPass = (document.getElementById('pass-cur') as HTMLInputElement).value;
      const newPass = (document.getElementById('pass-new') as HTMLInputElement).value;
      const confirmPass = (document.getElementById('pass-conf') as HTMLInputElement).value;
      const errorDiv = document.getElementById('pass-error') as HTMLDivElement;
      
      errorDiv.textContent = '';

      if (newPass !== confirmPass) {
        errorDiv.textContent = 'New passwords do not match';
        return;
      }

      if (newPass.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        return;
      }

      try {
        const res = await fetch('/api/profile/change-password', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            currentPassword: currentPass, 
            newPassword: newPass 
          })
        });

        const result = await res.json();

        if (res.ok) {
          modal.style.display = 'none';
          clearPasswordForm();
          notify('Password changed successfully!', 'success');
        } else {
          errorDiv.textContent = result.error || 'Failed to change password';
        }
      } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
      }
    });
  }

  function clearPasswordForm() {
    (document.getElementById('pass-cur') as HTMLInputElement).value = '';
    (document.getElementById('pass-new') as HTMLInputElement).value = '';
    (document.getElementById('pass-conf') as HTMLInputElement).value = '';
    (document.getElementById('pass-error') as HTMLDivElement).textContent = '';
  }

  function setupFriendsHandlers() {
    const input = document.getElementById('friend-input') as HTMLInputElement;
    const btn = document.getElementById('friend-add') as HTMLButtonElement;
    const msgDiv = document.getElementById('friend-msg') as HTMLDivElement;

    const addFriend = async () => {
      const username = input.value.trim();
      if (!username) {
        showFriendMsg('Please enter a username', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ Adding...';

      try {
        const res = await fetch('/api/friends/request', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ friendUsername: username })
        });

        const result = await res.json();

        if (res.ok) {
          showFriendMsg(`Friend request sent to ${username}!`, 'success');
          input.value = '';
          setTimeout(() => loadFriends(), 1000);
        } else {
          showFriendMsg(result.error || 'Failed to send friend request', 'error');
        }
      } catch (error) {
        showFriendMsg('Network error occurred', 'error');
      }

      btn.disabled = false;
      btn.textContent = '➕ Add';
    };

    btn.addEventListener('click', addFriend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addFriend();
    });

    // Friend removal handlers
    document.querySelectorAll('.friend-item').forEach(item => {
      const removeBtn = item.querySelector('.rm-btn') as HTMLElement;
      
      item.addEventListener('mouseenter', () => {
        removeBtn.style.display = 'block';
        (item as HTMLElement).style.backgroundColor = '#f8f9fa';
      });
      
      item.addEventListener('mouseleave', () => {
        removeBtn.style.display = 'none';
        (item as HTMLElement).style.backgroundColor = '#fff';
      });
      
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const friendId = item.getAttribute('data-id');
        const friendName = item.getAttribute('data-name');
        
        if (friendId && friendName && confirm(`Remove ${friendName} from your friends?`)) {
          await removeFriend(friendId, friendName);
        }
      });
    });
  }

  function showFriendMsg(message: string, type: 'success' | 'error') {
    const msgDiv = document.getElementById('friend-msg') as HTMLDivElement;
    msgDiv.textContent = message;
    msgDiv.style.color = type === 'success' ? '#28a745' : '#dc3545';
    setTimeout(() => msgDiv.textContent = '', 3000);
  }

  async function removeFriend(friendId: string, friendName: string) {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        notify(`${friendName} removed from friends`, 'success');
        await loadFriends();
        updateFriendRequestsBadge();
      } else {
        const result = await res.json();
        notify(result.error || 'Failed to remove friend', 'error');
      }
    } catch (error) {
      notify('Network error occurred', 'error');
    }
  }

  async function loadStats(userId: number) {
    try {
      const res = await fetch(`/stats/${userId}`);
      if (res.ok) {
        currentStats = await res.json();
      } else {
        currentStats = {};
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      currentStats = {};
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/match-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        currentHistory = await res.json();
      } else {
        currentHistory = [];
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      currentHistory = [];
    }
  }

  async function loadFriends() {
    try {
      const res = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        currentFriends = result.friends || [];
      } else {
        currentFriends = [];
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
      currentFriends = [];
    }
  }

  function notify(message: string, type: 'success' | 'error') {
    const notification = document.getElementById('notification') as HTMLElement;
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 4000);
  }

  // Initialize the page
  loadAndRender();
}

updateFriendRequestsBadge();