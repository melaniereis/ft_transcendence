import { Friend, Match, Profile, Stats } from './types.js';
import { GRID_COLORS, svgUserIcon, svgFriendsIcon, svgBarChartIcon, svgMedalGold, svgOpponentIcon, svgChartIcon, svgFlameIcon, svgStarIcon } from './constants.js';
import { header } from './header.js';
import { friendsList } from './friends.js';
import { historyList, historyDetailed, historyAnalysis } from './history.js';
import { statsOverview, statsPerformance, statsTrends } from './stats.js';
import { modals } from './modals.js';
import { translations } from '../language/translations.js';

const lang = (['en','es','pt'].includes(localStorage.getItem('preferredLanguage') || '') 
    ? localStorage.getItem('preferredLanguage') 
    : 'en') as keyof typeof translations;
const t = translations[lang];


export function layout(profile: Profile, stats: Stats, history: Match[], friends: Friend[], statsTab: string, historyView: string, editMode: boolean, mainTab: string): string {
	const responsiveStyles = `
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=EB+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      /* Ensure viewport sizing is stable so background calculations don't jump */
      html, body { height: 100%; margin: 0; padding: 0; }

      /* Fixed, cover background so it does NOT visually change when content height changes */
      body {
        background-image: url('/assets/Background.png');
        background-repeat: no-repeat;
        background-size: cover;           /* scale to cover viewport */
        background-position: center center;
        background-attachment: fixed;     /* <-- key: keep background fixed to viewport */
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

return `
  ${responsiveStyles}
  <div class="petal">
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span>
  </div>
  <main class="gris-main-card">
    <div class="fixed-profile-header" style="background:linear-gradient(120deg,#f4f6fa 60%, #b6a6ca33 100%, #7fc7d933 120%);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 0 32px 0;gap:18px;min-height:100px;border-right:1.5px solid #e3e6f3;">
      <div class="gris-avatar">
        <img src="${profile.avatar_url}" alt="${t.avatarAlt}" />
      </div>
      <div class="gris-username">@${profile.username}</div>
      <div class="gris-quote">${t.gentleHuesQuote}</div>
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
              ${(tab === 'profile' 
                ? `${svgUserIcon()} ${t.tabProfile}` 
                : tab === 'stats' 
                  ? `${svgBarChartIcon()} ${t.tabStatistics}` 
                  : tab === 'history' 
                    ? `${svgMedalGold()} ${t.tabMatchHistory}` 
                    : `${svgOpponentIcon()} ${t.tabFriends}`)}
          </button>`).join('')}
      </div>
      <!-- Tab Panels -->
      <div class="tab-panel" id="profile-panel" style="display:${mainTab === 'profile' ? 'block' : 'none'}">
        <div class="profile-timeline-bg${editMode ? ' edit-mode' : ''}" style="position:relative;min-height:420px;padding:0 0 24px 0;overflow:visible;">
              <form id="profile-edit-form" class="profile-timeline-events${editMode ? ' edit-mode' : ''}" style="margin-top:0;display:flex;flex-direction:column;align-items:center;${editMode ? 'gap:8px;' : 'gap:32px;'}">
              ${!editMode ? `<button id="edit-btn" class="gris-action-btn" title="${t.editProfileBtn}" type="button"
                style="position:absolute;top:0;right:0;margin:12px 18px 0 0;padding:6px 10px;background:#fff6;border:2px solid #7fc7d9;border-radius:50%;box-shadow:0 2px 8px #7fc7d944;cursor:pointer;z-index:99;transition:background 0.18s, box-shadow 0.18s;min-width:unset;width:40px;height:40px;display:flex;align-items:center;justify-content:center;outline:none;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7fc7d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;pointer-events:none;">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>` : ''}
              <style>
                .profile-edit-btn:hover {
                  background: #e6f7fa !important;
                  box-shadow: 0 4px 16px #7fc7d988 !important;
                }
              </style>
              ${editMode ? `
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#7fc7d9 0%,#e6c79c 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #e6c79c55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.2s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgStarIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#e6c79c11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <label for="username-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${t.labelUsername}</label>
                    <input id="username-input" type="text" value="${profile.username}" maxlength="24" placeholder="${t.placeholderUsername}"
                      style="font-size:1.02rem;font-weight:700;color:#23272f;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;margin-bottom:2px;"/>
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">${t.uniqueForLogin}</div>
                    <label for="display-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${t.labelDisplayName}</label>
                    <input id="display-input" type="text" value="${profile.display_name || ''}" maxlength="32" placeholder="${t.placeholderDisplayName}"
                      style="font-size:1.12rem;font-weight:800;color:#23272f;letter-spacing:-1px;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;margin-bottom:2px;"/>
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">${t.nameShownToOthers}</div>
                    <label for="bio-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${t.labelBio}</label>
                    <input id="bio-input" type="text" value="${profile.bio || ''}" maxlength="120" placeholder="${t.placeholderWriteYourStory}"
                      style="font-size:0.98rem;color:#b6a6ca;margin-top:2px;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;"/>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#e6c79c 0%,#7fc7d9 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #7fc7d955,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.5s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgUserIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#7fc7d911 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.joinedPlatform}</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#b6a6ca 0%,#e6c79c 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #b6a6ca55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.8s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFriendsIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#b6a6ca11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.team}</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.team || '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#a3d9b1 0%,#b6a6ca 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #a3d9b155,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 2.1s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgChartIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#a3d9b111 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <label for="email-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${t.labelEmail}</label>
                    <input id="email-input" type="email" value="${profile.email || ''}" placeholder="${t.placeholderEmail}"
                      style="font-size:1.02rem;font-weight:700;color:#23272f;width:100%;background:transparent;border:none;outline:none;padding:2px 6px 2px 0;" />
                    <div style="font-size:0.75rem;font-style:italic;color:#d1d1d1;margin-bottom:4px;">${t.forNotifications}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:18px;margin-bottom:10px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#4be17b 0%,#7fc7d9 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #4be17b55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.3s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFlameIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#4be17b11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.status}</div>
                    <div style="font-size:0.92rem;color:${profile.online_status ? '#4be17b' : '#b6a6ca'};font-weight:600;">${profile.online_status ? t.online : t.offline}</div>
                  </div>
                </div>
                <div style="display:flex;gap:16px;margin-top:24px;margin-bottom:8px;flex-wrap:wrap;justify-content:center;">
                  <button id="avatar-btn" type="button" style="background:#7fc7d9;color:#fff;border:none;padding:10px 20px;border-radius:18px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #7fc7d944;">
                    <span style="vertical-align:middle;">${svgChartIcon()}</span> ${t.editAvatarBtn}
                  </button>
                  <input id="avatar-url-input" type="hidden" value="${profile.avatar_url || ''}" />
                  <button id="pass-btn" type="button" style="background:#e6c79c;color:#fff;border:none;padding:10px 20px;border-radius:18px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #e6c79c44;">
                    <span style="vertical-align:middle;">${svgFlameIcon()}</span> ${t.changePasswordBtn}
                  </button>
                  <button id="save-btn" type="submit" style="background:#00d563;color:#fff;border:none;padding:10px 24px;border-radius:20px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px #00d56344;">
                    <span style="vertical-align:middle;">${svgMedalGold()}</span> ${t.saveBtn}
                  </button>
                  <button id="cancel-btn" type="button" style="background:#9b59b6;color:#fff;border:none;padding:10px 24px;border-radius:20px;cursor:pointer;font-weight:500;font-size:14px;transition:all 0.3s">
                    <span style="vertical-align:middle;">${svgUserIcon()}</span> ${t.cancelBtn}
                  </button>
                  <div id="save-error" style="color:#e84393;font-size:14px;font-weight:500"></div>
                </div>
              ` : `
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#7fc7d9 0%,#e6c79c 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #e6c79c55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.2s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgStarIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#e6c79c11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.12rem;font-weight:800;color:#23272f;letter-spacing:-1px;">${profile.display_name || profile.username}</div>
                    <div style="font-size:0.98rem;color:#b6a6ca;margin-top:2px;">${profile.bio || t.placeholderWriteYourStory}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#e6c79c 0%,#7fc7d9 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #7fc7d955,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.5s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgUserIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#7fc7d911 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.joinedPlatform}</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#b6a6ca 0%,#e6c79c 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #b6a6ca55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.8s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFriendsIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#b6a6ca11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.team}</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.team || '—'}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#a3d9b1 0%,#b6a6ca 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #a3d9b155,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 2.1s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgChartIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#a3d9b111 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.email}</div>
                    <div style="font-size:0.92rem;color:#b6a6ca;">${profile.email || t.notProvided}</div>
                  </div>
                </div>
                <div class="timeline-event" style="position:relative;width:100%;max-width:380px;display:flex;align-items:center;gap:14px;">
                  <div class="timeline-dot-glow" style="width:32px;height:32px;background:radial-gradient(circle,#4be17b 0%,#7fc7d9 80%,#fff0 100%);
                    border-radius:50%;box-shadow:0 0 16px 4px #4be17b55,0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:dotPulse 1.3s infinite alternate;">
                    <span style="display:block;width:22px;height:22px;">${svgFlameIcon()}</span>
                  </div>
                  <div style="background:linear-gradient(90deg,#fff 80%,#4be17b11 100%);border-radius:14px;padding:12px 18px;box-shadow:0 2px 8px #b6a6ca22;flex:1;">
                    <div style="font-size:1.02rem;font-weight:700;color:#23272f;">${t.status}</div>
                    <div style="font-size:0.92rem;color:${profile.online_status ? '#4be17b' : '#b6a6ca'};font-weight:600;">${profile.online_status ? t.online : t.offline}</div>
                  </div>
                </div>
              `}
            </form>
        </div>
      </div>
      <div class="tab-panel" id="stats-panel" style="display:${mainTab === 'stats' ? 'block' : 'none'}">
        <div class="gris-section" id="stats-section">
          <div class="gris-section-title">${t.statistics}</div>
          <div class="gris-section-content" id="stats-content">
            <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;flex-wrap:wrap">
              <button class="stats-tab gris-action-btn" data-tab="overview" type="button" style="background:${statsTab === 'overview' ? '#7fc7d9' : '#b6a6ca'}">${t.overview}</button>
              <button class="stats-tab gris-action-btn" data-tab="performance" type="button" style="background:${statsTab === 'performance' ? '#7fc7d9' : '#b6a6ca'}">${t.performance}</button>
              <button class="stats-tab gris-action-btn" data-tab="trends" type="button" style="background:${statsTab === 'trends' ? '#7fc7d9' : '#b6a6ca'}">${t.trends}</button>
            </div>
            <div id="stats-content-inner">${t.loadingStats}</div>
          </div>
        </div>
      </div>
      <div class="tab-panel" id="history-panel" style="display:${mainTab === 'history' ? 'block' : 'none'}">
        <div class="gris-section" id="history-section">
          <div class="gris-section-title">${t.matchHistory}</div>
          <div class="gris-section-content" id="history-content">
            <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;flex-wrap:wrap">
              <button class="history-tab gris-action-btn" data-view="list" type="button" style="background:${historyView === 'list' ? '#7fc7d9' : '#b6a6ca'}">${t.list}</button>
              <button class="history-tab gris-action-btn" data-view="detailed" type="button" style="background:${historyView === 'detailed' ? '#7fc7d9' : '#b6a6ca'}">${t.detailed}</button>
              <button class="history-tab gris-action-btn" data-view="analysis" type="button" style="background:${historyView === 'analysis' ? '#7fc7d9' : '#b6a6ca'}">${t.analysis}</button>
            </div>
            <div id="history-content-inner">${t.loadingHistory}</div>
          </div>
        </div>
      </div>
      <div class="tab-panel" id="friends-panel" style="display:${mainTab === 'friends' ? 'block' : 'none'}">
        <div class="gris-section" id="friends-section">
          <div class="gris-section-title">${t.friends}</div>
          <div class="gris-section-content" id="friends-content">
            <form id="friend-form" style="display:flex;gap:10px;justify-content:flex-start;margin-bottom:10px;flex-wrap:wrap" autocomplete="off">
              <label for="friend-input" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${t.friendUsernameLabel}</label>
              <input id="friend-input" placeholder="${t.friendUsernamePlaceholder}" style="flex:1;min-width:120px;max-width:180px;padding:8px;border:1.5px solid #b6a6ca;border-radius:8px;font-size:15px;background:rgba(255,255,255,0.7);font-family:'EB Garamond',serif;"/>
              <button id="friend-add" class="gris-action-btn" title="${t.addFriendBtn}" type="submit">${t.addFriendBtn}</button>
            </form>
            <div id="friend-msg" style="margin-top:8px;font-size:12px;color:#fff">.</div>
            <div id="friends-container" style="margin:10px 0;text-align:center">${t.loadingFriends}</div>
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