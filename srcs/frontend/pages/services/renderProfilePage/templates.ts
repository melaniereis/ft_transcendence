// Tipagem global para window.state (usado na paginação de friends)
declare global {
	interface Window {
		state: any;
		renderProfilePage?: (container: HTMLElement, onBadgeUpdate?: () => void) => void;
	}
}
// renderProfilePage/templates.ts - FIXED VERSION with working PetalFall animation
import { AVAILABLE_AVATARS, Friend, Match, Profile, Stats } from './types.js';
import {
	averageScore, bestPerformance, consistencyScore, bestPlayingDay, clutchFactor, currentMomentum,
	dominanceRating, efficiencyScore, gamesThisWeek, longestWinStreak, mostActiveTime, opponentAnalysis
} from './metrics.js';
// GRIS-inspired color palette: soft blues, lavenders, greys, muted golds, gentle pinks
const GRID_COLORS = {
	primary: '#6b7a8f', // Soft blue-grey
	secondary: '#f8f9f8', // Light gray
	accent: '#b6a6ca', // Muted lavender
	warm: '#e6c79c', // Muted gold
	cool: '#7fc7d9', // Soft blue
	success: '#a3d9b1', // Gentle green
	muted: '#eaeaea', // Pale gray
	bg: '#f4f6fa' // Very light blue/gray
};
// Team logo mapping
const TEAM_LOGOS = {
	'HACKTIVISTS': '/assets/hacktivists.png',
	'BUG BUSTERS': '/assets/bugbusters.png',
	'LOGIC LEAGUE': '/assets/logicleague.png',
	'CODE ALLIANCE': '/assets/codealliance.png'
};

