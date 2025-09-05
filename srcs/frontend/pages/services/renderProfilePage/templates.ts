// Error display helper
function showProfileError(message: string) {
	let errorDiv = document.getElementById('save-error');
	if (errorDiv) {
		errorDiv.textContent = message;
		errorDiv.style.display = 'block';
		errorDiv.style.background = '#ffe0e0';
		errorDiv.style.color = '#b00020';
		errorDiv.style.border = '1px solid #b00020';
		errorDiv.style.padding = '8px';
		errorDiv.style.marginTop = '10px';
		errorDiv.style.borderRadius = '4px';
		errorDiv.style.fontWeight = 'bold';
	}
}

// Max length constants
const MAX_USERNAME_LENGTH = 20;
const MAX_DISPLAYNAME_LENGTH = 30;

// Profile input validation
function validateProfileInput(username: string, displayName: string) {
	if (username.length > MAX_USERNAME_LENGTH) {
		showProfileError(`Username must be at most ${MAX_USERNAME_LENGTH} characters.`);
		return false;
	}
	if (displayName.length > MAX_DISPLAYNAME_LENGTH) {
		showProfileError(`Display name must be at most ${MAX_DISPLAYNAME_LENGTH} characters.`);
		return false;
	}
	return true;
}
// SVG ICON HELPERS (top-level scope)
function svgUserIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>`;
}
function svgFriendsIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b6a6ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="4"/><circle cx="17" cy="8" r="4"/><path d="M7 12c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4zm10 0c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4z"/></svg>`;
}
function svgChartIcon() {
	return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="8" rx="1.5"/><rect x="9" y="8" width="4" height="12" rx="1.5"/><rect x="15" y="4" width="4" height="16" rx="1.5"/></svg>`;
}
function svgFlameIcon() {
	return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e6c79c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z"/><path d="M12 22a7 7 0 0 1-7-7c0-2.5 2-5.5 7-13 5 7.5 7 10.5 7 13a7 7 0 0 1-7 7z"/></svg>`;
}
function svgBarChartIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b6a6ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="4" height="10" rx="1.5"/><rect x="9" y="6" width="4" height="14" rx="1.5"/><rect x="15" y="2" width="4" height="18" rx="1.5"/></svg>`;
}
function svgStarIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#e6c79c" stroke="#e6c79c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.5 21 12 17.8 5.5 21 7 14.1 2 9.3 9 8.5 12 2"/></svg>`;
}
function svgClockIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}
function svgTrendIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4be17b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`;
}
function svgOpponentIcon() {
	return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4"/><circle cx="17" cy="7" r="4"/><path d="M7 11c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4zm10 0c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4z"/></svg>`;
}
function svgMedalGold() {
	return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#e6c79c" stroke="#b6a6ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
}
function svgMedalSilver() {
	return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#b6a6ca" stroke="#7fc7d9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
}
function svgMedalBronze() {
	return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#e6a06c" stroke="#b6a6ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
}
// Tipagem global para window.state (usado na paginação de friends)
declare global {
	interface Window {
		state: any;
		renderProfilePage?: (container: HTMLElement, onBadgeUpdate?: () => void) => void;
		setupButtons?: () => void;
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
          <span style="color:white;font-size:14px;font-weight:600">${svgChartIcon()} Change</span>
        </div>
      </div>
      <div style="margin-top:15px">
        <button id="avatar-btn" type="button"
                style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:8px 16px;
                       border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;
                       transition:all 0.3s;box-shadow:0 4px 12px rgba(0,174,239,0.3)">
          ${svgChartIcon()} Choose Avatar
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
	return `
    <div class="header-view" style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:30px 0 0 0;border-radius:20px;margin:0 0 20px 0;box-shadow:0 8px 32px rgba(0,174,239,0.2);border:1px solid ${GRID_COLORS.cool};position:relative;z-index:10;">
      <div class="header-content" style="display:flex;align-items:flex-start;gap:30px;flex-wrap:wrap;justify-content:center;position:sticky;top:0;left:0;width:100%;max-width:1200px;margin:0 auto;">
        ${avatar}
        <div style="flex:1;min-width:300px">
          <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px">
// Edit button removed from header
            <h3 style="margin:0;color:${GRID_COLORS.primary};font-size:28px;font-weight:700">@${profile.username}</h3>
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
            <span style="font-weight:600;color:${GRID_COLORS.primary}">Status:</span> ${profile.online_status
			? '<svg width="16" height="16" style="vertical-align:middle;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4be17b" stroke="#fff" stroke-width="2"/></svg> Online'
			: '<svg width="16" height="16" style="vertical-align:middle;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#b6a6ca" stroke="#fff" stroke-width="2"/></svg> Offline'} •
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
		const team = f.team ? f.team.toUpperCase() : '';
		let teamLogo = '';
		if (team && Object.prototype.hasOwnProperty.call(TEAM_LOGOS, team)) {
			teamLogo = TEAM_LOGOS[team as keyof typeof TEAM_LOGOS];
		}
		return `
    <div class="friend-item amazing-friend-card" data-id="${id}" data-name="${displayName}">
      <div class="amazing-avatar-wrap">
        <img src="${avatar}" width="56" height="56" class="amazing-avatar" alt="Avatar"/>
        ${teamLogo ? `<img src="${teamLogo}" width="30" height="30" class="amazing-team-logo" alt="Team Logo"/>` : ''}
        <span class="amazing-status-dot" style="background:${online ? '#4be17b' : '#b6a6ca'};box-shadow:0 0 8px 2px ${online ? '#4be17b88' : '#b6a6ca55'}"></span>
      </div>
      <div class="amazing-friend-info">
        <div class="amazing-friend-name">${displayName}</div>
        <div class="amazing-friend-username">@${username}</div>
      </div>
      <button class="remove-friend-btn amazing-remove-btn" data-action="remove-friend" data-id="${id}" data-friend-id="${id}" data-name="${displayName}" data-friend-name="${displayName}" title="Remove friend">
        <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></span>
      </button>
    </div>
    <style>
      .amazing-friend-card {
        background: rgba(255,255,255,0.55);
        border-radius: 22px;
        box-shadow: 0 8px 32px 0 #b6a6ca33, 0 1.5px 8px #7fc7d933;
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 18px 22px 18px 18px;
        position: relative;
        min-height: 90px;
        overflow: hidden;
        backdrop-filter: blur(8px) saturate(1.2);
        border: 1.5px solid #eaeaea;
        transition: box-shadow 0.25s, transform 0.18s;
        cursor: pointer;
        z-index: 1;
      }
      .amazing-friend-card:hover {
        box-shadow: 0 16px 48px 0 #b6a6ca55, 0 2px 12px #7fc7d955;
        transform: translateY(-2px) scale(1.035) rotate(-0.5deg);
        border-color: #b6a6ca;
      }
      .amazing-avatar-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 56px;
      }
      .amazing-avatar {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #b6a6ca;
        box-shadow: 0 2px 8px #b6a6ca22;
        width: 56px;
        height: 56px;
        background: #fff;
        transition: border 0.2s, box-shadow 0.2s;
      }
      .amazing-friend-card:hover .amazing-avatar {
        border: 3px solid #7fc7d9;
        box-shadow: 0 4px 16px #7fc7d955;
      }
      .amazing-team-logo {
        position: absolute;
        bottom: -8px;
        right: -14px;
        border-radius: 50%;
        border: 2.5px solid #fff;
        background: #fff;
        box-shadow: 0 2px 8px #b6a6ca22;
        width: 30px;
        height: 30px;
        z-index: 2;
        transition: transform 0.18s;
      }
      .amazing-friend-card:hover .amazing-team-logo {
        transform: scale(1.08) rotate(-8deg);
      }
      .amazing-status-dot {
        position: absolute;
        left: -7px;
        bottom: 2px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2.5px solid #fff;
        z-index: 2;
        transition: background 0.2s, box-shadow 0.2s;
      }
      .amazing-friend-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .amazing-friend-name {
        font-weight: 800;
        font-size: 18px;
        color: #6b7a8f;
        letter-spacing: 0.2px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-shadow: 0 1px 8px #fff8;
      }
      .amazing-friend-username {
        font-size: 13px;
        color: #b6a6ca;
        opacity: 0.85;
        font-weight: 600;
        letter-spacing: 0.1px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .amazing-remove-btn {
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 0 0 0 10px;
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 2;
        position: relative;
      }
      .amazing-friend-card:hover .amazing-remove-btn {
        opacity: 1 !important;
      }
      .amazing-remove-btn span {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg,#ff5c5c 60%,#eaeaea 100%);
        color: #fff;
        font-size: 20px;
        line-height: 32px;
        text-align: center;
        box-shadow: 0 2px 8px #b6a6ca22;
        transition: background 0.2s, box-shadow 0.2s;
      }
      .amazing-remove-btn:hover span {
        background: #ff2d2d;
        box-shadow: 0 4px 16px #ff5c5c55;
      }
    /* Editable input hover effect */
    #profile-edit-form input[type="text"],
    #profile-edit-form input[type="email"] {
      transition: background 0.18s, box-shadow 0.18s;
    }
    #profile-edit-form input[type="text"]:hover,
    #profile-edit-form input[type="email"]:hover,
    #profile-edit-form input[type="text"]:focus,
    #profile-edit-form input[type="email"]:focus {
      background: #f4f6fa;
      box-shadow: 0 2px 8px #b6a6ca33;
      outline: none;
    }
    /* Button hover effects for edit section */
    #avatar-btn:hover {
      background: #a3e1f7 !important;
      color: #23272f !important;
      box-shadow: 0 4px 16px #7fc7d988 !important;
    }
    #pass-btn:hover {
      background: #ffe6b3 !important;
      color: #23272f !important;
      box-shadow: 0 4px 16px #e6c79c88 !important;
    }
    #save-btn:hover {
      background: #00e68a !important;
      color: #fff !important;
      box-shadow: 0 4px 16px #00d56388 !important;
    }
    #cancel-btn:hover {
      background: #d1a3e6 !important;
      color: #fff !important;
      box-shadow: 0 4px 16px #9b59b688 !important;
    }
    </style>
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
    <div class="amazing-friends-grid">
      <div>
        ${col1.map(friendCard).join('')}
      </div>
      <div>
        ${col2.map(friendCard).join('')}
      </div>
    </div>
    <style>
      .amazing-friends-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      @media (max-width: 700px) {
        .amazing-friends-grid {
          grid-template-columns: 1fr;
        }
        .amazing-friends-grid > div {
          margin-bottom: 0;
        }
        .amazing-friend-card {
          min-width: 0;
          padding: 14px 10px 14px 10px;
        }
        .amazing-avatar {
          width: 44px;
          height: 44px;
        }
        .amazing-team-logo {
          width: 22px;
          height: 22px;
        }
        .amazing-friend-name {
          font-size: 16px;
        }
        .amazing-friend-username {
          font-size: 12px;
        }
      }
      @media (max-width: 480px) {
        .amazing-friends-grid {
          grid-template-columns: 1fr;
        }
        .amazing-friend-card {
          flex-direction: column;
          align-items: flex-start;
          padding: 10px 4px;
        }
        .amazing-avatar {
          width: 36px;
          height: 36px;
        }
        .amazing-team-logo {
          width: 16px;
          height: 16px;
        }
        .amazing-friend-name {
          font-size: 14px;
        }
        .amazing-friend-username {
          font-size: 11px;
        }
      }
    </style>
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
  <div style="font-size:48px;margin-bottom:15px">${svgChartIcon()}</div>
        <h4 style="margin:0 0 10px 0;color:${GRID_COLORS.primary}">No Match History</h4>
        <p style="margin:0">Your game history will appear here once you start playing!</p>
      </div>
    `;
	}
	return `
    <div>
      <style>
      .stats-animated-box {
        transition: box-shadow .18s, transform .18s;
      }
      .stats-animated-box:hover {
        box-shadow: 0 8px 32px #b6a6ca55, 0 2px 12px #7fc7d955;
        transform: scale(1.045) translateY(-2px);
        z-index:2;
      }
      .amazing-match-card {
        transition: box-shadow .18s, transform .18s, filter .18s;
      }
      .amazing-match-card:hover {
        box-shadow: 0 12px 36px #b6a6ca33, 0 2px 12px #7fc7d955;
        transform: scale(1.025) translateY(-2px);
        filter: brightness(1.07) saturate(1.12);
        z-index:2;
      }
      .amazing-match-card-highlight {
        box-shadow: 0 0 0 3px #4be17b88, 0 8px 32px #b6a6ca33;
        border: 2.5px solid #4be17b;
        background: linear-gradient(90deg,#fffbe6 0%,#eafff3 100%) !important;
        position:relative;
      }
      .amazing-match-card-highlight:after {
        content: '';
        position: absolute;
        left: 0; right: 0; top: 0; bottom: 0;
        border-radius: 14px;
        pointer-events: none;
        box-shadow: 0 0 32px 8px #4be17b33 inset;
      }
      </style>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:22px;margin-bottom:28px;z-index:1;position:relative;">
        <div style="background:linear-gradient(135deg,#4be17b 0%,#eafff3 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #4be17b22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
          <span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#4be17b;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #4be17b55;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M6 13l3 3 7-7" stroke="#4be17b" stroke-width="2.5" fill="none"/></svg>
          </span>
          <span style="font-size:32px;font-weight:900;color:#1e7d4b;">${history.filter(m => m.result === 'win').length}</span>
          <span style="font-size:15px;color:#1e7d4b;font-weight:700;letter-spacing:0.5px;">Total Wins</span>
        </div>
        <div style="background:linear-gradient(135deg,#ff5c5c 0%,#ffeaea 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #ff5c5c22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
          <span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#ff5c5c;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #ff5c5c55;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M7 7l8 8M15 7l-8 8" stroke="#ff5c5c" stroke-width="2.5" fill="none"/></svg>
          </span>
          <span style="font-size:32px;font-weight:900;color:#b22222;">${history.filter(m => m.result === 'loss').length}</span>
          <span style="font-size:15px;color:#b22222;font-weight:700;letter-spacing:0.5px;">Total Losses</span>
        </div>
        <div style="background:linear-gradient(135deg,#7fc7d9 0%,#eafaff 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #7fc7d922;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
          <span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#7fc7d9;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #7fc7d955;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><rect x="6" y="10" width="10" height="2" rx="1" fill="#7fc7d9"/></svg>
          </span>
          <span style="font-size:32px;font-weight:900;color:#1e5c7d;">${history.length}</span>
          <span style="font-size:15px;color:#1e5c7d;font-weight:700;letter-spacing:0.5px;">Total Matches</span>
        </div>
        <div style="background:linear-gradient(135deg,#e6c79c 0%,#fffbe6 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #e6c79c22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
          <span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#e6c79c;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #e6c79c55;">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M11 5v7l5 3" stroke="#e6c79c" stroke-width="2.5" fill="none"/></svg>
          </span>
          <span style="font-size:32px;font-weight:900;color:#b48a1e;">${longestWinStreak(history)}</span>
          <span style="font-size:15px;color:#b48a1e;font-weight:700;letter-spacing:0.5px;">Best Streak</span>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.55);border-radius:18px;overflow:hidden;box-shadow:0 8px 32px #b6a6ca22, 0 1.5px 8px #7fc7d933;border:1.5px solid #eaeaea;backdrop-filter:blur(8px) saturate(1.2);">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px 24px 16px 24px;border-bottom:1px solid ${GRID_COLORS.cool}">
          <h4 style="margin:0;color:${GRID_COLORS.primary};font-size:20px;font-weight:800;letter-spacing:0.2px;">Recent Matches</h4>
          <p style="margin:5px 0 0 0;color:${GRID_COLORS.muted};font-size:14px">Your 5 most recent games</p>
        </div>
        <div>
