// renderProfilePage/templates.ts
import { AVAILABLE_AVATARS, Friend, Match, Profile, Stats } from './types.js';
import {
  averageScore, bestPerformance, consistencyScore, bestPlayingDay, clutchFactor, currentMomentum,
  dominanceRating, efficiencyScore, gamesThisWeek, longestWinStreak, mostActiveTime, opponentAnalysis
} from './metrics.js';

export function header(profile: Profile, isEdit: boolean): string {
  const avatar = isEdit
    ? `
    <div style="text-align:center;margin-bottom:15px">
      <div style="position:relative;display:inline-block">
        <img id="avatar-preview" src="${profile.avatar_url}" width="100" height="100" style="border-radius:50%;border:3px solid #ddd;object-fit:cover;cursor:pointer" alt="Avatar"/>
        <div id="avatar-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;cursor:pointer">
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
      <img src="${profile.avatar_url}" width="100" height="100" style="border-radius:50%;border:3px solid #ddd;object-fit:cover" alt="Avatar"/>
    </div>`;

  const createdAtText = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—';

  return isEdit
    ? `
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
      <div style="display:flex;align-items:flex-start;gap:20px">
        ${avatar}
        <div style="flex:1">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px">
            <div>
              <label style="display:block;margin-bottom:5px;font-weight:bold">Username:</label>
              <input id="username-input" type="text" value="${profile.username}" required minlength="3" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
              <small style="color:#666">Min 3 characters</small>
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-weight:bold">Display Name:</label>
              <input id="display-input" type="text" value="${profile.display_name || profile.name || ''}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
              <small style="color:#666">Public name shown in games</small>
            </div>
          </div>
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Email:</label>
            <input id="email-input" type="email" value="${profile.email || ''}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
            <small style="color:#666">Optional - for account recovery</small>
          </div>
          <div style="display:grid;grid-template-columns:auto auto auto;gap:10px;justify-content:start">
            <button id="save-btn" style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold">💾 Save Changes</button>
            <button id="cancel-btn" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">❌ Cancel</button>
            <button id="pass-btn" style="background:#ffc107;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">🔒 Change Password</button>
          </div>
          <div id="save-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
        </div>
      </div>
      <div style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;font-size:14px">
          <div><strong>Team:</strong> ${profile.team || '—'}</div>
          <div><strong>Member since:</strong> ${createdAtText}</div>
          <div><strong>Last seen:</strong> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString() : '—'}</div>
          <div><strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'}</div>
        </div>
      </div>
    </div>`
    : `
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
      <div style="display:flex;align-items:center;gap:20px">
        ${avatar}
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <h3 style="margin:0;color:#333">@${profile.username}</h3>
            <button id="edit-btn" title="Edit profile" style="background:none;border:none;cursor:pointer;font-size:18px;color:#007bff">🖊️</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:15px">
            <div><strong>Display Name:</strong> ${profile.display_name || profile.name || '—'}</div>
            <div><strong>Email:</strong> ${profile.email || 'Not provided'}</div>
            <div><strong>Team:</strong> ${profile.team || '—'}</div>
            <div><strong>Member since:</strong> ${createdAtText}</div>
          </div>
          <div style="font-size:12px;color:#666">
            <strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'} • 
            <strong>Last seen:</strong> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString() : '—'}
          </div>
        </div>
      </div>
    </div>`;
}