export function header(profile: Profile, isEdit: boolean): string {
	const teamLogo = TEAM_LOGOS[profile.team?.toUpperCase() as keyof typeof TEAM_LOGOS] || '';
	const avatar = isEdit
		? `
    <div style="text-align:center;margin-bottom:20px">
      <div style="position:relative;display:inline-block">
        <img id="avatar-preview" src="${profile.avatar_url}" width="120" height="120"
             style="border-radius:50%;border:4px solid ${GRID_COLORS.cool};object-fit:cover;cursor:pointer;
                    box-shadow:0 8px 32px rgba(0,174,239,0.2);" alt="Avatar"/>
        <div id="avatar-overlay" style="position:absolute;inset:0;background:rgba(28,33,38,0.7);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;cursor:pointer">
          <span style="color:white;font-size:14px;font-weight:600">📷 Change</span>
        </div>
      </div>
      <div style="margin-top:15px">
        <button id="avatar-btn" type="button"
                style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:8px 16px;
                       border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;
                       transition:all 0.3s;box-shadow:0 4px 12px rgba(0,174,239,0.3)">
          📷 Choose Avatar
        </button>
      </div>
    </div>`
		: `
    <div style="text-align:center;margin-bottom:20px">
      <div style="position:relative;display:inline-block">
        <img src="${profile.avatar_url}" width="120" height="120"
             style="border-radius:50%;border:4px solid ${GRID_COLORS.cool};object-fit:cover;
                    box-shadow:0 8px 32px rgba(0,174,239,0.2);" alt="Avatar"/>
${teamLogo ? `
          <img src="${teamLogo}" width="40" height="40"
               style="position:absolute;bottom:-5px;right:-5px;border-radius:50%;
                      border:3px solid white;background:white;object-fit:contain" alt="Team Logo"/>
        ` : ''}
      </div>
    </div>`;
	const createdAtText = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—';
	return isEdit
		? `
    <div class="header-edit" style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);
                padding:30px;border-radius:20px;margin:20px 0;
                box-shadow:0 8px 32px rgba(0,174,239,0.2);border:1px solid ${GRID_COLORS.cool};">
      <div class="header-content" style="display:flex;align-items:flex-start;gap:30px;flex-wrap:wrap">
${avatar}
        <div style="flex:1;min-width:300px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:20px">
            <div>
              <label style="display:block;margin-bottom:8px;font-weight:600;color:${GRID_COLORS.primary}">Username:</label>
              <input id="username-input" type="text" value="${profile.username}" required minlength="3"
                     style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.secondary};border-radius:12px;
                            font-size:14px;transition:border-color 0.3s;background:${GRID_COLORS.bg}"/>
              <small style="color:${GRID_COLORS.muted}">Min 3 characters</small>
            </div>
            <div>
              <label style="display:block;margin-bottom:8px;font-weight:600;color:${GRID_COLORS.primary}">Display Name:</label>
              <input id="display-input" type="text" value="${profile.display_name || profile.name || ''}" required
                     style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.secondary};border-radius:12px;
                            font-size:14px;transition:border-color 0.3s;background:${GRID_COLORS.bg}"/>
              <small style="color:${GRID_COLORS.muted}">Public name shown in games</small>
            </div>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:8px;font-weight:600;color:${GRID_COLORS.primary}">Email:</label>
            <input id="email-input" type="email" value="${profile.email || ''}"
                   style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.secondary};border-radius:12px;
                          font-size:14px;transition:border-color 0.3s;background:${GRID_COLORS.bg}"/>
            <small style="color:${GRID_COLORS.muted}">Optional - for account recovery</small>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button id="save-btn"
                    style="background:${GRID_COLORS.success};color:#fff;border:none;padding:12px 24px;
                           border-radius:20px;cursor:pointer;font-weight:600;font-size:14px;
                           transition:all 0.3s;box-shadow:0 4px 12px rgba(0,213,99,0.3)">
              💾 Save Changes
            </button>
            <button id="cancel-btn"
                    style="background:${GRID_COLORS.warm};color:#fff;border:none;padding:12px 24px;
                           border-radius:20px;cursor:pointer;font-weight:500;font-size:14px;
                           transition:all 0.3s">
              ❌ Cancel
            </button>
            <button id="pass-btn"
                    style="background:${GRID_COLORS.warm};color:#fff;border:none;padding:12px 24px;
                           border-radius:20px;cursor:pointer;font-weight:500;font-size:14px;
                           transition:all 0.3s;box-shadow:0 4px 12px rgba(155,89,182,0.3)">
              🔒 Change Password
            </button>
          </div>
          <div id="save-error" style="color:${GRID_COLORS.accent};margin-top:15px;font-size:14px;font-weight:500"></div>
        </div>
      </div>
      <div style="margin-top:25px;padding-top:25px;border-top:1px solid ${GRID_COLORS.cool}">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;font-size:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-weight:600;color:${GRID_COLORS.primary}">Team:</span>
            <div style="display:flex;align-items:center;gap:8px">
${teamLogo ? `<img src="${teamLogo}" width="24" height="24" style="border-radius:50%" alt="Team"/>` : ''}
              <span>${profile.team || '—'}</span>
            </div>
          </div>
          <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Member since:</span> ${createdAtText}</div>
          <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Last seen:</span> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString().substring(0, 10) : '—'}</div>
          <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Status:</span> ${profile.online_status ? '🟢 Online' : '🔴 Offline'}</div>
        </div>
      </div>
    </div>`
		: `
    <div class="header-view" style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);
                padding:30px;border-radius:20px;margin:20px 0;
                box-shadow:0 8px 32px rgba(0,174,239,0.2);border:1px solid ${GRID_COLORS.cool};">
      <div class="header-content" style="display:flex;align-items:center;gap:30px;flex-wrap:wrap">
${avatar}
        <div style="flex:1;min-width:300px">
          <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px">
            <h3 style="margin:0;color:${GRID_COLORS.primary};font-size:28px;font-weight:700">@${profile.username}</h3>
            <button id="edit-btn" title="Edit profile"
                    style="background:none;border:none;cursor:pointer;font-size:20px;color:${GRID_COLORS.cool};
                           padding:8px;border-radius:50%;transition:all 0.3s">🖊️</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-weight:600;color:${GRID_COLORS.primary}">Display Name:</span>
              <span style="color:${GRID_COLORS.muted}">${profile.display_name || profile.name || '—'}</span>
            </div>
            <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Email:</span> <span style="color:${GRID_COLORS.muted}">${profile.email || 'Not provided'}</span></div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-weight:600;color:${GRID_COLORS.primary}">Team:</span>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="color:${GRID_COLORS.muted}">${profile.team || '—'}</span>
              </div>
            </div>
            <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Member since:</span> <span style="color:${GRID_COLORS.muted}">${createdAtText}</span></div>
          </div>
          <div style="font-size:14px;color:${GRID_COLORS.muted};padding:12px;background:rgba(0,174,239,0.1);border-radius:8px">
            <span style="font-weight:600;color:${GRID_COLORS.primary}">Status:</span> ${profile.online_status ? '🟢 Online' : '🔴 Offline'} •
            <span style="font-weight:600;color:${GRID_COLORS.primary}">Last seen:</span> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString().substring(0, 10) : '—'}
          </div>
        </div>
      </div>
    </div>`;
}
export function friendsList(friends: Friend[]): string {
	if (!friends || friends.length === 0) {
		return `<div style="padding:32px 0;text-align:center;color:${GRID_COLORS.muted};font-size:16px;letter-spacing:0.5px;">No friends added yet</div>`;
	}

	// Paginação: 10 por página, 2 colunas
	const pageSize = 10;
	const page = (window.state && typeof window.state.friendsPage === 'number') ? window.state.friendsPage : 0;
	const totalPages = Math.ceil(friends.length / pageSize);
	const start = page * pageSize;
	const end = start + pageSize;
	const pageFriends = friends.slice(start, end);
	const col1 = pageFriends.slice(0, 5);
	const col2 = pageFriends.slice(5, 10);

	function friendCard(f: any) {
		const id = f.friend_id ?? f.id ?? f.userId ?? '';
		const displayName = f.display_name || f.name || f.username || 'Unknown';
		const username = f.username || '';
		const avatar = f.avatar_url || '/assets/avatar/default.png';
		const online = !!f.online_status;
		return `
    <div class="friend-item" data-id="${id}" data-name="${displayName}"
      style="background:linear-gradient(120deg, #f8f9f8 0%, #eaeaea 100%);border-radius:18px;box-shadow:0 2px 12px rgba(0,174,239,0.10);display:flex;align-items:center;gap:18px;padding:20px 22px;position:relative;transition:box-shadow 0.2s, transform 0.2s;cursor:pointer;overflow:hidden;"
    >
      <img src="${avatar}" width="54" height="54" style="border-radius:50%;object-fit:cover;border:3px solid ${online ? GRID_COLORS.success : GRID_COLORS.accent};box-shadow:0 2px 8px #b6a6ca22;transition:border 0.2s;" alt="Avatar"/>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:17px;color:${GRID_COLORS.primary};text-overflow:ellipsis;overflow:hidden;white-space:nowrap;letter-spacing:0.2px;">${displayName}
          <span style="margin-left:10px;vertical-align:middle;display:inline-block;padding:2px 12px;border-radius:12px;font-size:12px;font-weight:600;background:${online ? GRID_COLORS.success : GRID_COLORS.accent};color:#fff;box-shadow:0 1px 4px #a3d9b133;">${online ? 'Online' : 'Offline'}</span>
        </div>
        <div style="font-size:13px;color:${GRID_COLORS.muted};margin-top:2px;">@${username}</div>
      </div>
      <button class="remove-friend-btn" data-action="remove-friend" data-id="${id}" data-friend-id="${id}" data-name="${displayName}" data-friend-name="${displayName}"
        title="Remove friend"
        style="background:transparent;border:none;outline:none;cursor:pointer;padding:0 0 0 10px;display:flex;align-items:center;opacity:0.5;transition:opacity 0.2s;z-index:2;">
        <span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#ff5c5c;color:#fff;font-size:20px;line-height:36px;text-align:center;transition:background 0.2s;box-shadow:0 2px 8px #b6a6ca22;">×</span>
      </button>
      <div class="friend-hover-overlay" style="position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 0.2s;background:linear-gradient(90deg,rgba(123,97,255,0.07),rgba(174,239,239,0.09));z-index:1;"></div>
    </div>
    `;
	}

	return `
  <div style="max-width:700px;margin:0 auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
      <div style="font-size:18px;font-weight:600;color:${GRID_COLORS.primary};letter-spacing:0.5px;">Your Friends <span style="font-size:13px;color:${GRID_COLORS.accent};font-weight:400">(${friends.length})</span></div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button id="friends-prev" style="background:${GRID_COLORS.accent};color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;opacity:${page === 0 ? 0.3 : 1};pointer-events:${page === 0 ? 'none' : 'auto'};transition:opacity 0.2s;">&#8592;</button>
        <span style="font-size:13px;color:${GRID_COLORS.primary};font-weight:500;">${page + 1}/${totalPages}</span>
        <button id="friends-next" style="background:${GRID_COLORS.accent};color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;opacity:${page === totalPages - 1 ? 0.3 : 1};pointer-events:${page === totalPages - 1 ? 'none' : 'auto'};transition:opacity 0.2s;">&#8594;</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
      <div>
        ${col1.map(friendCard).join('')}
      </div>
      <div>
        ${col2.map(friendCard).join('')}
      </div>
    </div>
  </div>
  <!-- Navegação controlada por event delegation no profile.ts -->
`;
}
export function historyList(history: Match[]): string {
	const recent = history.slice(0, 5);
	if (!recent.length) {
		return `
      <div style="padding:40px;text-align:center;color:${GRID_COLORS.muted};
                  background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);border-radius:12px;">
        <div style="font-size:48px;margin-bottom:15px">🎮</div>
        <h4 style="margin:0 0 10px 0;color:${GRID_COLORS.primary}">No Match History</h4>
        <p style="margin:0">Your game history will appear here once you start playing!</p>
      </div>
    `;
	}
	return `
    <div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:15px;margin-bottom:25px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.success} 0%, ${GRID_COLORS.bg} 100%);
                    padding:20px;border-radius:15px;border-left:4px solid ${GRID_COLORS.success};text-align:center;">
          <div style="font-size:24px;font-weight:700;color:${GRID_COLORS.success}">${history.filter(m => m.result === 'win').length}</div>
          <div style="font-size:12px;color:${GRID_COLORS.muted};font-weight:600">Total Wins</div>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.accent} 0%, ${GRID_COLORS.bg} 100%);
                    padding:20px;border-radius:15px;border-left:4px solid ${GRID_COLORS.accent};text-align:center;">
          <div style="font-size:24px;font-weight:700;color:${GRID_COLORS.accent}">${history.filter(m => m.result === 'loss').length}</div>
          <div style="font-size:12px;color:${GRID_COLORS.muted};font-weight:600">Total Losses</div>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);
                    padding:20px;border-radius:15px;border-left:4px solid ${GRID_COLORS.cool};text-align:center;">
          <div style="font-size:24px;font-weight:700;color:${GRID_COLORS.cool}">${(history.filter(m => m.result === 'win').length + (history.filter(m => m.result === 'loss').length))}</div>
          <div style="font-size:12px;color:${GRID_COLORS.muted};font-weight:600">Total Matches</div>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.warm} 0%, ${GRID_COLORS.bg} 100%);
                    padding:20px;border-radius:15px;border-left:4px solid ${GRID_COLORS.warm};text-align:center;">
          <div style="font-size:24px;font-weight:700;color:${GRID_COLORS.warm}">${longestWinStreak(history)}</div>
          <div style="font-size:12px;color:${GRID_COLORS.muted};font-weight:600">Best Streak</div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg, white 0%, ${GRID_COLORS.bg} 100%);border-radius:15px;overflow:hidden;
                  box-shadow:0 8px 32px rgba(0,174,239,0.1);border:1px solid ${GRID_COLORS.cool};">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-bottom:1px solid ${GRID_COLORS.cool}">
          <h4 style="margin:0;color:${GRID_COLORS.primary};font-size:18px;font-weight:700">🕒 Recent Matches</h4>
          <p style="margin:5px 0 0 0;color:${GRID_COLORS.muted};font-size:14px">Your 5 most recent games</p>
        </div>
        <div>
${recent.map((m, index) => `
            <div class="match-item" style="padding:20px;border-bottom:1px solid ${GRID_COLORS.cool};display:flex;align-items:center;gap:15px;
                        background:${index % 2 === 0 ? 'white' : GRID_COLORS.bg}05">
              <div style="flex-shrink:0;width:50px;height:50px;border-radius:50%;
                          background:${m.result === 'win' ? GRID_COLORS.success : GRID_COLORS.accent};
                          display:flex;align-items:center;justify-content:center;font-size:20px;color:white">
${m.result === 'win' ? '🏆' : '❌'}
              </div>
              <div style="flex:1">
                <div style="font-weight:700;color:${GRID_COLORS.primary};font-size:16px">
                  vs ${m.opponent_name || `Player ${m.opponent_id}`}
                </div>
                <div style="color:${GRID_COLORS.muted};font-size:14px;margin-top:2px">
${new Date(m.date_played).toLocaleDateString()} • ${m.user_score} - ${m.opponent_score}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:18px;font-weight:700;color:${m.result === 'win' ? GRID_COLORS.success : GRID_COLORS.accent}">
${m.result === 'win' ? '+' : '-'}${Math.abs(m.user_score - m.opponent_score)}
                </div>
                <div style="color:${GRID_COLORS.muted};font-size:12px">Score Diff</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
export function historyDetailed(history: Match[]): string {
	return `
    <div>
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:15px;border-radius:8px;margin-bottom:20px;">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <label style="font-weight:bold;color:${GRID_COLORS.primary}">Filter:</label>
          <select id="match-filter" style="padding:6px 12px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;background:${GRID_COLORS.bg}">
            <option value="all">All Matches</option>
            <option value="wins">Wins Only</option>
            <option value="losses">Losses Only</option>
            <option value="close">Close Games</option>
            <option value="blowouts">Decisive Wins</option>
          </select>
          <select id="time-filter" style="padding:6px 12px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;background:${GRID_COLORS.bg}">
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
          <button data-action="apply-history-filters" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">🔍 Apply</button>
        </div>
      </div>
      <div id="filtered-matches" style="display:grid;gap:15px">
${history.slice(0, 6).map((m, idx) => `
          <div style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,174,239,0.1);border-left:5px solid ${m.result === 'win' ? GRID_COLORS.success : GRID_COLORS.accent};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${m.result === 'win' ? GRID_COLORS.success : GRID_COLORS.accent};color:#fff;font-size:16px">
${m.result === 'win' ? '🏆' : '❌'}
                </div>
                <div>
                  <h4 style="margin:0;color:${GRID_COLORS.primary}">Match #${history.length - idx}</h4>
                  <div style="font-size:13px;color:${GRID_COLORS.muted}">${new Date(m.date_played).toLocaleString()}</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-family:monospace;font-size:24px;font-weight:bold;color:${GRID_COLORS.primary}">${m.user_score} - ${m.opponent_score}</div>
                <div style="font-size:12px;color:${m.result === 'win' ? GRID_COLORS.success : GRID_COLORS.accent};font-weight:bold">${m.result === 'win' ? 'VICTORY' : 'DEFEAT'}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:15px">
              <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:12px;border-radius:8px;">
                <div style="font-size:12px;color:${GRID_COLORS.muted};margin-bottom:4px">OPPONENT</div>
                <div style="font-weight:bold;color:${GRID_COLORS.primary}">Player ${m.opponent_id}</div>
              </div>
              <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:12px;border-radius:8px;">
                <div style="font-size:12px;color:${GRID_COLORS.muted};margin-bottom:4px">MATCH TYPE</div>
                <div style="font-weight:bold;color:${GRID_COLORS.primary}">${Math.abs(m.user_score - m.opponent_score) <= 2 ? 'NAIL-BITER' :
			Math.abs(m.user_score - m.opponent_score) <= 5 ? 'CLOSE' :
				Math.abs(m.user_score - m.opponent_score) <= 10 ? 'COMPETITIVE' : 'DOMINANT'
		}</div>
              </div>
              <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:12px;border-radius:8px;">
                <div style="font-size:12px;color:${GRID_COLORS.muted};margin-bottom:4px">SCORE DIFF</div>
                <div style="font-weight:bold;color:${Math.abs(m.user_score - m.opponent_score) > 5 ? GRID_COLORS.accent : GRID_COLORS.success}">${Math.abs(m.user_score - m.opponent_score)} pts</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
export function statsOverview(stats: Stats, history: Match[]): string {
	const wr = (stats.win_rate * 100).toFixed(1);
	const kd = stats.points_conceded ? (stats.points_scored / stats.points_conceded).toFixed(2) : String(stats.points_scored);
	const avgP = stats.matches_played ? (stats.points_scored / stats.matches_played).toFixed(1) : '0';
	const avgC = stats.matches_played ? (stats.points_conceded / stats.matches_played).toFixed(1) : '0';
	const ws = longestWinStreak(history);
	const best = bestPerformance(history);
	return `
    <div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:30px">
${[
			{ label: 'Total Matches', value: stats.matches_played, color: GRID_COLORS.cool, icon: '🎮', sub: 'Games played' },
			{ label: 'Win Rate', value: `${wr}%`, color: parseFloat(wr) >= 50 ? GRID_COLORS.success : GRID_COLORS.accent, icon: '🏆', sub: `${stats.matches_won}W / ${stats.matches_lost}L` },
			{ label: 'Score Ratio', value: kd, color: parseFloat(kd) >= 1 ? GRID_COLORS.success : GRID_COLORS.warm, icon: '⚡', sub: 'Scored / Conceded' },
			{ label: 'Tournaments Won', value: stats.tournaments_won || 0, color: GRID_COLORS.warm, icon: '🏅', sub: 'Titles' }
		].map(s => `
          <div style="background:linear-gradient(135deg, ${s.color}15, ${s.color}05);padding:20px;border-radius:12px;border-left:4px solid ${s.color};">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-size:28px;font-weight:bold;color:${s.color}">${s.value}</div>
              <div style="font-size:24px;opacity:0.7">${s.icon}</div>
            </div>
            <div style="font-size:14px;font-weight:bold;color:${GRID_COLORS.primary};margin-bottom:2px">${s.label}</div>
            <div style="font-size:12px;color:${GRID_COLORS.muted}">${s.sub}</div>
          </div>
        `).join('')}
      </div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>📊</span> Scoring Statistics</h4>
          <div>
${[
			['Total Points Scored', `<strong style="color:${GRID_COLORS.success}">${stats.points_scored}</strong>`],
			['Total Points Conceded', `<strong style="color:${GRID_COLORS.accent}">${stats.points_conceded}</strong>`],
			['Avg Points per Match', `<strong style="color:${GRID_COLORS.cool}">${avgP}</strong>`],
			['Avg Conceded per Match', `<strong style="color:${GRID_COLORS.warm}">${avgC}</strong>`],
		].map(([l, v], i, arr) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < arr.length - 1 ? 'border-bottom:1px solid rgba(0,174,239,0.2)' : ''}">
                <span style="color:${GRID_COLORS.muted}">${l}</span>${v}
              </div>
            `).join('')}
          </div>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>🎯</span> Performance Metrics</h4>
          <div>
