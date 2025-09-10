import { Match, Stats } from './types.js';
import { translations } from '../language/translations.js';
import { GRID_COLORS, svgMedalGold, svgTrendIcon, svgBarChartIcon, svgFlameIcon, svgChartIcon, svgClockIcon } from './constants.js';
import {averageScore, bestPerformance, consistencyScore, clutchFactor, dominanceRating, efficiencyScore, 
gamesThisWeek, longestWinStreak, mostActiveTime,} from './metrics.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

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
			{ label: t.totalMatches, value: stats.matches_played, color: GRID_COLORS.cool, icon: svgChartIcon(), sub: t.gamesPlayed },
			{ label: t.winRate, value: `${wr}%`, color: parseFloat(wr) >= 50 ? GRID_COLORS.success : GRID_COLORS.accent, icon: svgMedalGold(), sub: `${stats.matches_won}W / ${stats.matches_lost}L` },
			{ label: t.scoreRatio, value: kd, color: parseFloat(kd) >= 1 ? GRID_COLORS.success : GRID_COLORS.warm, icon: svgTrendIcon(), sub: t.scoredConceded },
			{ label: t.tournamentsWon, value: stats.tournaments_won || 0, color: GRID_COLORS.warm, icon: svgMedalGold(), sub: t.titles }
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
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>${svgBarChartIcon()}</span> ${t.scoringStatistics}</h4>
		<div>
${[
			[t.totalPointsScored, `<strong style="color:${GRID_COLORS.success}">${stats.points_scored}</strong>`],
			[t.totalPointsConceded, `<strong style="color:${GRID_COLORS.accent}">${stats.points_conceded}</strong>`],
			[t.avgPointsPerMatch, `<strong style="color:${GRID_COLORS.cool}">${avgP}</strong>`],
			[t.avgConcededPerMatch, `<strong style="color:${GRID_COLORS.warm}">${avgC}</strong>`],
		].map(([l, v], i, arr) => `
			<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;${i < arr.length - 1 ? 'border-bottom:1px solid rgba(0,174,239,0.2)' : ''}">
				<span style="color:${GRID_COLORS.muted}">${l}</span>${v}
			</div>
			`).join('')}
		</div>
		</div>
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary};display:flex;align-items:center;gap:8px"><span>${svgFlameIcon()}</span> ${t.performanceMetrics}</h4>
		<div>
${[
			[t.currentWinStreak, `<strong style="color:${ws > 0 ? GRID_COLORS.success : GRID_COLORS.accent}">${ws}</strong>`],
			[t.bestMatchScore, `<strong style="color:${GRID_COLORS.cool}">${best.score ?? t.na}</strong>`],
			[t.gamesThisWeek, `<strong style="color:${GRID_COLORS.cool}">${gamesThisWeek(history)}</strong>`],
			[t.favoriteTime, `<strong style="color:${GRID_COLORS.cool}">${mostActiveTime(history)}</strong>`],
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
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgBarChartIcon()} ${t.recentMatchScores}</h4>
		<canvas id="performanceChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
		</div>
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgMedalGold()} ${t.performanceRankings}</h4>
${[
	{ label: t.consistency, value: `${cons}%`, desc: t.performanceStability, color: cons >= 70 ? GRID_COLORS.success : cons >= 50 ? GRID_COLORS.warm : GRID_COLORS.accent, icon: svgBarChartIcon() },
	{ label: t.clutchFactor, value: `${clutch}%`, desc: t.closeGameWins, color: clutch >= 60 ? GRID_COLORS.success : GRID_COLORS.warm, icon: svgFlameIcon() },
	{ label: t.dominance, value: `${dom}%`, desc: t.bigMarginWins, color: GRID_COLORS.cool, icon: svgTrendIcon() },
	{ label: t.efficiency, value: eff, desc: t.performancePerMatch, color: GRID_COLORS.accent, icon: svgBarChartIcon() },
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
<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgFlameIcon()} ${t.activityHeatmap} (7 ${t.days})</h4>
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
	{ label: t.winRate, value: `${(stats.win_rate * 100).toFixed(1)}%`, color: GRID_COLORS.success, icon: svgMedalGold(), period: t.current },
	{ label: t.avgScore, value: (stats.matches_played ? (stats.points_scored / stats.matches_played).toFixed(1) : '0'), color: GRID_COLORS.cool, icon: svgBarChartIcon(), period: t.perMatch },
	{ label: t.gamesPerWeek, value: String(gamesThisWeek([])), color: GRID_COLORS.cool, icon: svgChartIcon(), period: t.thisWeek }, /* updated at runtime in index */
].map(ti => `
		<div style="background:linear-gradient(135deg, ${ti.color}15, ${ti.color}05);padding:18px;border-radius:12px;border-left:4px solid ${ti.color};">
			<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
			<span style="font-size:20px">${ti.icon}</span>
			<div style="text-align:right"><div style="font-size:16px;font-weight:bold;color:${ti.color}">${ti.value}</div></div>
			</div>
			<div style="font-size:14px;font-weight:bold;color:${GRID_COLORS.primary}">${ti.label}</div>
			<div style="font-size:12px;color:${GRID_COLORS.muted}">${ti.period}</div>
		</div>
		`).join('')}
	</div>
	<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;margin-bottom:30px;">
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgTrendIcon()} ${t.winRateProgression}</h4>
		<canvas id="trendsChart" width="800" height="300" style="width:100%;height:300px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
	</div>
	<div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgClockIcon()} ${t.weeklyBreakdown}</h4>
		<canvas id="weeklyChart" width="300" height="200" style="width:100%;height:200px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
		</div>
		<div style="background:linear-gradient(135deg, ${GRID_COLORS.cool} 0%, ${GRID_COLORS.bg} 100%);padding:20px;border-radius:12px;">
		<h4 style="margin:0 0 15px 0;color:${GRID_COLORS.primary}">${svgClockIcon()} ${t.timeBasedPerformance}</h4>
		<canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:${GRID_COLORS.bg};border-radius:8px"></canvas>
		</div>
	</div>
	</div>
`;
}