export function friendsList(friends: Friend[]): string {
  if (!friends.length) {
    return '<div style="padding:20px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px;font-size:14px">No friends added yet. Add some friends to see them here!</div>';
  }
  
  return friends.map(f => `
    <div class="friend-item" data-friend-id="${f.friend_id || f.id}" data-friend-name="${f.display_name || f.name || f.username}"
         style="display:flex;align-items:center;gap:10px;padding:10px;background:#fff;
                border-radius:8px;margin-bottom:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);
                position:relative;transition:all 0.2s;cursor:pointer">
      <img src="${f.avatar_url || '/assets/avatar/default.png'}" width="40" height="40" 
           style="border-radius:50%;object-fit:cover;border:2px solid ${f.online_status ? '#28a745' : '#6c757d'}" alt="Avatar"/>
      <div style="flex:1">
        <div style="font-weight:bold;color:#333">${f.display_name || f.name || f.username}</div>
        <div style="font-size:12px;color:#666">@${f.username} • ${f.team || 'No team'}</div>
        <div style="font-size:11px;color:${f.online_status ? '#28a745' : '#6c757d'}">
          ${f.online_status ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>
      <button class="remove-friend-btn" data-friend-id="${f.friend_id || f.id}" 
              data-friend-name="${f.display_name || f.name || f.username}"
              title="Remove friend"
              style="display:none;background:#dc3545;color:#fff;border:none;border-radius:50%;
                     width:24px;height:24px;cursor:pointer;font-size:12px;position:absolute;
                     top:8px;right:8px">
        ×
      </button>
    </div>
  `).join('');
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
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:30px">
        ${[
          { label: 'Total Matches', value: stats.matches_played, color: '#007bff', icon: '🎮', sub: 'Games played' },
          { label: 'Win Rate', value: `${wr}%`, color: parseFloat(wr) >= 50 ? '#28a745' : '#dc3545', icon: '🏆', sub: `${stats.matches_won}W / ${stats.matches_lost}L` },
          { label: 'Score Ratio', value: kd, color: parseFloat(kd) >= 1 ? '#28a745' : '#ffc107', icon: '⚡', sub: 'Scored / Conceded' },
          { label: 'Tournaments Won', value: stats.tournaments_won || 0, color: '#fd7e14', icon: '🏅', sub: 'Titles' }
        ].map(s => `
          <div style="background:linear-gradient(135deg, ${s.color}15, ${s.color}05);padding:20px;border-radius:12px;border-left:4px solid ${s.color}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-size:28px;font-weight:bold;color:${s.color}">${s.value}</div>
              <div style="font-size:24px;opacity:0.7">${s.icon}</div>
            </div>
            <div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:2px">${s.label}</div>
            <div style="font-size:12px;color:#666">${s.sub}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px"><span>📊</span> Scoring Statistics</h4>
          <div>
            ${[
              ['Total Points Scored', `<strong style="color:#28a745">${stats.points_scored}</strong>`],
              ['Total Points Conceded', `<strong style="color:#dc3545">${stats.points_conceded}</strong>`],
              ['Avg Points per Match', `<strong style="color:#007bff">${avgP}</strong>`],
              ['Avg Conceded per Match', `<strong style="color:#ffc107">${avgC}</strong>`],
            ].map(([l, v], i, arr) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < arr.length - 1 ? 'border-bottom:1px solid #e9ecef' : ''}">
                <span style="color:#666">${l}</span>${v}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px"><span>🎯</span> Performance Metrics</h4>
          <div>
            ${[
              ['Current Win Streak', `<strong style="color:${ws > 0 ? '#28a745' : '#dc3545'}">${ws}</strong>`],
              ['Best Match Score', `<strong style="color:#007bff">${best.score ?? 'N/A'}</strong>`],
              ['Games This Week', `<strong style="color:#17a2b8">${gamesThisWeek(history)}</strong>`],
              ['Favorite Time', `<strong style="color:#6f42c1">${mostActiveTime(history)}</strong>`],
            ].map(([l, v], i, arr) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < arr.length - 1 ? 'border-bottom:1px solid #e9ecef' : ''}">
                <span style="color:#666">${l}</span>${v}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:20px">
        <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px"><span>📈</span> Win Rate</h4>
        <canvas id="winRateChart" width="400" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
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
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333">📊 Recent Match Scores</h4>
          <canvas id="performanceChart" width="300" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
        </div>
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333">🏆 Performance Rankings</h4>
          ${[
            { label: 'Average Score', value: avg, desc: 'Points per match', color: parseFloat(avg) >= 10 ? '#28a745' : '#ffc107', icon: '⚡' },
            { label: 'Consistency', value: `${cons}%`, desc: 'Performance stability', color: cons >= 70 ? '#28a745' : cons >= 50 ? '#ffc107' : '#dc3545', icon: '🎯' },
            { label: 'Clutch Factor', value: `${clutch}%`, desc: 'Close game wins', color: clutch >= 60 ? '#28a745' : '#ffc107', icon: '🔥' },
            { label: 'Dominance', value: `${dom}%`, desc: 'Big-margin wins', color: '#6f42c1', icon: '👑' },
            { label: 'Efficiency', value: eff, desc: 'Performance per match', color: '#e83e8c', icon: '⚡' },
          ].map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;background:#fff;border-radius:8px;border-left:4px solid ${r.color};margin-bottom:10px">
              <div style="font-size:20px">${r.icon}</div>
              <div style="flex:1">
                <div style="font-weight:bold;color:#333">${r.label}</div>
                <div style="font-size:12px;color:#666">${r.desc}</div>
              </div>
              <div style="font-weight:bold;color:${r.color}">${r.value}</div>
            </div>`).join('')}
        </div>
      </div>

      <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:20px">
        <h4 style="margin:0 0 15px 0;color:#333">🔥 Activity Heatmap (7 days)</h4>
        <canvas id="activityHeatmap" width="600" height="100" style="width:100%;height:100px;background:#fff;border-radius:8px"></canvas>
      </div>
    </div>
  `;
}

export function statsTrends(stats: Stats): string {
  return `
    <div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;margin-bottom:30px">
        ${[
          { label: 'Win Rate', value: `${(stats.win_rate * 100).toFixed(1)}%`, color: '#28a745', icon: '🏆', period: 'current' },
          { label: 'Avg Score', value: (stats.matches_played ? (stats.points_scored / stats.matches_played).toFixed(1) : '0'), color: '#007bff', icon: '📊', period: 'per match' },
          { label: 'Games/Week', value: String(gamesThisWeek([])), color: '#17a2b8', icon: '🎮', period: 'this week' }, /* updated at runtime in index */
          { label: 'Total Matches', value: String(stats.matches_played), color: '#6f42c1', icon: '📈', period: 'all time' },
        ].map(t => `
          <div style="background:linear-gradient(135deg, ${t.color}15, ${t.color}05);padding:18px;border-radius:12px;border-left:4px solid ${t.color}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:20px">${t.icon}</span>
              <div style="text-align:right"><div style="font-size:16px;font-weight:bold;color:${t.color}">${t.value}</div></div>
            </div>
            <div style="font-size:14px;font-weight:bold;color:#333">${t.label}</div>
            <div style="font-size:12px;color:#666">${t.period}</div>
          </div>
        `).join('')}
      </div>

      <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:30px">
        <h4 style="margin:0 0 15px 0;color:#333">📈 Win Rate Progression</h4>
        <canvas id="trendsChart" width="800" height="300" style="width:100%;height:300px;background:#fff;border-radius:8px"></canvas>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333">📅 Weekly Breakdown</h4>
          <canvas id="weeklyChart" width="300" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
        </div>
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333">⏰ Time-based Performance</h4>
          <canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:#fff;border-radius:8px"></canvas>
        </div>
      </div>
    </div>
  `;
}

export function historyList(history: Match[]): string {
  const recent = history.slice(0, 10);
  return `
    <div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:15px;margin-bottom:25px">
        <div style="background:linear-gradient(135deg, #28a74515, #28a74505);padding:15px;border-radius:10px;border-left:4px solid #28a745;text-align:center">
          <div style="font-size:20px;font-weight:bold;color:#28a745">${history.filter(m => m.result === 'win').length}</div>
          <div style="font-size:12px;color:#666">Total Wins</div>
        </div>
        <div style="background:linear-gradient(135deg, #dc354515, #dc354505);padding:15px;border-radius:10px;border-left:4px solid #dc3545;text-align:center">
          <div style="font-size:20px;font-weight:bold;color:#dc3545">${history.filter(m => m.result === 'loss').length}</div>
          <div style="font-size:12px;color:#666">Total Losses</div>
        </div>
        <div style="background:linear-gradient(135deg, #007bff15, #007bff05);padding:15px;border-radius:10px;border-left:4px solid #007bff;text-align:center">
          <div style="font-size:20px;font-weight:bold;color:#007bff">${averageScore(history).toFixed(1)}</div>
          <div style="font-size:12px;color:#666">Avg Score</div>
        </div>
        <div style="background:linear-gradient(135deg, #ffc10715, #ffc10705);padding:15px;border-radius:10px;border-left:4px solid #ffc107;text-align:center">
          <div style="font-size:20px;font-weight:bold;color:#ffc107">${longestWinStreak(history)}</div>
          <div style="font-size:12px;color:#666">Best Streak</div>
        </div>
      </div>

      <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
        <div style="background:#f8f9fa;padding:15px;border-bottom:1px solid #e9ecef">
          <h4 style="margin:0;color:#333">🕒 Recent Matches</h4>
        </div>
        <div style="max-height:400px;overflow-y:auto">
          ${recent.map(m => {
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
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function historyDetailed(history: Match[]): string {
  return `
    <div>
      <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <label style="font-weight:bold;color:#333">Filter:</label>
          <select id="match-filter" style="padding:6px 12px;border:1px solid #ddd;border-radius:4px;background:#fff">
            <option value="all">All Matches</option>
            <option value="wins">Wins Only</option>
            <option value="losses">Losses Only</option>
            <option value="close">Close Games</option>
            <option value="blowouts">Decisive Wins</option>
          </select>
          <select id="time-filter" style="padding:6px 12px;border:1px solid #ddd;border-radius:4px;background:#fff">
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
          <button data-action="apply-history-filters" style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">🔍 Apply</button>
        </div>
      </div>

      <div id="filtered-matches" style="display:grid;gap:15px">
        ${history.slice(0, 6).map((m, idx) => `
          <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);border-left:5px solid ${m.result === 'win' ? '#28a745' : '#dc3545'}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${m.result === 'win' ? '#28a745' : '#dc3545'};color:#fff;font-size:16px">
                  ${m.result === 'win' ? '🏆' : '❌'}
                </div>
                <div>
                  <h4 style="margin:0;color:#333">Match #${history.length - idx}</h4>
                  <div style="font-size:13px;color:#666">${new Date(m.date_played).toLocaleString()}</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-family:monospace;font-size:24px;font-weight:bold;color:#333">${m.user_score} - ${m.opponent_score}</div>
                <div style="font-size:12px;color:${m.result === 'win' ? '#28a745' : '#dc3545'};font-weight:bold">${m.result === 'win' ? 'VICTORY' : 'DEFEAT'}</div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:15px">
              <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                <div style="font-size:12px;color:#666;margin-bottom:4px">OPPONENT</div>
                <div style="font-weight:bold;color:#333">Player ${m.opponent_id}</div>
              </div>
              <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                <div style="font-size:12px;color:#666;margin-bottom:4px">DURATION</div>
                <div style="font-weight:bold;color:#333">${m.duration || 'Unknown'}</div>
              </div>
              <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                <div style="font-size:12px;color:#666;margin-bottom:4px">SCORE DIFF</div>
                <div style="font-weight:bold;color:${Math.abs(m.user_score - m.opponent_score) > 5 ? '#dc3545' : '#28a745'}">${Math.abs(m.user_score - m.opponent_score)} pts</div>
              </div>
              <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                <div style="font-size:12px;color:#666;margin-bottom:4px">MATCH TYPE</div>
                <div style="font-weight:bold;color:#333">${
                  Math.abs(m.user_score - m.opponent_score) <= 2 ? 'NAIL-BITER' :
                  Math.abs(m.user_score - m.opponent_score) <= 5 ? 'CLOSE' :
                  Math.abs(m.user_score - m.opponent_score) <= 10 ? 'COMPETITIVE' : 'DOMINANT'
                }</div>
              </div>
            </div>

            <div style="display:flex;gap:10px">
              <button data-action="view-replay" data-id="${m.id}" style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">📽️ View Replay</button>
              <button data-action="share-match" data-id="${m.id}" style="background:#28a745;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">📤 Share</button>
              <button data-action="analyze-match" data-id="${m.id}" style="background:#ffc107;color:#000;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">📊 Analyze</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function historyAnalysis(history: Match[]): string {
  return `
    <div>
      <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:25px">
        <h4 style="margin:0 0 15px 0;color:#333">📈 Match Performance Analysis</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div><canvas id="winRateChart" width="250" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas></div>
          <div><canvas id="scoreDistribution" width="250" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px">
        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h4 style="margin:0 0 15px 0;color:#333">🎯 Performance Patterns</h4>
          ${[
            { label: 'Best Day', value: bestPlayingDay(history), desc: 'Highest win rate', color: '#28a745' },
            { label: 'Preferred Time', value: mostActiveTime(history), desc: 'Most active period', color: '#007bff' },
            { label: 'Momentum', value: currentMomentum(history), desc: 'Recent trend', color: '#17a2b8' },
          ].map(p => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f8f9fa;border-radius:8px;margin-bottom:10px">
              <div><div style="font-weight:bold;color:#333">${p.label}</div><div style="font-size:12px;color:#666">${p.desc}</div></div>
              <div style="font-weight:bold;color:${p.color}">${p.value}</div>
            </div>
          `).join('')}
        </div>

        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h4 style="margin:0 0 15px 0;color:#333">👥 Opponent Analysis</h4>
          ${opponentAnalysis(history).map((o, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid #f1f3f4">
              <div style="width:30px;height:30px;border-radius:50%;background:#007bff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px">${i + 1}</div>
              <div style="flex:1">
                <div style="font-weight:bold;color:#333">Player ${o.id}</div>
                <div style="font-size:12px;color:#666">${o.matches} matches</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:bold;color:${o.winRate >= 50 ? '#28a745' : '#dc3545'}">${o.winRate}%</div>
                <div style="font-size:12px;color:#666">${o.record}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
        <h4 style="margin:0 0 15px 0;color:#333">⏰ Time-based Performance</h4>
        <canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:#f8f9fa;border-radius:8px"></canvas>
      </div>
    </div>
  `;
}

export function modals(): string {
  return `
    <div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:#28a745;color:#fff;padding:15px 20px;border-radius:5px;z-index:1000;max-width:300px"></div>
    <div id="avatar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:2000">
      <div style="background:#fff;padding:30px;border-radius:15px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0;color:#333;font-size:20px">🖼️ Choose Your Avatar</h3>
          <button id="avatar-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
        </div>
        <p style="color:#666;margin-bottom:20px;font-size:14px">Select an avatar from the options below:</p>
        <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:12px">
          ${AVAILABLE_AVATARS.map((a, i) => `
            <div class="avatar-option" data-avatar="${a}" style="cursor:pointer;border:3px solid transparent;border-radius:12px;padding:8px;transition:all 0.3s;background:#f8f9fa">
              <img src="${a}" width="64" height="64" style="border-radius:50%;object-fit:cover;display:block;width:100%" alt="Avatar ${i+1}"/>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;text-align:center">
          <button id="avatar-confirm" disabled style="background:#007bff;color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;opacity:0.5">Select Avatar</button>
        </div>
      </div>
    </div>

    <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:2000">
      <div style="background:#fff;padding:30px;border-radius:10px;width:400px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
        <h3 style="margin:0 0 20px 0;color:#333">🔒 Change Password</h3>
        <form id="pass-form">
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Current Password:</label>
            <input id="pass-cur" type="password" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
          </div>
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">New Password:</label>
            <input id="pass-new" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
            <small style="color:#666">Minimum 6 characters</small>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Confirm Password:</label>
            <input id="pass-conf" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="pass-cancel" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">Cancel</button>
            <button type="submit" style="background:#007bff;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">Update Password</button>
          </div>
          <div id="pass-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
        </form>
      </div>
    </div>
  `;
}

export function layout(profile: Profile, stats: Stats, history: Match[], friends: Friend[], statsTab: string, historyView: string, editMode: boolean): string {
  return `
    <div style="max-width:1400px;margin:0 auto;padding:20px">
      <h2 style="color:#333;border-bottom:3px solid #007bff;padding-bottom:10px;margin-bottom:20px">👤 Profile Dashboard</h2>
      ${header(profile, editMode)}
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:30px;margin-top:30px">
        <div>
          <div style="background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin-bottom:30px">
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
              <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">📊 Gaming Statistics Dashboard</h3>
              <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Comprehensive view of your gaming performance</p>
            </div>
            <div style="display:flex;border-bottom:1px solid #e9ecef;background:#f8f9fa">
              ${['overview','performance','trends'].map(tab => `
                <button class="stats-tab ${statsTab === tab ? 'active' : ''}" data-tab="${tab}"
                        style="flex:1;padding:12px 20px;border:none;background:${statsTab === tab ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${statsTab === tab ? '#007bff' : 'transparent'};
                               cursor:pointer;font-weight:${statsTab === tab ? 'bold' : 'normal'};color:#333">
                  ${tab === 'overview' ? '📈 Overview' : tab === 'performance' ? '🎯 Performance' : '📊 Trends'}
                </button>
              `).join('')}
            </div>
            <div id="stats-content" style="padding:20px"></div>
          </div>

          <div style="background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
              <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">🏆 Match History Dashboard</h3>
              <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Detailed analysis of your game sessions</p>
            </div>
            <div style="display:flex;border-bottom:1px solid #e9ecef;background:#f8f9fa">
              ${['list','detailed','analysis'].map(view => `
                <button class="history-tab ${historyView === view ? 'active' : ''}" data-view="${view}"
                        style="flex:1;padding:12px 20px;border:none;background:${historyView === view ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${historyView === view ? '#f5576c' : 'transparent'};
                               cursor:pointer;font-weight:${historyView === view ? 'bold' : 'normal'};color:#333">
                  ${view === 'list' ? '📋 Match List' : view === 'detailed' ? '🔍 Detailed View' : '📈 Analysis'}
                </button>
              `).join('')}
            </div>
            <div id="history-content" style="padding:20px"></div>
          </div>
        </div>

        <div>
          <h3 style="color:#333;border-bottom:2px solid #dc3545;padding-bottom:8px;margin-bottom:15px">👥 Friends</h3>
          <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px">
            <h4 style="margin:0 0 10px 0;font-size:14px;color:#666">Add New Friend</h4>
            <div style="display:flex;gap:8px">
              <input id="friend-input" placeholder="Enter username..." style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px"/>
              <button id="friend-add" style="background:#007bff;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:14px">➕ Add</button>
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