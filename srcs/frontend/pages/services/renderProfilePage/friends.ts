import { Friend } from './types.js';
import { GRID_COLORS, TEAM_LOGOS } from './constants.js';
import { translations } from '../language/translations.js';

declare global {
  interface Window {
    state: any;
    renderProfilePage?: (container: HTMLElement, onBadgeUpdate?: () => void) => void;
    setupButtons?: () => void;
  }
}

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '') 
  ? localStorage.getItem('preferredLanguage') 
  : 'en') as keyof typeof translations;
const t = translations[lang];

export function friendsList(friends: Friend[]): string {
  if (!friends || friends.length === 0) {
    return `<div style="padding:32px 0;text-align:center;color:${GRID_COLORS.muted};font-size:16px;letter-spacing:0.5px;">${t.noFriendsAddedYet}</div>`;
  }

  // Pagination: 10 per page, 2 columns
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
    const displayName = f.display_name || f.name || f.username || t.unknown;
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
        <img src="${avatar}" width="56" height="56" class="amazing-avatar" alt="${t.avatarAlt}"/>
        ${teamLogo ? `<img src="${teamLogo}" width="30" height="30" class="amazing-team-logo" alt="${t.teamLogoAlt}"/>` : ''}
        <span class="amazing-status-dot" style="background:${online ? '#4be17b' : '#b6a6ca'};box-shadow:0 0 8px 2px ${online ? '#4be17b88' : '#b6a6ca55'}"></span>
      </div>
      <div class="amazing-friend-info">
        <div class="amazing-friend-name">${displayName}</div>
        <div class="amazing-friend-username">@${username}</div>
      </div>
      <button class="remove-friend-btn amazing-remove-btn" data-action="remove-friend" data-id="${id}" data-friend-id="${id}" data-name="${displayName}" data-friend-name="${displayName}" title="${t.removeFriendTitle}">
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
      <div style="font-size:18px;font-weight:600;color:${GRID_COLORS.primary};letter-spacing:0.5px;">${t.yourFriends} <span style="font-size:13px;color:${GRID_COLORS.accent};font-weight:400">(${friends.length})</span></div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button id="friends-prev" style="background:${GRID_COLORS.accent};color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;opacity:${page === 0 ? 0.3 : 1};pointer-events:${page === 0 ? 'none' : 'auto'};transition:opacity 0.2s;" aria-label="${t.prevPage}">&#8592;</button>
        <span style="font-size:13px;color:${GRID_COLORS.primary};font-weight:500;">${page + 1}/${totalPages}</span>
        <button id="friends-next" style="background:${GRID_COLORS.accent};color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;opacity:${page === totalPages - 1 ? 0.3 : 1};pointer-events:${page === totalPages - 1 ? 'none' : 'auto'};transition:opacity 0.2s;" aria-label="${t.nextPage}">&#8594;</button>
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
  </div>
  <!-- Navigation controlled by event delegation in profile.ts -->
  `;
}