${[
			['Current Win Streak', `<strong style="color:${ws > 0 ? GRID_COLORS.success : GRID_COLORS.accent}">${ws}</strong>`],
			['Best Match Score', `<strong style="color:${GRID_COLORS.cool}">${best.score ?? 'N/A'}</strong>`],
			['Games This Week', `<strong style="color:${GRID_COLORS.cool}">${gamesThisWeek(history)}</strong>`],
			['Favorite Time', `<strong style="color:${GRID_COLORS.cool}">${mostActiveTime(history)}</strong>`],
		].map(([l, v], i, arr) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < arr.length - 1 ? 'border-bottom:1px solid rgba(0,174,239,0.2)' : ''}">
                <span style="color:${GRID_COLORS.muted}">${l}</span>${v}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
export function statsPerformance(stats: Stats, history: Match[]): string {
	const avg = averageScore(history).toFixed(1);
	const cons = consistencyScore(history);
	const clutch = clutchFactor(history);
	const dom = dominanceRating(history);
	const eff = efficiencyScore(stats).toFixed(1);
	return `
    <div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">📊 Recent Match Scores</h4>
          <canvas id="performanceChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">🏆 Performance Rankings</h4>
${[
			{ label: 'Consistency', value: `${cons}%`, desc: 'Performance stability', color: cons >= 70 ? GRID_COLORS.success : cons >= 50 ? GRID_COLORS.warm : GRID_COLORS.accent, icon: '🎯' },
			{ label: 'Clutch Factor', value: `${clutch}%`, desc: 'Close game wins', color: clutch >= 60 ? GRID_COLORS.success : GRID_COLORS.warm, icon: '🔥' },
			{ label: 'Dominance', value: `${dom}%`, desc: 'Big-margin wins', color: GRID_COLORS.cool, icon: '👑' },
			{ label: 'Efficiency', value: eff, desc: 'Performance per match', color: GRID_COLORS.accent, icon: '⚡' },
		].map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:${GRID_COLORS.bg};border-radius:8px;border-left:4px solid ${r.color};margin-bottom:10px;">
              <div style="font-size:20px">${r.icon}</div>
              <div style="flex:1">
                <div style="font-weight:bold;color:${GRID_COLORS.primary}">${r.label}</div>
                <div style="font-size:12px;color:${GRID_COLORS.muted}">${r.desc}</div>
              </div>
              <div style="font-weight:bold;color:${r.color}">${r.value}</div>
            </div>`).join('')}
        </div>
      </div>
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;margin-bottom:20px;">
        <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">🔥 Activity Heatmap (7 days)</h4>
        <canvas id="activityHeatmap" width="600" height="100" style="width:100%;height:100px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
      </div>
    </div>
  `;
}
export function statsTrends(stats: Stats): string {
	return `
    <div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;margin-bottom:30px">
