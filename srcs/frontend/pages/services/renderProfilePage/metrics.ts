// renderProfilePage/metrics.ts
import { Match, Stats } from './types.js';

export function averageScore(history: Match[]): number {
	if (!history.length) return 0;
	const total = history.reduce((s, m) => s + m.user_score, 0);
	return total / history.length;
}

export function longestWinStreak(history: Match[]): number {
	let max = 0, cur = 0;
	for (const m of history) {
		if (m.result === 'win') { cur++; max = Math.max(max, cur); } else { cur = 0; }
	}
	return max;
}

export function consistencyScore(history: Match[]): number {
	if (!history.length) return 0;
	const scores = history.map(m => m.user_score);
	const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
	if (avg <= 0) return 0;
	const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
	const std = Math.sqrt(variance);
	return Math.max(0, Math.floor(100 - (std / avg) * 100));
}

export function clutchFactor(history: Match[]): number {
	const close = history.filter(m => Math.abs(m.user_score - m.opponent_score) <= 3);
	if (!close.length) return 0;
	const wins = close.filter(m => m.result === 'win').length;
	return Math.floor((wins / close.length) * 100);
}

export function dominanceRating(history: Match[]): number {
	if (!history.length) return 0;
	const domWins = history.filter(m => m.result === 'win' && (m.user_score - m.opponent_score) >= 7).length;
	return Math.floor((domWins / history.length) * 100);
}

export function comebackWins(history: Match[]): number {
	return history.filter(m =>
		m.result === 'win' && m.user_score > m.opponent_score && m.opponent_score > m.user_score * 0.7
	).length;
}

export function bestPerformance(history: Match[]): { score: number | null, match?: Match } {
	if (!history.length) return { score: null };
	const best = history.reduce((b, c) => (c.user_score > b.user_score ? c : b));
	return { score: best.user_score, match: best };
}

export function gamesThisWeek(history: Match[]): number {
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);
	return history.filter(m => new Date(m.date_played) >= weekAgo).length;
}

export function mostActiveTime(history: Match[]): 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'N/A' {
	if (!history.length) return 'N/A';
	const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
	for (const m of history) {
		const h = new Date(m.date_played).getHours();
		if (h >= 6 && h < 12) buckets.morning++;
		else if (h >= 12 && h < 18) buckets.afternoon++;
		else if (h >= 18 && h < 24) buckets.evening++;
		else buckets.night++;
	}
	const arr = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
	const key = (arr[0]?.[0] ?? 'morning') as keyof typeof buckets;
	return key.charAt(0).toUpperCase() + key.slice(1) as any;
}

export function bestPlayingDay(history: Match[]): string {
	if (!history.length) return 'N/A';
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayStats: Record<string, { wins: number; total: number }> = {};
	for (const m of history) {
		const d = days[new Date(m.date_played).getDay()];
		dayStats[d] ??= { wins: 0, total: 0 };
		dayStats[d].total++;
		if (m.result === 'win') dayStats[d].wins++;
	}
	const best = Object.entries(dayStats)
		.map(([day, s]) => ({ day, rate: s.total ? s.wins / s.total : 0 }))
		.sort((a, b) => b.rate - a.rate)[0];
	return best?.day ?? 'N/A';
}

export function currentMomentum(history: Match[]): 'Hot Streak' | 'Positive' | 'Stable' | 'Recovery Mode' | 'Building' {
	if (history.length < 5) return 'Building';
	const recent = history.slice(-5);
	const wins = recent.filter(m => m.result === 'win').length;
	if (wins >= 4) return 'Hot Streak';
	if (wins >= 3) return 'Positive';
	if (wins === 2) return 'Stable';
	return 'Recovery Mode';
}

export function efficiencyScore(stats: Stats): number {
	if (!stats.matches_played) return 0;
	return (stats.points_scored / stats.matches_played) / 2.5;
}

export function opponentAnalysis(history: Match[]): Array<{
	id: string; matches: number; winRate: number; record: string; display?: string
}> {
	const opp: Record<string, { wins: number; total: number; display?: string }> = {};
	for (const m of history) {
		const id = m.opponent_id;
		const display = m.opponent_display_name || m.opponent_username || m.opponent_name || `Player ${id}`;
		opp[id] ??= { wins: 0, total: 0, display };
		opp[id].total++;
		if (m.result === 'win') opp[id].wins++;
		// Always prefer a more descriptive display name if found later
		if (display && (!opp[id].display || opp[id].display.startsWith('Player '))) opp[id].display = display;
	}
	return Object.entries(opp)
		.map(([id, d]) => ({ id, matches: d.total, winRate: Math.floor((d.wins / d.total) * 100), record: `${d.wins}W-${d.total - d.wins}L`, display: d.display }))
		.sort((a, b) => b.matches - a.matches)
		.slice(0, 5);
}