${recent.map((m, index) => {
		const isWin = m.result === 'win';
		const diff = Math.abs(m.user_score - m.opponent_score);
		// Prefer display_name, then username, then opponent_name, then fallback
		const opponentDisplay = m.opponent_display_name || m.opponent_username || m.opponent_name || `Player ${m.opponent_id}`;
		return `
  <div class="amazing-match-card" style="display:flex;align-items:center;gap:16px;padding:13px 0 13px 0;position:relative;min-height:50px;background:linear-gradient(90deg,rgba(255,255,255,0.13) 60%,rgba(76,225,123,0.09) 100%);border-radius:14px;box-shadow:0 2px 12px #b6a6ca22;">
      <style>
      .stats-animated-box {
        transition: box-shadow .18s, transform .18s, filter .18s;
      }
      .stats-animated-box:hover {
        box-shadow: 0 8px 32px #b6a6ca55, 0 2px 12px #7fc7d955;
        transform: scale(1.045) translateY(-2px);
        filter: brightness(1.08) saturate(1.13) drop-shadow(0 0 8px #4be17b33);
        z-index:2;
      }
      .amazing-match-card {
        transition: box-shadow .18s, transform .18s, filter .18s;
        position:relative;
        overflow:hidden;
      }
      .amazing-match-card:hover {
        box-shadow: 0 12px 36px #b6a6ca33, 0 2px 12px #7fc7d955;
        transform: scale(1.025) translateY(-2px);
        filter: brightness(1.09) saturate(1.15) drop-shadow(0 0 12px #4be17b33);
        z-index:2;
      }
      .amazing-match-card::after {
        content: '';
        display: block;
        position: absolute;
        left: 10px; right: 10px; bottom: 0;
        height: 2.5px;
        background: linear-gradient(90deg, #eaeaea 0%, #b6a6ca 100%);
        opacity: 0.18;
        border-radius: 2px;
        animation: dividerGlow 2.2s infinite alternate;
      }
      @keyframes dividerGlow {
        0% { opacity: 0.18; }
        100% { opacity: 0.45; box-shadow: 0 0 12px 2px #7fc7d955; }
      }
      </style>
      <style>
      .stats-animated-box {
        transition: box-shadow .18s, transform .18s;
      }
      .stats-animated-box:hover {
        box-shadow: 0 8px 32px #b6a6ca55, 0 2px 12px #7fc7d955;
        transform: scale(1.045) translateY(-2px);
        z-index:2;
      }
      .amazing-match-card-highlight {
        box-shadow: 0 0 0 3px #4be17b88, 0 8px 32px #b6a6ca33;
        border: 2.5px solid #4be17b;
        background: linear-gradient(90deg,#fffbe6 0%,#eafff3 100%) !important;
        position:relative;
      }
      .amazing-match-card-highlight:after {
        content: '';
        position: absolute;
        left: 0; right: 0; top: 0; bottom: 0;
        border-radius: 14px;
        pointer-events: none;
        box-shadow: 0 0 32px 8px #4be17b33 inset;
      }
      </style>
      <div style="position:absolute;left:0;top:10px;bottom:10px;width:5px;border-radius:5px;background:${isWin ? '#4be17b' : '#ff5c5c'};box-shadow:0 0 8px 0 ${isWin ? '#4be17b55' : '#ff5c5c44'};"></div>
      <div style="margin-left:18px;display:flex;align-items:center;gap:10px;">
  <div class="match-avatar-wrap" style="border-radius:50%;overflow:hidden;width:36px;height:36px;box-shadow:0 0 0 2px ${isWin ? '#4be17b' : '#ff5c5c'}33;">
          <img src="/assets/avatar/default.png" width="36" height="36" class="match-avatar" alt="Opponent Avatar" style="border-radius:50%;object-fit:cover;"/>
        </div>
      </div>
      <div style="flex:1;min-width:0;display:flex;align-items:center;gap:14px;justify-content:space-between;">
        <span style="font-weight:900;font-size:16px;color:${GRID_COLORS.primary};max-width:120px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;letter-spacing:0.2px;">vs @${opponentDisplay}</span>
        <span style="font-family:'Share Tech Mono',monospace;font-size:18px;font-weight:900;color:${isWin ? '#4be17b' : '#ff5c5c'};letter-spacing:0.7px;">${m.user_score} - ${m.opponent_score}</span>
        <span style="font-size:13px;color:${GRID_COLORS.muted};">${new Date(m.date_played).toLocaleDateString()}</span>
        <span style="font-size:17px;font-weight:900;color:${isWin ? '#4be17b' : '#ff5c5c'};letter-spacing:0.5px;">${isWin ? 'WIN' : 'LOSS'}</span>
      </div>
      <div class="match-separator"></div>
    </div>
  `;
	}).join('')}
        </div>
      </div>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .amazing-match-card {
          background: linear-gradient(120deg, #f8f9f8 0%, #eaeaea 100%);
          border-radius: 18px;
          box-shadow: 0 2px 12px #b6a6ca11, 0 1.5px 8px #7fc7d933;
          margin: 0 18px 18px 0;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.18s, transform 0.18s, filter 0.18s;
        }
        .amazing-match-card:hover {
          box-shadow: 0 16px 48px #b6a6ca33, 0 2px 12px #7fc7d955;
          transform: scale(1.035) translateY(-3px);
          filter: blur(0.5px) saturate(1.2);
        }
        .match-avatar-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .match-avatar {
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid #b6a6ca;
          box-shadow: 0 2px 8px #b6a6ca22;
          width: 44px;
          height: 44px;
          background: #fff;
        }
        .match-badge-pulse {
          position: absolute;
          bottom: -7px;
          right: -7px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid #fff;
          box-shadow: 0 0 8px 2px #4be17b88;
          animation: pulse-badge 1.2s infinite alternate;
        }
        @keyframes pulse-badge {
          0% { transform: scale(1); box-shadow: 0 0 8px 2px #4be17b88; }
          100% { transform: scale(1.18); box-shadow: 0 0 16px 4px #4be17b44; }
        }
        .match-vs-icon {
          margin: 0 2px;
          opacity: 0.7;
        }
        .digital-score-glow {
          font-family: 'Share Tech Mono', monospace;
          text-shadow: 0 0 8px #fff, 0 0 16px #b6a6ca44;
          letter-spacing: 1.5px;
          cursor: pointer;
        }
        .digital-score-glow:hover::after {
          content: attr(title);
          position: absolute;
          left: 50%;
          top: -28px;
          transform: translateX(-50%);
          background: #fff;
          color: #6b7a8f;
          font-size: 13px;
          padding: 4px 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px #b6a6ca22;
          white-space: nowrap;
          z-index: 10;
        }
  /* progress bar removed for clarity */
        .match-separator {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1.5px;
          background: linear-gradient(90deg,#eaeaea 0%,#b6a6ca 100%);
          opacity: 0.5;
        }
      </style>
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
            <button data-action="apply-history-filters" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">${svgTrendIcon()} Apply</button>
          </div>
        </div>
        <div id="filtered-matches" style="display:grid;gap:22px">
  ${history.length === 0
			? `<div style="padding:40px 0;text-align:center;color:${GRID_COLORS.muted};font-size:20px;font-weight:600;">No matches found for the selected filter.</div>`
			: history.map((m, idx) => {
				const isWin = m.result === 'win';
				const diff = Math.abs(m.user_score - m.opponent_score);
				const matchType = diff <= 2 ? 'Nail-biter' : diff <= 5 ? 'Close' : diff <= 10 ? 'Competitive' : 'Dominant';
				const mvp = diff >= 10 ? svgMedalGold() + ' MVP' : '';
				const barColor = isWin ? '#4be17b' : '#ff5c5c';
				return `
      <div class="amazing-match-card-detailed" style="display:flex;align-items:center;gap:24px;padding:28px 0 28px 0;position:relative;min-height:90px;background:rgba(255,255,255,0.22);border-radius:22px;box-shadow:0 4px 24px #b6a6ca22;overflow:hidden;backdrop-filter:blur(8px) saturate(1.13);">
        <div style="position:absolute;left:0;top:18px;bottom:18px;width:10px;border-radius:10px;background:${barColor};box-shadow:0 0 18px 0 ${barColor}55;"></div>
        <div style="margin-left:44px;display:flex;align-items:center;gap:0;">
          <div class="match-avatar-wrap" style="border-radius:50%;overflow:hidden;width:60px;height:60px;box-shadow:0 0 0 4px ${barColor}33;transition:transform 0.18s;">
            <img src="/assets/avatar/default.png" width="60" height="60" class="match-avatar" alt="Opponent Avatar" style="border-radius:50%;object-fit:cover;transition:transform 0.18s;" onmouseover="this.style.transform='scale(1.13)'" onmouseout="this.style.transform='scale(1)'"/>
          </div>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;justify-content:center;">
          <div style="display:flex;align-items:center;gap:18px;">
            <span style="font-weight:900;font-size:32px;color:${barColor};letter-spacing:1.5px;font-family:'Share Tech Mono',monospace;text-shadow:0 2px 8px #fff8;padding:0 18px 0 0;">${m.user_score} - ${m.opponent_score}</span>
            <span style="font-size:19px;font-weight:800;color:${barColor};display:flex;align-items:center;gap:4px;">
              ${isWin ? svgMedalGold() + ' WIN' : svgFlameIcon() + ' LOSS'}
            </span>
            <span style="font-size:16px;color:${diff <= 2 ? '#7fc7d9' : diff <= 5 ? '#b6a6ca' : '#e6c79c'};font-weight:700;display:flex;align-items:center;gap:4px;">
              <span style="background:linear-gradient(90deg,#e6c79c22,#7fc7d922);padding:3px 14px;border-radius:10px;font-size:14px;font-weight:700;">${matchType}</span>
            </span>
            ${mvp ? `<span style="font-size:16px;font-weight:900;color:#e6c79c;">${mvp}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:14px;">
            <span style="font-weight:800;font-size:18px;color:${GRID_COLORS.primary};letter-spacing:0.2px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;cursor:pointer;" title="${m.opponent_display_name || m.opponent_username || m.opponent_name || `Player ${m.opponent_id}`}: ${new Date(m.date_played).toLocaleString()}">
              vs ${m.opponent_display_name || m.opponent_username || m.opponent_name || `Player ${m.opponent_id}`}
            </span>
            <span style="font-size:14px;color:${GRID_COLORS.muted};">${new Date(m.date_played).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="text-align:right;min-width:80px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:6px;">
          <span style="font-size:14px;color:${GRID_COLORS.muted};">Score Diff</span>
          <span style="font-size:17px;font-weight:900;color:${barColor};">${isWin ? '+' : '-'}${diff}</span>
        </div>
      </div>
    `;
			}).join('')}
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
			{ label: 'Total Matches', value: stats.matches_played, color: GRID_COLORS.cool, icon: svgChartIcon(), sub: 'Games played' },
			{ label: 'Win Rate', value: `${wr}%`, color: parseFloat(wr) >= 50 ? GRID_COLORS.success : GRID_COLORS.accent, icon: svgMedalGold(), sub: `${stats.matches_won}W / ${stats.matches_lost}L` },
			{ label: 'Score Ratio', value: kd, color: parseFloat(kd) >= 1 ? GRID_COLORS.success : GRID_COLORS.warm, icon: svgTrendIcon(), sub: 'Scored / Conceded' },
			{ label: 'Tournaments Won', value: stats.tournaments_won || 0, color: GRID_COLORS.warm, icon: svgMedalGold(), sub: 'Titles' }
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
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>${svgBarChartIcon()}</span> Scoring Statistics</h4>
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
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>${svgFlameIcon()}</span> Performance Metrics</h4>
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
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgBarChartIcon()} Recent Match Scores</h4>
          <canvas id="performanceChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgMedalGold()} Performance Rankings</h4>
${[
			{ label: 'Consistency', value: `${cons}%`, desc: 'Performance stability', color: cons >= 70 ? GRID_COLORS.success : cons >= 50 ? GRID_COLORS.warm : GRID_COLORS.accent, icon: svgBarChartIcon() },
			{ label: 'Clutch Factor', value: `${clutch}%`, desc: 'Close game wins', color: clutch >= 60 ? GRID_COLORS.success : GRID_COLORS.warm, icon: svgFlameIcon() },
			{ label: 'Dominance', value: `${dom}%`, desc: 'Big-margin wins', color: GRID_COLORS.cool, icon: svgTrendIcon() },
			{ label: 'Efficiency', value: eff, desc: 'Performance per match', color: GRID_COLORS.accent, icon: svgBarChartIcon() },
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
  <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgFlameIcon()} Activity Heatmap (7 days)</h4>
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
			{ label: 'Win Rate', value: `${(stats.win_rate * 100).toFixed(1)}%`, color: GRID_COLORS.success, icon: svgMedalGold(), period: 'current' },
			{ label: 'Avg Score', value: (stats.matches_played ? (stats.points_scored / stats.matches_played).toFixed(1) : '0'), color: GRID_COLORS.cool, icon: svgBarChartIcon(), period: 'per match' },
			{ label: 'Games/Week', value: String(gamesThisWeek([])), color: GRID_COLORS.cool, icon: svgChartIcon(), period: 'this week' }, /* updated at runtime in index */
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
        <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgTrendIcon()} Win Rate Progression</h4>
        <canvas id="trendsChart" width="800" height="300" style="width:100%;height:300px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
      </div>
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgClockIcon()} Weekly Breakdown</h4>
          <canvas id="weeklyChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
          <h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgClockIcon()} Time-based Performance</h4>
          <canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
        </div>
      </div>
    </div>
  `;
}
export function historyAnalysis(history: Match[]): string {
	return `
      <div>
        <div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:28px 24px 24px 24px;border-radius:18px;margin-bottom:32px;box-shadow:0 8px 32px #b6a6ca33;">
          <h4 style="margin:0 0 18px 0;color:${GRID_COLORS.primary};font-size:26px;letter-spacing:0.5px;font-weight:900;display:flex;align-items:center;gap:10px;">
            <span style="display:inline-flex;align-items:center;">${svgChartIcon()}</span>
            Match Performance Analysis
            <span style="display:inline-flex;align-items:center;">${svgFlameIcon()}</span>
          </h4>
          <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;margin-top:18px;">
            <div style="background:rgba(255,255,255,0.22);border-radius:14px;box-shadow:0 2px 12px #b6a6ca22;padding:18px 12px 12px 12px;backdrop-filter:blur(6px) saturate(1.1);">
              <canvas id="winRateChart" width="250" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
            </div>
            <div style="background:rgba(255,255,255,0.22);border-radius:14px;box-shadow:0 2px 12px #b6a6ca22;padding:18px 12px 12px 12px;backdrop-filter:blur(6px) saturate(1.1);">
              <canvas id="scoreDistribution" width="250" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
            </div>
          </div>
        </div>
        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px;margin-bottom:32px">
          <div style="background:rgba(255,255,255,0.33);padding:32px 24px 24px 24px;border-radius:22px;box-shadow:0 8px 32px #b6a6ca33, 0 1.5px 8px #7fc7d955;border:2px solid #eaeaea;backdrop-filter:blur(10px) saturate(1.18);">
            <h4 style="margin:0 0 22px 0;color:${GRID_COLORS.primary};font-size:22px;font-weight:900;letter-spacing:0.3px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-flex;align-items:center;">${svgBarChartIcon()}</span>
              Performance Patterns
            </h4>
  ${[
			{ label: 'Best Day', value: bestPlayingDay(history), desc: 'Highest win rate', color: GRID_COLORS.success, icon: svgStarIcon() },
			{ label: 'Preferred Time', value: mostActiveTime(history), desc: 'Most active period', color: GRID_COLORS.cool, icon: svgClockIcon() },
			{ label: 'Momentum', value: currentMomentum(history), desc: 'Recent trend', color: GRID_COLORS.cool, icon: svgTrendIcon() },
		].map(p => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0 14px 0;background:linear-gradient(135deg, ${GRID_COLORS.cool}11 0%, ${GRID_COLORS.bg} 100%);border-radius:12px;margin-bottom:14px;box-shadow:0 2px 8px #b6a6ca11;">
                <div style="display:flex;align-items:center;gap:10px"><span style="display:inline-flex;align-items:center;">${p.icon}</span><div><div style="font-weight:900;color:${GRID_COLORS.primary};font-size:16px;">${p.label}</div><div style="font-size:13px;color:${GRID_COLORS.muted}">${p.desc}</div></div></div>
                <div style="font-weight:900;color:${p.color};font-size:17px;">${p.value}</div>
              </div>
            `).join('')}
          </div>
          <div style="background:rgba(255,255,255,0.33);padding:32px 24px 24px 24px;border-radius:22px;box-shadow:0 8px 32px #b6a6ca33, 0 1.5px 8px #7fc7d955;border:2px solid #eaeaea;backdrop-filter:blur(10px) saturate(1.18);">
            <h4 style="margin:0 0 22px 0;color:${GRID_COLORS.primary};font-size:22px;font-weight:900;letter-spacing:0.3px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-flex;align-items:center;">${svgOpponentIcon()}</span>
              Opponent Analysis
            </h4>
  ${opponentAnalysis(history).map((o, i) => {
			const medal = i === 0 ? svgMedalGold() : i === 1 ? svgMedalSilver() : i === 2 ? svgMedalBronze() : '';
			function svgClockIcon() {
				return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
			}
			function svgTrendIcon() {
				return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4be17b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`;
			}
			function svgOpponentIcon() {
				return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4"/><circle cx="17" cy="7" r="4"/><path d="M7 11c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4zm10 0c-4 0-4 4-4 4v2h8v-2c0-4-4-4-4-4z"/></svg>`;
			}
			function svgMedalGold() {
				return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#e6c79c" stroke="#b6a6ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
			}
			function svgMedalSilver() {
				return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#b6a6ca" stroke="#7fc7d9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
			}
			function svgMedalBronze() {
				return `<svg width="28" height="28" viewBox="0 0 24 24" fill="#e6a06c" stroke="#b6a6ca" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`;
			}
			const barColor = o.winRate >= 50 ? GRID_COLORS.success : GRID_COLORS.accent;
			return `
      <div style="display:flex;align-items:center;gap:18px;padding:14px 0;border-bottom:1.5px solid rgba(0,174,239,0.10);position:relative;">
        <div style="width:38px;height:38px;border-radius:50%;background:${GRID_COLORS.cool};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;box-shadow:0 2px 8px #b6a6ca22;">${medal || i + 1}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:900;color:${GRID_COLORS.primary};font-size:17px;letter-spacing:0.2px;">${o.display || `Player ${o.id}`}</div>
          <div style="font-size:13px;color:${GRID_COLORS.muted};margin-bottom:2px;">${o.matches} matches</div>
          <div style="width:100%;height:8px;background:linear-gradient(90deg,#eaeaea 0%,${barColor} 100%);border-radius:6px;overflow:hidden;">
            <div style="height:100%;width:${Math.max(10, Math.min(100, o.winRate))}%;background:${barColor};border-radius:6px;transition:width 0.3s;"></div>
          </div>
        </div>
        <div style="text-align:right;min-width:70px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:2px;">
          <span style="font-size:15px;font-weight:900;color:${barColor};">${o.winRate}%</span>
          <span style="font-size:13px;color:${GRID_COLORS.muted};">${o.record}</span>
        </div>
      </div>
    `;
		}).join('')}
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
            <label style="display:block;margin-bottom:5px;font-weight:bold">Current Password:
              <input id="pass-cur" type="password" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
          </div>
          <div style="margin-bottom:15px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">New Password:
              <input id="pass-new" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
            <small style="color:${GRID_COLORS.muted}">Minimum 6 characters</small>
          </div>
          <div style="margin-bottom:20px">
            <label style="display:block;margin-bottom:5px;font-weight:bold">Confirm Password:
              <input id="pass-conf" type="password" minlength="6" required style="width:100%;padding:10px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;box-sizing:border-box;background:${GRID_COLORS.bg}"/>
            </label>
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
  /* animation removed */
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
      /* Editable input hover effect */
      #profile-edit-form input[type="text"],
      #profile-edit-form input[type="email"] {
        transition: background 0.18s, box-shadow 0.18s;
      }
      #profile-edit-form input[type="text"]:hover,
      #profile-edit-form input[type="email"]:hover,
      #profile-edit-form input[type="text"]:focus,
      #profile-edit-form input[type="email"]:focus {
        background: #f4f6fa;
        box-shadow: 0 2px 8px #b6a6ca33;
        outline: none;
      }
      /* Button hover effects for edit section */
      #avatar-btn:hover {
        background: #a3e1f7 !important;
        color: #23272f !important;
        box-shadow: 0 4px 16px #7fc7d988 !important;
      }
      #pass-btn:hover {
        background: #ffe6b3 !important;
        color: #23272f !important;
        box-shadow: 0 4px 16px #e6c79c88 !important;
      }
      #save-btn:hover {
        background: #00e68a !important;
        color: #fff !important;
        box-shadow: 0 4px 16px #00d56388 !important;
      }
      #cancel-btn:hover {
        background: #d1a3e6 !important;
        color: #fff !important;
        box-shadow: 0 4px 16px #9b59b688 !important;
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
        .gris-main-card { padding: 8px 0.5vw; max-width: 100vw; }
        .gris-section { padding: 6px 0.5vw 6px 0.5vw; }
        .gris-avatar { width: 60px; height: 60px; }
        .gris-avatar img { width: 44px; height: 44px; }
        .gris-username { font-size: 1rem; }
        .profile-timeline-bg {
          min-height: 320px !important;
          padding-bottom: 8px !important;
        }
        .profile-timeline-events {
          gap: 18px !important;
        }
        .edit-mode.profile-timeline-events {
          gap: 8px !important;
        }
        .timeline-event {
          max-width: 98vw !important;
          gap: 8px !important;
        }
        #profile-edit-form {
          padding: 0 2vw !important;
        }
        .gris-action-btn {
          font-size: 0.95rem !important;
          height: 38px !important;
          padding: 0 12px !important;
        }
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
  <div class="fixed-profile-header" style="background:linear-gradient(120deg,#f4f6fa 60%, #b6a6ca33 100%, #7fc7d933 120%);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 0 32px 0;gap:18px;min-height:100px;border-right:1.5px solid #e3e6f3;">
          <div class="gris-avatar">
            <img src="${profile.avatar_url}" alt="Avatar"/>
          </div>
          <div class="gris-username">@${profile.username}</div>
          <div class="gris-quote">“The world is painted in gentle hues.”</div>
          <div class="gris-divider"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0;padding:48px 32px 32px 32px;">
          <!-- Main Tabs -->
          <div style="display:flex;gap:0;margin-bottom:32px;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px #b6a6ca22;">
            ${['profile', 'stats', 'history', 'friends'].map(tab => `
              <button class="main-tab${tab === mainTab ? ' active' : ''}" data-main-tab="${tab}"
      style="flex:1;padding:18px 0;border:none;background:${tab === mainTab ? GRID_COLORS.bg : '#f4f6fa'};
        color:${tab === mainTab ? GRID_COLORS.primary : GRID_COLORS.muted};font-size:1.15rem;font-weight:700;
        border-bottom:4px solid ${tab === mainTab ? GRID_COLORS.cool : 'transparent'};cursor:pointer;transition:all 0.2s"
      onmouseover="this.style.background='${GRID_COLORS.cool}';this.style.color='#fff';this.style.boxShadow='0 2px 12px #7fc7d944';"
      onmouseout="this.style.background='${tab === mainTab ? GRID_COLORS.bg : '#f4f6fa'}';this.style.color='${tab === mainTab ? GRID_COLORS.primary : GRID_COLORS.muted}';this.style.boxShadow='none';">
                ${(tab === 'profile' ? `${svgUserIcon()} Profile` : tab === 'stats' ? `${svgBarChartIcon()} Statistics` : tab === 'history' ? `${svgMedalGold()} Match History` : `${svgOpponentIcon()} Friends`)}
				</button>
	`).join('')}
          </div>
          <!-- Tab Panels -->
          <div class="tab-panel" id="profile-panel" style="display:${mainTab === 'profile' ? 'block' : 'none'}">
            <div class="profile-timeline-bg${editMode ? ' edit-mode' : ''}" style="position:relative;min-height:420px;padding:0 0 24px 0;overflow:visible;">

              <form id="profile-edit-form" class="profile-timeline-events${editMode ? ' edit-mode' : ''}" style="margin-top:0;display:flex;flex-direction:column;align-items:center;${editMode ? 'gap:8px;' : 'gap:32px;'}">
                ${!editMode ? `<button id="edit-btn" class="gris-action-btn" title="Edit Profile" type="button"
                  style="position:absolute;top:0;right:0;margin:12px 18px 0 0;padding:6px 10px;background:#fff6;border:2px solid #7fc7d9;border-radius:50%;box-shadow:0 2px 8px #7fc7d944;cursor:pointer;z-index:99;transition:background 0.18s, box-shadow 0.18s;min-width:unset;width:40px;height:40px;display:flex;align-items:center;justify-content:center;outline:none;"
                  class="profile-edit-btn"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;pointer-events:none;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>` : ''}
                <style>
                  .profile-edit-btn:hover {
                    background: #e6f7fa !important;
                    box-shadow: 0 4px 16px #7fc7d988 !important;
                  }
                </style>
                ${editMode ? `
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#7fc7d9 0%,#e6c79c 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #e6c79c55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.2s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgStarIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#e6c79c11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <label for="username-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">Username</label>
                    <input id="username-input" type="text" value="${profile.username}" style="font-size:1.02rem;font-weight:700;color:#23272f;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;margin-bottom:2px;" maxlength="24" placeholder="Username"/>
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">unique, for login</div>
                    <label for="display-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">Display Name</label>
                    <input id="display-input" type="text" value="${profile.display_name || ''}" style="font-size:1.12rem;font-weight:800;color:#23272f;letter-spacing:-1px;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;margin-bottom:2px;" maxlength="32" placeholder="Display Name"/>
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">name shown to others</div>
                    <label for="bio-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">Bio</label>
                    <input id="bio-input" type="text" value="${profile.bio || ''}" maxlength="120" style="font-size:0.98rem;color:#b6a6ca;margin-top:2px;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;" placeholder="Write your story..."/>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#e6c79c 0%,#7fc7d9 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #7fc7d955,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.5s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgUserIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#7fc7d911 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Joined the platform</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#b6a6ca 0%,#e6c79c 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #b6a6ca55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.8s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFriendsIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#b6a6ca11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Team</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.team || '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#a3d9b1 0%,#b6a6ca 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #a3d9b155,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 2.1s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgChartIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#a3d9b111 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <label for="email-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">Email</label>
                    <input id="email-input" type="email" value="${profile.email || ''}" style="font-size:1.02rem;font-weight:700;color:#23272f;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;" placeholder="Email"/>
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">for notifications</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#4be17b 0%,#7fc7d9 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #4be17b55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.3s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFlameIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#4be17b11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Status</div>
                    <div style="font-size:0.92rem;color:${profile.online_status ? '#4be17b' : '#b6a6ca'};font-weight:600;">${profile.online_status ? 'Online' : 'Offline'}</div>
                  </div>
                </div>
                <div style="display:flex;gap:16px;margin-top:24px;margin-bottom:8px;flex-wrap:wrap;justify-content:center;">
                  <button id="avatar-btn" type="button" style="background:#7fc7d9;color:#fff;border:none;padding:10px 20px;border-radius:18px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #7fc7d944;"><span style="vertical-align:middle;">${svgChartIcon()}</span> Edit Avatar</button>
                  <input id="avatar-url-input" type="hidden" value="${profile.avatar_url || ''}" />
                  <button id="pass-btn" type="button" style="background:#e6c79c;color:#fff;border:none;padding:10px 20px;border-radius:18px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #e6c79c44;"><span style="vertical-align:middle;">${svgFlameIcon()}</span> Change Password</button>
                  <button id="save-btn" type="submit" style="background:#00d563;color:#fff;border:none;padding:10px 24px;border-radius:20px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #00d56344;"><span style="vertical-align:middle;">${svgMedalGold()}</span> Save</button>
                  <button id="cancel-btn" type="button" style="background:#9b59b6;color:#fff;border:none;padding:10px 24px;border-radius:20px;cursor:pointer;font-weight:500;font-size:14px;transition:all 0.3s"><span style="vertical-align:middle;">${svgUserIcon()}</span> Cancel</button>
                  <div id="save-error" style="color:#e84393;font-size:14px;font-weight:500"></div>
                </div>
                ` : `
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#7fc7d9 0%,#e6c79c 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #e6c79c55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.2s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgStarIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#e6c79c11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.12rem;font-weight:800;color:#23272f;letter-spacing:-1px;">${profile.display_name || profile.username}</div>
                    <div style="font-size:0.98rem;color:#b6a6ca;margin-top:2px;">${profile.bio || 'Write your story...'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#e6c79c 0%,#7fc7d9 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #7fc7d955,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.5s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgUserIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#7fc7d911 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Joined the platform</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#b6a6ca 0%,#e6c79c 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #b6a6ca55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.8s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFriendsIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#b6a6ca11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Team</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.team || '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#a3d9b1 0%,#b6a6ca 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #a3d9b155,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 2.1s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgChartIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#a3d9b111 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Email</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.email || 'Not provided'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#4be17b 0%,#7fc7d9 80%,#fff0 100%);border-radius:50%;box-shadow:0 0 16px 4px #4be17b55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.3s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFlameIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#4be17b11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">Status</div>
                    <div style="font-size:0.92rem;color:${profile.online_status ? '#4be17b' : '#b6a6ca'};font-weight:600;">${profile.online_status ? 'Online' : 'Offline'}</div>
                  </div>
                </div>
                `}
              </form>
              <style>
                @keyframes railGlow {
                  0% { box-shadow:0 0 24px 4px #e6c79c44,0 0 0 2px #fff; }
                  100% { box-shadow:0 0 48px 12px #7fc7d944,0 0 0 2px #fff; }
                }
                @keyframes dotPulse {
                  0% { box-shadow:0 0 16px 4px #e6c79c55,0 0 0 2px #fff; filter:brightness(1.1) saturate(1.2); }
                  100% { box-shadow:0 0 32px 12px #7fc7d955,0 0 0 2px #fff; filter:brightness(1.3) saturate(1.6) blur(1px); }
                }
              </style>
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
					<label for="friend-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">Friend Username</label>
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
        if (editBtn) {
          console.log('[DEBUG] Attaching click event to edit-btn');
          editBtn.onclick = function(e) {
            e.preventDefault();
            console.log('[DEBUG] Edit button clicked');
            window.dispatchEvent(new CustomEvent('profile-edit'));
          };
        } else {
          console.warn('[DEBUG] edit-btn not found in DOM');
        }
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
      // Expose setupButtons globally for re-attachment after render
      window.setupButtons = setupButtons;
      // Run setup on DOMContentLoaded and after dynamic updates
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAll);
      } else {
        setTimeout(setupAll, 200);
      }
    </script>
    `;
}
