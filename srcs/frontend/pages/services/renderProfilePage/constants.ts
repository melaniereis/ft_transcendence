//renderProfilePage/constants.ts
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

export {svgUserIcon, svgFriendsIcon, svgChartIcon, svgFlameIcon, svgBarChartIcon,
svgStarIcon, svgClockIcon, svgTrendIcon, svgOpponentIcon, svgMedalGold,
svgMedalSilver, svgMedalBronze, GRID_COLORS, TEAM_LOGOS 
};