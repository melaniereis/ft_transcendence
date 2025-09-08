// renderProfile/stats.ts
import { Match, Stats } from './types.js';
import { GRID_COLORS, svgMedalGold, svgTrendIcon, svgBarChartIcon, svgFlameIcon, svgChartIcon, svgClockIcon, svgStarIcon } from './constants.js';
import {
	averageScore, bestPerformance, consistencyScore, bestPlayingDay, clutchFactor, currentMomentum,
	dominanceRating, efficiencyScore, gamesThisWeek, longestWinStreak, mostActiveTime, opponentAnalysis
} from './metrics.js';

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