${[
			{ label: 'Win Rate', value: `${(stats.win_rate * 100).toFixed(1)}%`, color: GRID_COLORS.success, icon: '🏆', period: 'current' },
			{ label: 'Avg Score', value: (stats.matches_played ? (stats.points_scored / stats.matches_played).toFixed(1) : '0'), color: GRID_COLORS.cool, icon: '📊', period: 'per match' },
			{ label: 'Games/Week', value: String(gamesThisWeek([])), color: GRID_COLORS.cool, icon: '🎮', period: 'this week' }, /* updated at runtime in index */
		].map(t => `
          <div style="background:linear-gradient(135deg, ${t.color}15, ${t.color}05);padding:18px;border-radius:12px;border-left:4px solid ${t.color};">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:20px">${t.icon}</span>
              <div style="text-align:right"><div style="font-size:16px;font-weight:bold;color:${t.color}">${t.value}</div></div>
            </div>
            <div style="font-size:14px;font-weight:bold;color:${GRID_COLORS.primary}">${t.label}</div>
            <div style="font-size:12px;color:${GRID_COLORS.muted}">${t.period}</div>
          </div>
        `).join('')}
      </div>
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;margin-bottom:30px;">
        <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">📈 Win Rate Progression</h4>
        <canvas id="trendsChart" width="800" height="300" style="width:100%;height:300px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
      </div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">📅 Weekly Breakdown</h4>
          <canvas id="weeklyChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">⏰ Time-based Performance</h4>
          <canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
      </div>
    </div>
  `;
}
export function historyAnalysis(history: Match[]): string {
	return `
    <div>
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;margin-bottom:25px;">
        <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">📈 Match Performance Analysis</h4>
        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
          <div><canvas id="winRateChart" width="250" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas></div>
          <div><canvas id="scoreDistribution" width="250" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas></div>
        </div>
      </div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:25px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,174,239,0.1);">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">🎯 Performance Patterns</h4>
