// renderProfilePage/templates.ts - FIXED VERSION with GRIS-inspired design
import { AVAILABLE_AVATARS, Friend, Match, Profile, Stats } from './types.js';
import {
averageScore, bestPerformance, consistencyScore, bestPlayingDay, clutchFactor, currentMomentum,
dominanceRating, efficiencyScore, gamesThisWeek, longestWinStreak, mostActiveTime, opponentAnalysis
} from './metrics.js';
// GRID-inspired color palette (updated pink & purple)
const GRID_COLORS = {
primary: '#1c2126', // Gunmetal
secondary: '#f8f9f8', // Light gray
accent: '#e84393', // Magical pink (was neon yellow)
warm: '#9b59b6', // Enchanted purple (was racing orange)
cool: '#00aeef', // Circuit blue
success: '#00d563', // Performance green
muted: '#888888', // Neutral gray
bg: '#12181c' // Dark background
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
                     style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.cool};border-radius:12px;
                            font-size:14px;transition:border-color 0.3s;background:${GRID_COLORS.bg}"/>
              <small style="color:${GRID_COLORS.muted}">Min 3 characters</small>
            </div>
            <div>
              <label style="display:block;margin-bottom:8px;font-weight:600;color:${GRID_COLORS.primary}">Display Name:</label>
              <input id="display-input" type="text" value="${profile.display_name || profile.name || ''}" required
                     style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.cool};border-radius:12px;
                            font-size:14px;transition:border-color 0.3s;background:${GRID_COLORS.bg}"/>
              <small style="color:${GRID_COLORS.muted}">Public name shown in games</small>
            </div>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:8px;font-weight:600;color:${GRID_COLORS.primary}">Email:</label>
            <input id="email-input" type="email" value="${profile.email || ''}"
                   style="width:100%;padding:12px;border:2px solid ${GRID_COLORS.cool};border-radius:12px;
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
                    style="background:${GRID_COLORS.muted};color:#fff;border:none;padding:12px 24px;
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
          <div><span style="font-weight:600;color:${GRID_COLORS.primary}">Last seen:</span> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString().substring(0,10) : '—'}</div>
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
// renderProfilePage/templates.ts - FIXED VERSION
export function friendsList(friends: Friend[]): string {
if (!friends || friends.length === 0) {
return '<div style="padding:15px;text-align:center;color:#666;font-size:14px">No friends added yet</div>';
  }
return `
    <div>
${friends.map((f: any) => {
const id = f.friend_id ?? f.id ?? f.userId ?? '';
const displayName = f.display_name || f.name || f.username || 'Unknown';
const username = f.username || '';
const avatar = f.avatar_url || '/assets/avatar/default.png';
const online = !!f.online_status;
return `
          <div class="friend-item"
               data-id="${id}" data-name="${displayName}"
               style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,174,239,0.1);position:relative;display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <img src="${avatar}" width="35" height="35" style="border-radius:50%;object-fit:cover;border:2px solid ${online ? GRID_COLORS.success : GRID_COLORS.accent}" alt="Avatar"/>
            <div style="flex:1">
              <div style="font-weight:bold;font-size:14px;color:${GRID_COLORS.primary}">${displayName}</div>
              <div style="font-size:12px;color:${GRID_COLORS.muted}">@${username}</div>
              <div style="font-size:11px;color:${online ? GRID_COLORS.success : GRID_COLORS.accent}">${online ? '🟢 Online' : '🔴 Offline'}</div>
            </div>
            <button
              class="remove-friend-btn"
              data-action="remove-friend"
              data-id="${id}"
              data-friend-id="${id}"
              data-name="${displayName}"
              data-friend-name="${displayName}"
              title="Remove friend"
              style="background:${GRID_COLORS.accent};color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px">
              ×
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
// FIX: Improved match list - only 5 recent matches, simplified
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
                <div style="font-weight:bold;color:${GRID_COLORS.primary}">${
Math.abs(m.user_score - m.opponent_score) <= 2 ? 'NAIL-BITER' :
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
              <img src="${a}" width="64" height="64" style="border-radius:50%;object-fit:cover;display:block;width:100%" alt="Avatar ${i+1}"/>
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
// SUBSTITUA a sua função layout por esta versão completa:

export function layout(profile: Profile, stats: Stats, history: Match[], friends: Friend[], statsTab: string, historyView: string, editMode: boolean): string {
  const responsiveStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body {
      margin:0; padding:0;
      background: url('/assets/Background.png') no-repeat center/cover;
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: ${GRID_COLORS.secondary};
      overflow-x: hidden;
    }
    .profile-container {
      background: rgba(28,33,38,0.8);
      border-radius: 16px;
      padding: 20px;
    }
    
    /* Realistic falling petals animation */
    @keyframes fallPetals {
      0% {
        transform: translateY(-100vh) rotateZ(0deg);
        opacity: 0.8;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotateZ(720deg);
        opacity: 0;
      }
    }
    
    @keyframes swayLeft {
      0%, 100% { transform: translateX(0px) rotateX(0deg); }
      25% { transform: translateX(-15px) rotateX(10deg); }
      75% { transform: translateX(-30px) rotateX(-5deg); }
    }
    
    @keyframes swayRight {
      0%, 100% { transform: translateX(0px) rotateX(0deg); }
      25% { transform: translateX(15px) rotateX(-10deg); }
      75% { transform: translateX(30px) rotateX(5deg); }
    }
    
    @keyframes flutter {
      0%, 100% { transform: rotateY(0deg); }
      50% { transform: rotateY(180deg); }
    }
    
    .petal {
      position: fixed;
      border-radius: 50% 10px 50% 10px;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(45deg, #e84393, #9b59b6);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      animation: fallPetals linear infinite, flutter ease-in-out infinite;
    }
    
    .petal.pink {
      background: linear-gradient(135deg, #e84393 0%, #ff6b9d 50%, #e84393 100%);
      width: 8px;
      height: 12px;
      animation-duration: 8s, 2s;
    }
    
    .petal.purple {
      background: linear-gradient(135deg, #9b59b6 0%, #c44569 50%, #9b59b6 100%);
      width: 6px;
      height: 10px;
      animation-duration: 12s, 3s;
    }
    
    .petal.blue {
      background: linear-gradient(135deg, #00aeef 0%, #4fc3f7 50%, #00aeef 100%);
      width: 7px;
      height: 11px;
      animation-duration: 10s, 2.5s;
    }
    
    .petal.green {
      background: linear-gradient(135deg, #00d563 0%, #26de81 50%, #00d563 100%);
      width: 9px;
      height: 13px;
      animation-duration: 9s, 3.5s;
    }
    
    .petal.small {
      width: 4px;
      height: 6px;
      animation-duration: 15s, 4s;
    }
    
    .petal.large {
      width: 12px;
      height: 18px;
      animation-duration: 6s, 1.5s;
    }
    
    .petal.sway-left {
      animation-name: fallPetals, swayLeft, flutter;
      animation-duration: inherit, 4s, inherit;
    }
    
    .petal.sway-right {
      animation-name: fallPetals, swayRight, flutter;
      animation-duration: inherit, 3s, inherit;
    }
    
    /* tabs hover & active states */
    .stats-tab:hover, .history-tab:hover { color: ${GRID_COLORS.accent}; }
    .stats-tab.active, .history-tab.active {
      color: ${GRID_COLORS.accent};
      border-bottom-color: ${GRID_COLORS.accent};
    }
    @media (max-width: 1024px) {
      .profile-layout {
        grid-template-columns: 1fr !important;
      }
      .header-content {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 768px) {
      .container {
        padding: 10px !important;
      }
      .match-item {
        flex-direction: column !important;
      }
      h2 {
        font-size: 24px !important;
      }
      h3 {
        font-size: 20px !important;
      }
      h4 {
        font-size: 16px !important;
      }
      button, input {
        font-size: 12px !important;
      }
      .friend-item {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }
    }
    @media (max-width: 480px) {
      .container {
        padding: 5px !important;
      }
      canvas {
        height: 150px !important;
      }
      /* Reduzir pétalas em mobile */
      .petal:nth-child(n+26) {
        display: none;
      }
    }
  </style>
`;

// Criar muitas pétalas com movimento realístico
const createPetals = () => {

  const petalsHtml: string[] = [];
  const colors = ['pink', 'purple', 'blue', 'green'];
  const sizes = ['small', '', 'large']; // '' = tamanho normal
  const swayTypes = ['sway-left', 'sway-right', ''];

  for(let i = 0; i < 50; i++) { // 50 pétalas!
    const leftPos = Math.random() * 110; // Espalha além da tela
    const delay = Math.random() * 12; // Delay mais variado
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const sway = swayTypes[Math.floor(Math.random() * swayTypes.length)];
    
    petalsHtml.push(`<div class="petal ${color} ${size} ${sway}" 
                          style="left:${leftPos}%;
                                animation-delay:${delay}s, ${delay * 0.5}s, ${delay * 0.3}s;">
                    </div>`);
  }
  return petalsHtml.join('');
};
  
  return `${responsiveStyles}
      ${createPetals()}
      <div class="profile-container" style="max-width:1400px;margin:0 auto;">
        ${header(profile, editMode)}
        <div class="profile-layout" style="display:grid;grid-template-columns:2fr 1fr;gap:30px;margin-top:30px">
          <div>
            <div style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);border-radius:12px;box-shadow:0 4px 20px rgba(0,174,239,0.1);margin-bottom:30px;">
              <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.success} 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
                <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">📊 Gaming Statistics Dashboard</h3>
                <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Comprehensive view of your gaming performance</p>
              </div>
              <div style="display:flex;border-bottom:1px solid rgba(0,174,239,0.2);background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%)">
  ${['overview','performance','trends'].map(tab => `
                  <button class="stats-tab ${statsTab === tab ? 'active' : ''}" data-tab="${tab}"
                          style="flex:1;padding:12px 20px;border:none;background:${statsTab === tab ? GRID_COLORS.bg : 'transparent'};
                                 border-bottom:3px solid ${statsTab === tab ? GRID_COLORS.cool : 'transparent'};
                                 cursor:pointer;font-weight:${statsTab === tab ? 'bold' : 'normal'};color:${GRID_COLORS.primary}">
  ${tab === 'overview' ? '📈 Overview' : tab === 'performance' ? '🎯 Performance' : '📊 Trends'}
                  </button>
                `).join('')}
              </div>
              <div id="stats-content" style="padding:20px"></div>
            </div>
            <div style="background:linear-gradient(135deg, ${GRID_COLORS.bg} 0%, white 100%);border-radius:12px;box-shadow:0 4px 20px rgba(0,174,239,0.1);">
              <div style="background:linear-gradient(135deg, ${GRID_COLORS.accent} 0%, ${GRID_COLORS.warm} 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
                <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">🏆 Match History Dashboard</h3>
                <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Detailed analysis of your game sessions</p>
              </div>
              <div style="display:flex;border-bottom:1px solid rgba(0,174,239,0.2);background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%)">
  ${['list','detailed','analysis'].map(view => `
                  <button class="history-tab ${historyView === view ? 'active' : ''}" data-view="${view}"
                          style="flex:1;padding:12px 20px;border:none;background:${historyView === view ? GRID_COLORS.bg : 'transparent'};
                                 border-bottom:3px solid ${historyView === view ? GRID_COLORS.accent : 'transparent'};
                                 cursor:pointer;font-weight:${historyView === view ? 'bold' : 'normal'};color:${GRID_COLORS.primary}">
  ${view === 'list' ? '📋 Match List' : view === 'detailed' ? '🔍 Detailed View' : '📈 Analysis'}
                  </button>
                `).join('')}
              </div>
              <div id="history-content" style="padding:20px"></div>
            </div>
          </div>
          <div>
            <h3 style="color:${GRID_COLORS.primary};border-bottom:2px solid ${GRID_COLORS.accent};padding-bottom:8px;margin-bottom:15px">👥 Friends</h3>
            <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:15px;border-radius:8px;margin-bottom:20px;">
              <h4 style="margin:0 0 10px 0;font-size:14px;color:${GRID_COLORS.muted}">Add New Friend</h4>
              <div style="display:flex;gap:8px">
                <input id="friend-input" placeholder="Enter username..." style="flex:1;padding:8px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;font-size:14px;background:white"/>
                <button id="friend-add" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:14px">➕ Add</button>
              </div>
              <div id="friend-msg" style="margin-top:8px;font-size:12px"></div>
            </div>
            <div id="friends-container">${friendsList(friends)}</div>
          </div>
        </div>
  ${modals()}
      </div>
    `;
  }