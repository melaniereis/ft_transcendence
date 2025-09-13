import { Match } from './types.js';
import { GRID_COLORS, svgChartIcon, svgFlameIcon, svgMedalGold, svgBarChartIcon, svgStarIcon, svgClockIcon, svgTrendIcon, svgOpponentIcon, svgMedalSilver, svgMedalBronze } from './constants.js';
import {bestPlayingDay, currentMomentum, longestWinStreak, mostActiveTime, opponentAnalysis} from './metrics.js';
import { translations } from '../language/translations.js';

const lang = (['en','es','pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function historyList(history: Match[]): string {
const recent = history.slice(0, 5);
if (!recent.length) {
	return `
	<div style="padding:40px;text-align:center;color:${GRID_COLORS.muted};
				background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);border-radius:12px;">
		<div style="font-size:48px;margin-bottom:15px">${svgChartIcon()}</div>
		<h4 style="margin:0 0 10px 0;color:${GRID_COLORS.primary}">${t.noMatchHistory}</h4>
		<p style="margin:0">${t.yourGameHistoryHere}</p>
	</div>
	`;
}
return `
	<div>
	<style>
	/* styles omitted for brevity */
	</style>
	<div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:22px;margin-bottom:28px;z-index:1;position:relative;">
		<div style="background:linear-gradient(135deg,#4be17b 0%,#eafff3 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #4be17b22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
		<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#4be17b;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #4be17b55;">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M6 13l3 3 7-7" stroke="#4be17b" stroke-width="2.5" fill="none"/></svg>
		</span>
		<span style="font-size:32px;font-weight:900;color:#1e7d4b;">${history.filter(m => m.result === 'win').length}</span>
		<span style="font-size:15px;color:#1e7d4b;font-weight:700;letter-spacing:0.5px;">${t.totalWins}</span>
		</div>
		<div style="background:linear-gradient(135deg,#ff5c5c 0%,#ffeaea 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #ff5c5c22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
		<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#ff5c5c;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #ff5c5c55;">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M7 7l8 8M15 7l-8 8" stroke="#ff5c5c" stroke-width="2.5" fill="none"/></svg>
		</span>
		<span style="font-size:32px;font-weight:900;color:#b22222;">${history.filter(m => m.result === 'loss').length}</span>
		<span style="font-size:15px;color:#b22222;font-weight:700;letter-spacing:0.5px;">${t.totalLosses}</span>
		</div>
		<div style="background:linear-gradient(135deg,#7fc7d9 0%,#eafaff 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #7fc7d922;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
		<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#7fc7d9;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #7fc7d955;">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><rect x="6" y="10" width="10" height="2" rx="1" fill="#7fc7d9"/></svg>
		</span>
		<span style="font-size:32px;font-weight:900;color:#1e5c7d;">${history.length}</span>
		<span style="font-size:15px;color:#1e5c7d;font-weight:700;letter-spacing:0.5px;">${t.totalMatches}</span>
		</div>
		<div style="background:linear-gradient(135deg,#e6c79c 0%,#fffbe6 100%);padding:26px 0 18px 0;border-radius:18px;box-shadow:0 4px 18px #e6c79c22;display:flex;flex-direction:column;align-items:center;position:relative;overflow:visible;">
		<span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#e6c79c;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #e6c79c55;">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#fff"/><path d="M11 5v7l5 3" stroke="#e6c79c" stroke-width="2.5" fill="none"/></svg>
		</span>
		<span style="font-size:32px;font-weight:900;color:#b48a1e;">${longestWinStreak(history)}</span>
		<span style="font-size:15px;color:#b48a1e;font-weight:700;letter-spacing:0.5px;">${t.bestStreak}</span>
		</div>
	</div>
	<div style="background:rgba(255,255,255,0.55);border-radius:18px;overflow:hidden;box-shadow:0 8px 32px #b6a6ca22, 0 1.5px 8px #7fc7d933;border:1.5px solid #eaeaea;backdrop-filter:blur(8px) saturate(1.2);">
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px 24px 16px 24px;border-bottom:1px solid ${GRID_COLORS.cool}">
		<h4 style="margin:0;color:${GRID_COLORS.primary};font-size:20px;font-weight:800;letter-spacing:0.2px;">${t.recentMatchesTitle}</h4>
		<p style="margin:5px 0 0 0;color:${GRID_COLORS.muted};font-size:14px">${t.your5MostRecentGames}</p>
		</div>
		<div>
${recent.map((m, index) => {
	const isWin = m.result === 'win';
	const diff = Math.abs(m.user_score - m.opponent_score);
	const opponentDisplay = m.opponent_display_name || m.opponent_username || m.opponent_name || `Player ${m.opponent_id}`;
	return `
<div class="amazing-match-card" style="display:flex;align-items:center;gap:16px;padding:13px 0 13px 0;position:relative;min-height:50px;background:linear-gradient(90deg,rgba(255,255,255,0.13) 60%,rgba(76,225,123,0.09) 100%);border-radius:14px;box-shadow:0 2px 12px #b6a6ca22;">
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
		<span style="font-size:17px;font-weight:900;color:${isWin ? '#4be17b' : '#ff5c5c'};letter-spacing:0.5px;">${isWin ? t.winLabel : t.lossLabel}</span>
	</div>
	<div class="match-separator"></div>
	</div>
`;
}).join('')}
		</div>
	</div>
	`;
}

export function historyDetailed(history: Match[]): string {
return `
	<div>
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:15px;border-radius:8px;margin-bottom:20px;">
		<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
			<label style="font-weight:bold;color:${GRID_COLORS.primary}">${t.filterLabel}</label>
			<select id="match-filter" style="padding:6px 12px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;background:${GRID_COLORS.bg}">
			<option value="all">${t.allMatches}</option>
			<option value="wins">${t.winsOnly}</option>
			<option value="losses">${t.lossesOnly}</option>
			<option value="close">${t.closeGames}</option>
			<option value="blowouts">${t.decisiveWins}</option>
			</select>
			<select id="time-filter" style="padding:6px 12px;border:1px solid ${GRID_COLORS.cool};border-radius:4px;background:${GRID_COLORS.bg}">
			<option value="all">${t.allTime}</option>
			<option value="week">${t.thisWeek}</option>
			<option value="month">${t.thisMonth}</option>
			<option value="quarter">${t.last3Months}</option>
			</select>
			<button data-action="apply-history-filters" style="background:${GRID_COLORS.cool};color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">${svgTrendIcon()} ${t.apply}</button>
		</div>
		</div>
		<div id="filtered-matches" style="display:grid;gap:22px">
${history.length === 0
	? `<div style="padding:40px 0;text-align:center;color:${GRID_COLORS.muted};font-size:20px;font-weight:600;">${t.noMatchesForFilter}</div>`
	: history.map((m, idx) => {
		const isWin = m.result === 'win';
		const diff = Math.abs(m.user_score - m.opponent_score);
		const matchType = diff <= 2 ? t.matchTypeNailBiter : diff <= 5 ? t.matchTypeClose : diff <= 10 ? t.matchTypeCompetitive : t.matchTypeDominant;
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
			${isWin ? svgMedalGold() + ` ${t.winLabel}` : svgFlameIcon() + ` ${t.lossLabel}`}
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
		<span style="font-size:14px;color:${GRID_COLORS.muted};">${t.scoreDiffLabel}</span>
		<span style="font-size:17px;font-weight:900;color:${barColor};">${isWin ? '+' : '-'}${diff}</span>
		</div>
	</div>
	`;
	}).join('')}
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
			${t.matchPerformanceAnalysis}
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
			${t.performancePatterns}
			</h4>
${[
	{ label: t.bestDay, value: bestPlayingDay(history), desc: t.highestWinRate, color: GRID_COLORS.success, icon: svgStarIcon() },
	{ label: t.preferredTime, value: mostActiveTime(history), desc: t.mostActivePeriod, color: GRID_COLORS.cool, icon: svgClockIcon() },
	{ label: t.momentum, value: currentMomentum(history), desc: t.recentTrend, color: GRID_COLORS.cool, icon: svgTrendIcon() },
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
			${t.opponentAnalysis}
			</h4>
${opponentAnalysis(history).map((o, i) => {
	const medal = i === 0 ? svgMedalGold() : i === 1 ? svgMedalSilver() : i === 2 ? svgMedalBronze() : '';
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