${[
			{ label: 'Best Day', value: bestPlayingDay(history), desc: 'Highest win rate', color: GRID_COLORS.success },
			{ label: 'Preferred Time', value: mostActiveTime(history), desc: 'Most active period', color: GRID_COLORS.cool },
			{ label: 'Momentum', value: currentMomentum(history), desc: 'Recent trend', color: GRID_COLORS.cool },
		].map(p => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);border-radius:8px;margin-bottom:10px;">
              <div><div style="font-weight:bold;color:${GRID_COLORS.primary}">${p.label}</div><div style="font-size:12px;color:${GRID_COLORS.muted}">${p.desc}</div></div>
              <div style="font-weight:bold;color:${p.color}">${p.value}</div>
            </div>
          `).join('')}
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,174,239,0.1);">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">👥 Opponent Analysis</h4>
${opponentAnalysis(history).map((o, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid rgba(0,174,239,0.2)">
              <div style="width:30px;height:30px;border-radius:50%;background:${GRID_COLORS.cool};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px">${i + 1}</div>
              <div style="flex:1">
                <div style="font-weight:bold;color:${GRID_COLORS.primary}">Player ${o.id}</div>
                <div style="font-size:12px;color:${GRID_COLORS.muted}">${o.matches} matches</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:bold;color:${o.winRate >= 50 ? GRID_COLORS.success : GRID_COLORS.accent}">${o.winRate}%</div>
                <div style="font-size:12px;color:${GRID_COLORS.muted}">${o.record}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
export function modals(): string {
	return `
    <div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:${GRID_COLORS.success};color:#fff;padding:15px 20px;border-radius:5px;z-index:1000;max-width:300px"></div>
    <div id="avatar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:2000">
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:30px;border-radius:15px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 30px rgba(0,174,239,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0;color:${GRID_COLORS.primary};font-size:20px">🖼️ Choose Your Avatar</h3>
          <button id="avatar-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:${GRID_COLORS.muted};width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
        </div>
        <p style="color:${GRID_COLORS.muted};margin-bottom:20px;font-size:14px">Select an avatar from the options below:</p>
        <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:12px">
${AVAILABLE_AVATARS.map((a, i) => `
            <div class="avatar-option" data-avatar="${a}" style="cursor:pointer;border:3px solid transparent;border-radius:12px;padding:8px;transition:all 0.3s;background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);">
              <img src="${a}" width="64" height="64" style="border-radius:50%;object-fit:cover;display:block;width:100%" alt="Avatar ${i + 1}"/>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;text-align:center">
          <button id="avatar-confirm" disabled style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;opacity:0.5">Select Avatar</button>
        </div>
      </div>
    </div>
    <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:2000">
      <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:30px;border-radius:10px;width:400px;max-width:90%;box-shadow:0 10px 30px rgba(0,174,239,0.2);">
        <h3 style="margin:0 0 20px 0;color:${GRID_COLORS.primary}">🔒 Change Password</h3>
        <form id="pass-form">
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Current Password:</label>
            <input id="pass-cur" type="password" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
          </div>
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">New Password:</label>
            <input id="pass-new" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            <small style="color:${GRID_COLORS.muted}">Minimum 6 characters</small>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Confirm Password:</label>
            <input id="pass-conf" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="pass-cancel" style="background:${GRID_COLORS.muted};color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">Cancel</button>
            <button type="submit" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">Update Password</button>
          </div>
          <div id="pass-error" style="color:${GRID_COLORS.accent};margin-top:10px;font-size:14px"></div>
        </form>
      </div>
    </div>
  `;
}

export function layout(profile: Profile, stats: Stats, history: Match[], friends: Friend[], statsTab: string, historyView: string, editMode: boolean, mainTab: string): string {
	const responsiveStyles = `
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=EB+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        margin:0; padding:0;
        background: url('/assets/Background.png') no-repeat center/cover;
        font-family: Georgia, 'Times New Roman', Times, serif;
        color: ${GRID_COLORS.secondary};
        overflow-x: hidden;
      }
      .petal {
        position: relative;
        width: 100%;
        top: -340px;
        text-align: left;
        z-index: 2;
        pointer-events: none;
      }
      .petal span {
        display: inline-block;
        overflow: hidden;
        width: 5px;
        height: 5px;
        border-radius: 200px 10px 200px 200px;
        background: linear-gradient(to bottom, #faaca8, #ddd6f3);
        z-index: 1;
        transform: skewX(30deg);
        backface-visibility: visible;
        -webkit-animation: fallingSakura1 8s linear infinite;
        animation: fallingSakura1 8s linear infinite;
        position: relative;
      }
      .petal span:nth-of-type(3n+2) {
        -webkit-animation: fallingSakura2 8s linear infinite;
        animation: fallingSakura2 8s linear infinite;
      }
      .petal span:nth-of-type(3n+1) {
        -webkit-animation: fallingSakura3 8s linear infinite;
        animation: fallingSakura3 8s linear infinite;
      }
      .petal span:nth-of-type(n)   { -webkit-animation-delay: -1.9s; animation-delay: -1.9s;}
      .petal span:nth-of-type(2n)  { -webkit-animation-delay: 3.9s; animation-delay: 3.9s;}
      .petal span:nth-of-type(3n)  { -webkit-animation-delay: 2.3s; animation-delay: 2.3s;}
      .petal span:nth-of-type(4n)  { -webkit-animation-delay: 4.4s; animation-delay: 4.4s;}
      .petal span:nth-of-type(5n)  { -webkit-animation-delay: 5s; animation-delay: 5s;}
      .petal span:nth-of-type(6n)  { -webkit-animation-delay: 3.5s; animation-delay: 3.5s;}
      .petal span:nth-of-type(7n)  { -webkit-animation-delay: 2.8s; animation-delay: 2.8s;}
      .petal span:nth-of-type(8n)  { -webkit-animation-delay: 1.5s; animation-delay: 1.5s;}
      .petal span:nth-of-type(9n)  { -webkit-animation-delay: 3.3s; animation-delay: 3.3s;}
      .petal span:nth-of-type(10n) { -webkit-animation-delay: 2.5s; animation-delay: 2.5s;}
      .petal span:nth-of-type(11n) { -webkit-animation-delay: 1.2s; animation-delay: 1.2s;}
      .petal span:nth-of-type(12n) { -webkit-animation-delay: 4.1s; animation-delay: 4.1s;}
      .petal span:nth-of-type(13n) { -webkit-animation-delay: 5.8s; animation-delay: 5.8s;}
      .petal span:nth-of-type(14n) { -webkit-animation-delay: -0.1s; animation-delay: -0.1s;}
      .petal span:nth-of-type(15n) { -webkit-animation-delay: 6.3s; animation-delay: 6.3s;}
      .petal span:nth-of-type(16n) { -webkit-animation-delay: -1s; animation-delay: -1s;}
      .petal span:nth-of-type(17n) { -webkit-animation-delay: 7.4s; animation-delay: 7.4s;}
      .petal span:nth-of-type(18n) { -webkit-animation-delay: -0.3s; animation-delay: -0.3s;}
      .petal span:nth-of-type(19n) { -webkit-animation-delay: 8.3s; animation-delay: 8.3s;}
      .petal span:nth-of-type(20n) { -webkit-animation-delay: -0.6s; animation-delay: -0.6s;}
      .petal span:nth-of-type(21n) { -webkit-animation-delay: 7.7s; animation-delay: 7.7s;}
      .petal span:nth-of-type(2n+2) {
        background: linear-gradient(to right, #fffbd5, #F15F79);
      }
      .petal span:nth-of-type(3n+1) {
        background: linear-gradient(to right, #DD5E89, #F7BB97);
      }
      .petal span:nth-of-type(3n+2) {
        border-radius: 20px 1px;
      }
      .petal span:nth-of-type(3n+3) {
        transform: rotateX(-180deg);
      }
      .petal span:nth-of-type(3n+2) {
        animation-duration: 12s;
        -webkit-animation-duration: 12s;
      }
      .petal span:nth-of-type(4n+2) {
        animation-duration: 9s;
        -webkit-animation-duration: 9s;
      }
      .petal span:nth-of-type(5n+2) {
        width: 12px;
        height: 12px;
        box-shadow: 1.5px 1.5px 8px #fc7bd1;
      }
      .petal span:nth-of-type(4n+3) {
        width: 10px;
        height: 10px;
        box-shadow: 1px 1px 6px #fc7bd1;
      }
      .petal span:nth-of-type(n)    { height:23px; width:30px; }
      .petal span:nth-of-type(2n+1)    { height:11px; width:16px; }
      .petal span:nth-of-type(3n+2)  { height:17px; width:23px; }
      @-webkit-keyframes fallingSakura1 {
        0% {
          -webkit-transform:
            translate3d(0,0,0)
            rotateX(0deg);
          opacity: 1;
        }
        100% {
          -webkit-transform:
            translate3d(400px,1200px,0px)
            rotateX(-290deg);
          opacity: 0.3;
        }
      }
      @-webkit-keyframes fallingSakura2 {
        0% {
          -webkit-transform:
            translate3d(0,0,0)
            rotateX(-20deg);
          opacity: 1;
        }
        100% {
          -webkit-transform:
            translate3d(200px,1200px,0px)
            rotateX(-70deg);
          opacity: 0.2;
        }
      }
      @-webkit-keyframes fallingSakura3 {
        0% {
          -webkit-transform:
            translate3d(0,0,0)
            rotateX(90deg);
          opacity: 1;
        }
        100% {
          -webkit-transform:
            translate3d(500px,1200px,0px)
            rotateX(290deg);
          opacity: 0;
        }
      }
      @keyframes fallingSakura1 {
        0% {
          transform:
            translate3d(0,0,0)
            rotateX(0deg);
          opacity: 1;
        }
        100% {
          transform:
            translate3d(400px,1200px,0px)
            rotateX(-290deg);
          opacity: 0.3;
        }
      }
      @keyframes fallingSakura2 {
        0% {
          transform:
            translate3d(0,0,0)
            rotateX(-20deg);
          opacity: 1;
        }
        100% {
          transform:
            translate3d(200px,1200px,0px)
            rotateX(-70deg);
          opacity: 0.2;
        }
      }
      @keyframes fallingSakura3 {
        0% {
          transform:
            translate3d(0,0,0)
            rotateX(90deg);
          opacity: 1;
        }
        100% {
          transform:
            translate3d(500px,1200px,0px)
            rotateX(290deg);
          opacity: 0;
        }
      }
      .gris-main-card {
        max-width: 1200px;
        margin: 60px auto 40px auto;
        background: rgba(255,255,255,0.65);
        border-radius: 32px;
        box-shadow: 0 12px 64px 0 #b6a6ca44, 0 2px 16px 0 #7fc7d933;
        padding: 0;
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0;
        min-height: 600px;
        backdrop-filter: blur(22px) saturate(1.3);
        border: 1.5px solid #e3e6f3;
        overflow: hidden;
        animation: dreamyFadeSlideIn 1.1s cubic-bezier(.4,2,.6,1);
      }
      @media (max-width: 900px) {
        .gris-main-card { grid-template-columns: 1fr; min-height: unset; }
      }
      @keyframes dreamyFadeSlideIn {
        0% { opacity: 0; transform: translateY(60px) scale(0.98); }
        60% { opacity: 0.7; }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      .gris-avatar {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        box-shadow: 0 8px 40px #b6a6ca44, 0 2px 8px #7fc7d933;
        background: radial-gradient(ellipse at 60% 40%, #f4f6fa 60%, #b6a6ca 100%, #7fc7d9 120%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 48px auto 18px auto;
        position: relative;
        overflow: visible;
        animation: dreamyAvatarFloat 7s ease-in-out infinite alternate;
        transition: box-shadow 0.4s;
      }
      @keyframes dreamyAvatarFloat {
        0% { transform: translateY(0) scale(1.01); }
        100% { transform: translateY(-18px) scale(1.04) rotate(-2deg); }
      }
      @keyframes grisAvatarFloat {
        0% { transform: translateY(0); }
        100% { transform: translateY(-8px); }
      }
      .gris-avatar img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 2.5px solid #fff;
        background: rgba(255,255,255,0.7);
        box-shadow: 0 2px 16px 0 #b6a6ca33;
      }
      .gris-username {
        font-size: 2.5rem;
        font-weight: 700;
        color: #23272f;
        text-align: center;
        letter-spacing: -1.5px;
        margin: 0 0 6px 0;
        font-family: 'Inter', 'EB Garamond', serif;
      }
      .gris-quote {
        font-size: 1.15rem;
        color: #b6a6ca;
        font-style: italic;
        text-align: center;
        margin-bottom: 18px;
        font-family: 'EB Garamond', serif;
      }
      .gris-divider {
        width: 80px;
        height: 3px;
        margin: 18px auto 18px auto;
        background: repeating-linear-gradient(90deg,#b6a6ca,#b6a6ca 10px,#7fc7d9 10px,#7fc7d9 20px,#e6c79c 20px,#e6c79c 30px,#fff 30px);
        border-radius: 2px;
        opacity: 0.7;
        box-shadow: 0 1px 4px #b6a6ca33;
      }
      .gris-section {
        width: 100%;
        background: rgba(255,255,255,0.92);
        border-radius: 18px;
        box-shadow: 0 2px 18px #b6a6ca22;
        padding: 32px 32px 24px 32px;
        margin-bottom: 24px;
        font-family: 'Inter', 'EB Garamond', serif;
        display: flex;
        flex-direction: column;
        gap: 18px;
        animation: dreamySectionFloat 6s ease-in-out infinite alternate;
      }
      @keyframes dreamySectionFloat {
        0% { box-shadow: 0 2px 18px #b6a6ca22; }
        100% { box-shadow: 0 8px 32px #b6a6ca33; }
      }
      .gris-section-title {
        font-size: 1.35rem;
        color: #23272f;
        font-weight: 700;
        margin-bottom: 12px;
        text-align: left;
        font-family: 'Inter', 'EB Garamond', serif;
        letter-spacing: -0.5px;
      }
      .gris-section-content {
        font-size: 1.08rem;
        color: #23272f;
        text-align: left;
        font-family: 'Inter', 'EB Garamond', serif;
      }
      .gris-action-btn {
        background: linear-gradient(90deg,#b6a6ca,#7fc7d9);
        color: #fff;
        border: none;
        border-radius: 16px;
        min-width: 54px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        font-family: 'Inter', 'EB Garamond', serif;
        font-weight: 600;
        box-shadow: 0 2px 12px #b6a6ca33;
        cursor: pointer;
        margin: 0 8px;
        padding: 0 24px;
        transition: background 0.3s, box-shadow 0.3s, transform 0.25s cubic-bezier(.4,2,.6,1), filter 0.3s;
        filter: drop-shadow(0 2px 8px #b6a6ca33);
        will-change: transform, filter;
        animation: dreamyButtonFloat 4s ease-in-out infinite alternate;
        letter-spacing: 0.02em;
      }
      .gris-action-btn:active {
        transform: scale(0.96) translateY(2px);
        filter: brightness(0.95) blur(0.5px);
      }
      .gris-action-btn:hover {
        background: linear-gradient(90deg,#7fc7d9,#b6a6ca);
        box-shadow: 0 4px 24px #b6a6ca55;
        transform: scale(1.06) translateY(-2px) rotate(-2deg);
        filter: brightness(1.08) blur(0.2px) drop-shadow(0 6px 18px #b6a6ca33);
      }
      @keyframes dreamyButtonFloat {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(-6px) scale(1.03) rotate(-1.5deg); }
      }
      .gris-main-card {
        /* ...existing code... */
        /* Entrance animation removed */
      }
      /* dreamyCardFadeIn keyframes removed */
      @media (max-width: 1100px) {
        .gris-main-card { padding: 24px 2vw; max-width: 98vw; }
        .gris-section { padding: 18px 2vw 14px 2vw; }
      }
      @media (max-width: 700px) {
        .gris-main-card { padding: 12px 1vw; max-width: 100vw; }
        .gris-section { padding: 10px 1vw 8px 1vw; }
        .gris-avatar { width: 80px; height: 80px; }
        .gris-avatar img { width: 60px; height: 60px; }
        .gris-username { font-size: 1.2rem; }
      }
    </style>
`;

	return `${responsiveStyles}
    <div class="petal">
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      <span></span>
    </div>
      <main class="gris-main-card">
        <div style="background:linear-gradient(120deg,#f4f6fa 60%, #b6a6ca33 100%, #7fc7d933 120%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 0 32px 0;gap:18px;min-height:100%;border-right:1.5px solid #e3e6f3;">
          <div class="gris-avatar">
            <img src="${profile.avatar_url}" alt="Avatar"/>
          </div>
          <div class="gris-username">@${profile.username}</div>
          <div class="gris-quote">“The world is painted in gentle hues.”</div>
          <div class="gris-divider"></div>
          <div style="display:flex;flex-direction:column;gap:10px;width:100%;align-items:center;">
            <button id="edit-btn" class="gris-action-btn" title="Edit Profile" type="button">Edit</button>
            <button id="pass-btn" class="gris-action-btn" title="Change Password" type="button">Change Password</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0;padding:48px 32px 32px 32px;">
          <!-- Main Tabs -->
          <div style="display:flex;gap:0;margin-bottom:32px;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px #b6a6ca22;">
            ${['profile', 'stats', 'history', 'friends'].map(tab => `
              <button class="main-tab${tab === mainTab ? ' active' : ''}" data-main-tab="${tab}"
                style="flex:1;padding:18px 0;border:none;background:${tab === mainTab ? GRID_COLORS.bg : '#f4f6fa'};
                       color:${tab === mainTab ? GRID_COLORS.primary : GRID_COLORS.muted};font-size:1.15rem;font-weight:700;
                       border-bottom:4px solid ${tab === mainTab ? GRID_COLORS.cool : 'transparent'};cursor:pointer;transition:all 0.2s">
                ${tab === 'profile' ? '👤 Profile' : tab === 'stats' ? '📊 Statistics' : tab === 'history' ? '🏆 Match History' : '👥 Friends'}
              </button>
            `).join('')}
          </div>
          <!-- Tab Panels -->
          <div class="tab-panel" id="profile-panel" style="display:${mainTab === 'profile' ? 'block' : 'none'}">
            <div class="gris-section" id="profile-section">
              <div class="gris-section-title">Profile</div>
              <div class="gris-section-content" id="profile-content">
                <div><b>Name:</b> ${profile.display_name || profile.name}</div>
                <div><b>Email:</b> ${profile.email || 'Not provided'}</div>
                <div><b>Team:</b> ${profile.team || '—'}</div>
                <div><b>Member since:</b> ${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>
          <div class="tab-panel" id="stats-panel" style="display:${mainTab === 'stats' ? 'block' : 'none'}">
            <div class="gris-section" id="stats-section">
              <div class="gris-section-title">Statistics</div>
              <div class="gris-section-content" id="stats-content">
                <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;flex-wrap:wrap">
                  <button class="stats-tab gris-action-btn" data-tab="overview" type="button" style="background:${statsTab === 'overview' ? '#7fc7d9' : '#b6a6ca'}">Overview</button>
                  <button class="stats-tab gris-action-btn" data-tab="performance" type="button" style="background:${statsTab === 'performance' ? '#7fc7d9' : '#b6a6ca'}">Performance</button>
                  <button class="stats-tab gris-action-btn" data-tab="trends" type="button" style="background:${statsTab === 'trends' ? '#7fc7d9' : '#b6a6ca'}">Trends</button>
                </div>
                <div id="stats-content-inner">Loading stats...</div>
              </div>
            </div>
          </div>
          <div class="tab-panel" id="history-panel" style="display:${mainTab === 'history' ? 'block' : 'none'}">
            <div class="gris-section" id="history-section">
              <div class="gris-section-title">Match History</div>
              <div class="gris-section-content" id="history-content">
                <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;flex-wrap:wrap">
                  <button class="history-tab gris-action-btn" data-view="list" type="button" style="background:${historyView === 'list' ? '#7fc7d9' : '#b6a6ca'}">List</button>
                  <button class="history-tab gris-action-btn" data-view="detailed" type="button" style="background:${historyView === 'detailed' ? '#7fc7d9' : '#b6a6ca'}">Detailed</button>
                  <button class="history-tab gris-action-btn" data-view="analysis" type="button" style="background:${historyView === 'analysis' ? '#7fc7d9' : '#b6a6ca'}">Analysis</button>
                 </div>
                <div id="history-content-inner">Loading history...</div>
              </div>
            </div>
          </div>
          <div class="tab-panel" id="friends-panel" style="display:${mainTab === 'friends' ? 'block' : 'none'}">
            <div class="gris-section" id="friends-section">
              <div class="gris-section-title">Friends</div>
              <div class="gris-section-content" id="friends-content">
                <form id="friend-form" style="display:flex;gap:10px;justify-content:flex-start;margin-bottom:10px;flex-wrap:wrap" autocomplete="off">
                  <input id="friend-input" placeholder="Username..." style="flex:1;min-width:120px;max-width:180px;padding:8px;border:1.5px solid #b6a6ca;border-radius:8px;font-size:15px;background:rgba(255,255,255,0.7);font-family:'EB Garamond',serif;"/>
                  <button id="friend-add" class="gris-action-btn" title="Add Friend" type="submit">Add</button>
                </form>
                <div id="friend-msg" style="margin-top:8px;font-size:12px;color:#fff">.</div>
                <div id="friends-container" style="margin:10px 0;text-align:center">Loading friends...</div>
              </div>
            </div>
          </div>
        </div>
        ${modals()}
      </main>
    <script>
      // Animate petal background
      (function(){
        document.querySelectorAll('.gris-petal-bg span').forEach(function(s){
          s.style.animationDuration = (14+Math.random()*8)+'s';
        });
      })();
      // Main tab navigation
      function setupMainTabs() {
        document.querySelectorAll('.main-tab').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            var tab = btn.getAttribute('data-main-tab');
            if (!tab) return;
            if (window.state && window.state.activeMainTab !== tab) {
              window.state.activeMainTab = tab;
              if (window.render && typeof window.render === 'function') {
                window.render(document.querySelector('.profile-container'));
              }
            }
            // Atualiza visibilidade dos painéis
            document.querySelectorAll('.tab-panel').forEach(function(panel) {
              panel.style.display = 'none';
            });
            var activePanel = document.getElementById(tab+'-panel');
            if (activePanel) activePanel.style.display = 'block';
          });
        });
        // Inicializa visibilidade correta
        var mainTab = window.state ? window.state.activeMainTab : 'profile';
        document.querySelectorAll('.tab-panel').forEach(function(panel) {
          panel.style.display = 'none';
        });
        var activePanel = document.getElementById(mainTab+'-panel');
        if (activePanel) activePanel.style.display = 'block';
      }
      function setupFriendForm() {
        var friendForm = safeGet('friend-form');
        if (friendForm) {
          friendForm.onsubmit = function(e) {
            e.preventDefault();
            var input = safeGet('friend-input');
            if (input && input.value.trim()) {
              var evt = new CustomEvent('add-friend', { detail: { username: input.value.trim() } });
              window.dispatchEvent(evt);
              input.value = '';
            }
          };
        }
      }
      function setupButtons() {
        // Edit button
        var editBtn = safeGet('edit-btn');
        if (editBtn) editBtn.onclick = function(e) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('profile-edit'));
        };
        // Cancelar edição
        var cancelBtn = safeGet('cancel-btn');
        if (cancelBtn) cancelBtn.onclick = function(e) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('profile-cancel'));
        };
        // Alterar password
        var passBtn = safeGet('pass-btn');
        if (passBtn) passBtn.onclick = function(e) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('profile-password'));
        };
        // Modal de histórico
        var openHistoryBtn = safeGet('open-history-modal');
        if (openHistoryBtn) openHistoryBtn.onclick = function(e) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('open-history-modal'));
        };
        // Fechar modal de password
        var passModal = safeGet('pass-modal');
        if (passModal) {
          var passCancel = safeGet('pass-cancel');
          if (passCancel) passCancel.onclick = function(e) {
            e.preventDefault();
            passModal.style.display = 'none';
          };
        }
      }
      function setupFallbacks() {
        var friendsEl = safeGet('friends-container');
        if (friendsEl && !friendsEl.innerHTML) friendsEl.innerHTML = 'No friends';
        var statsEl = safeGet('stats-content-inner');
        if (statsEl && !statsEl.innerHTML) statsEl.innerHTML = 'No stats';
        var historyEl = safeGet('history-content-inner');
        if (historyEl && !historyEl.innerHTML) historyEl.innerHTML = 'No history';
      }
      function setupTabStateSync() {
        // Sub-tabs: Statistics
        document.querySelectorAll('.stats-tab').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            var tab = btn.getAttribute('data-tab');
            if (!tab) return;
            if (window.state && window.state.activeStatsTab !== tab) {
              window.state.activeStatsTab = tab;
              if (window.render && typeof window.render === 'function') {
                window.render(document.querySelector('.profile-container'));
              }
            }
          });
        });
        // Sub-tabs: History
        document.querySelectorAll('.history-tab').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            var view = btn.getAttribute('data-view');
            if (!view) return;
            if (window.state && window.state.activeHistoryView !== view) {
              window.state.activeHistoryView = view;
              if (window.render && typeof window.render === 'function') {
                window.render(document.querySelector('.profile-container'));
              }
            }
          });
        });
      }
      function setupAll() {
        setupMainTabs();
        setupFriendForm();
        setupButtons();
        setupFallbacks();
        setupTabStateSync();
      }
      // Run setup on DOMContentLoaded and after dynamic updates
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAll);
      } else {
        setTimeout(setupAll, 200);
      }
    </script>
    `;
}
