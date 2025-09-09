import { Profile } from './types.js';
import { GRID_COLORS, TEAM_LOGOS, svgChartIcon } from './constants.js';
import { translations } from '../language/translations.js'; // ✅ Added for localization

// ✅ Determine language and translation object
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

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
		<span style="color:white;font-size:14px;font-weight:600">${svgChartIcon()} ${t.change}</span>
		</div>
	</div>
	<div style="margin-top:15px">
		<button id="avatar-btn" type="button"
				style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:8px 16px;
					border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;
					transition:all 0.3s;box-shadow:0 4px 12px rgba(0,174,239,0.3)">
		${svgChartIcon()} ${t.chooseAvatar}
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
			<h3 style="margin:0;color:${GRID_COLORS.primary};font-size:28px;font-weight:700">@${profile.username}</h3>
		</div>
		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-bottom:20px">
			<div style="display:flex;align-items:center;gap:8px">
			<span style="font-weight:600;color:${GRID_COLORS.primary}">${t.displayName}:</span>
			<span style="color:${GRID_COLORS.muted}">${profile.display_name || profile.name || '—'}</span>
			</div>
			<div><span style="font-weight:600;color:${GRID_COLORS.primary}">${t.email}:</span> <span style="color:${GRID_COLORS.muted}">${profile.email || t.notProvided}</span></div>
			<div style="display:flex;align-items:center;gap:8px">
			<span style="font-weight:600;color:${GRID_COLORS.primary}">${t.team}:</span>
			<div style="display:flex;align-items:center;gap:8px">
				<span style="color:${GRID_COLORS.muted}">${profile.team || '—'}</span>
			</div>
			</div>
			<div><span style="font-weight:600;color:${GRID_COLORS.primary}">${t.memberSince}:</span> <span style="color:${GRID_COLORS.muted}">${createdAtText}</span></div>
		</div>
		<div style="font-size:14px;color:${GRID_COLORS.muted};padding:12px;background:rgba(0,174,239,0.1);border-radius:8px">
			<span style="font-weight:600;color:${GRID_COLORS.primary}">${t.status}:</span> ${profile.online_status
			? '<svg width="16" height="16" style="vertical-align:middle;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4be17b" stroke="#fff" stroke-width="2"/></svg> ' + t.online
			: '<svg width="16" height="16" style="vertical-align:middle;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#b6a6ca" stroke="#fff" stroke-width="2"/></svg> ' + t.offline} •
					<span style="font-weight:600;color:${GRID_COLORS.primary}">${t.lastSeen}:</span> ${profile.last_seen ? new Date(profile.last_seen).toLocaleString().substring(0, 10) : '—'}
				</div>
				</div>
			</div>
			</div>`;
}