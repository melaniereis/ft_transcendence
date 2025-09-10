// renderProfilePage/charts.ts
import { state } from './state.js';
import { translations } from '../language/translations.js';
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
  ? localStorage.getItem('preferredLanguage')
  : 'en') as keyof typeof translations;
const t = translations[lang];
/**
 * GRIS-inspired responsive charts with:
 * - HTML legends (accessible, copyable)
 * - Subtle entry animations (bar grow, donut fill, line draw)
 * - Injected custom webfonts (Playfair Display + Inter)
 *
 * Usage: keep canvas elements in your markup with the IDs used below,
 * and optionally provide <div id="${canvasId}-legend"></div> containers
 * (if not present, they will be created and appended after the canvas).
 */

/* ----------------------- Fonts & CSS injection ----------------------- */
function ensureFontsAndStyles() {
	if (!document.getElementById('gris-chart-fonts')) {
		const link = document.createElement('link');
		link.id = 'gris-chart-fonts';
		link.rel = 'stylesheet';
		link.href =
			'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:wght@400;700&display=swap';
		document.head.appendChild(link);
	}

	if (!document.getElementById('gris-chart-styles')) {
		const style = document.createElement('style');
		style.id = 'gris-chart-styles';
		style.innerHTML = `
			.chart-legend {
				font-family: Inter, Arial, sans-serif;
				font-size: 15px;
				color: #2f4f4f;
				display: inline-block;
				background: linear-gradient(120deg, #f4f6fa 60%, #e6c79c18 100%);
				border-radius: 16px;
				border: 2px solid #b6a6ca33;
				padding: 14px 20px 14px 14px;
				box-shadow: 0 10px 36px rgba(112,128,144,0.13), 0 2px 0 #e6c79c22 inset;
				max-width: 99%;
				line-height: 1.4;
				margin-bottom: 12px;
				position: relative;
			}
			.chart-legend ul { list-style: none; padding: 0; margin: 0; display:block; }
			.chart-legend li { display:flex; gap:14px; align-items:center; margin-bottom:10px; transition:transform 0.18s; }
			.chart-legend li:hover { transform: scale(1.05) translateY(-2px); background: #f8f9f8; border-radius: 10px; }
			.chart-legend .swatch {
				width:22px; height:22px; border-radius:7px; flex: 0 0 22px;
				border:2.5px solid #7fc7d9cc;
				box-shadow: 0 0 8px #b6a6ca44, 0 2px 0 #e6c79c22 inset;
				display: flex; align-items: center; justify-content: center;
				margin-right: 2px;
			}
			.chart-legend .label {
				flex: 1 1 auto; word-break: break-word;
				font-size: 16px; font-weight: 600; letter-spacing: 0.01em;
				color: #4b5a6a;
				text-shadow: 0 1px 0 #fff, 0 0.5px 0 #b6a6ca22;
			}
			.chart-legend .muted { color: #6b6f72; font-size: 13px; }
			.chart-title {
				font-family: 'Playfair Display', serif;
				font-size: 1.6em;
				color: #7fc7d9;
				font-weight: 700;
				margin-bottom: 0.2em;
				letter-spacing: 0.01em;
				text-shadow: 0 2px 8px #b6a6ca22;
			}
			.chart-subtitle {
				font-family: Inter, Arial, sans-serif;
				font-size: 1.08em;
				color: #b6a6ca;
				margin-bottom: 0.8em;
				font-weight: 400;
			}
    `;
		document.head.appendChild(style);
	}
}

/* ----------------------- Canvas helpers ----------------------- */

/** Ensure canvas is scaled for DPR and return context + css sizes. */
function setupCanvas(canvas: HTMLCanvasElement) {
	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();
	const cssWidth = Math.max(1, Math.floor(rect.width));
	const cssHeight = Math.max(1, Math.floor(rect.height));

	canvas.width = Math.round(cssWidth * dpr);
	canvas.height = Math.round(cssHeight * dpr);

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2D context not available');

	// Reset transform, scale to CSS pixels (so drawing coordinates = CSS px)
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssWidth, cssHeight);

	return { ctx, cssWidth, cssHeight, dpr };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 6) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

/* ----------------------- HTML Legend (external) ----------------------- */

function renderLegendHTML(canvasId: string, items: Array<{ label: string; swatch?: string }>) {
	ensureFontsAndStyles();

	const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
	if (!canvas) return;
	const existing = document.getElementById(`${canvasId}-legend`) as HTMLElement | null;

	let container: HTMLElement;
	if (existing) {
		container = existing;
	} else {
		container = document.createElement('div');
		container.id = `${canvasId}-legend`;
		container.className = 'chart-legend';
		// place after canvas
		canvas.parentNode?.insertBefore(container, canvas.nextSibling);
	}

	// Build minimal legend list (no SVG, short labels)
	const ul = document.createElement('ul');
	items.forEach((it) => {
		const li = document.createElement('li');
		const sw = document.createElement('span');
		sw.className = 'swatch';
		if (it.swatch && it.swatch.startsWith('gradient:')) {
			sw.style.background = it.swatch.replace(/^gradient:/, '');
		} else {
			sw.style.background = it.swatch ?? '#ccc';
		}
		sw.setAttribute('aria-hidden', 'true');

		const lbl = document.createElement('div');
		lbl.className = 'label';
		// Only show the first word or a very short label
		lbl.innerText = it.label.split(/[—:-]/)[0].trim();

		li.appendChild(sw);
		li.appendChild(lbl);
		ul.appendChild(li);
	});

	// replace content
	container.innerHTML = '';
	container.appendChild(ul);
}

/* ----------------------- Animation manager ----------------------- */
const animHandles = new Map<string, number>();

function cancelAnim(id: string) {
	const h = animHandles.get(id);
	if (h) {
		cancelAnimationFrame(h);
		animHandles.delete(id);
	}
}

function animate(id: string, drawFrame: (progress: number) => void, duration = 700) {
	cancelAnim(id);
	const start = performance.now();
	function frame(t: number) {
		const elapsed = t - start;
		const progress = Math.min(1, Math.max(0, elapsed / duration));
		// ease-out cubic for gentle finish
		const p = 1 - Math.pow(1 - progress, 3);
		drawFrame(p);
		if (progress < 1) {
			animHandles.set(id, requestAnimationFrame(frame));
		} else {
			animHandles.delete(id);
		}
	}
	animHandles.set(id, requestAnimationFrame(frame));
}

/* ----------------------- Chart renderers (with animations) ----------------------- */

export function renderWinRateChart() {
	const canvas = document.getElementById('winRateChart') as HTMLCanvasElement | null;
	if (!canvas) return;
	let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
	try {
		({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
	} catch {
		return;
	}

	const winRate = Math.max(0, Math.min(1, (state.stats.win_rate ?? 0)));
	const cx = cssWidth / 2;
	const cy = cssHeight / 2;
	const r = Math.max(20, Math.min(cssWidth, cssHeight) / 2 - 12);
	const ir = Math.max(8, r - 30);

	// Subtle background gradient
	const bgGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
	bgGrad.addColorStop(0, '#f4f6fa');
	bgGrad.addColorStop(1, '#e6c79c11');

	// Prepare gradients (CSS-like)
	const winGradient = ctx.createRadialGradient(cx, cy, ir / 2, cx, cy, r);
	winGradient.addColorStop(0, '#dbeaf3');
	winGradient.addColorStop(1, '#7b93a4');

	const lossGradient = ctx.createRadialGradient(cx, cy, ir / 2, cx, cy, r);
	lossGradient.addColorStop(0, '#ffdfee');
	lossGradient.addColorStop(1, '#b1715a');

	const id = 'winRateChart';
	cancelAnim(id);

	// Add subtle highlight glow
	function drawGlow(angle: number, radius: number, alpha: number) {
		const x = cx + Math.cos(angle) * radius;
		const y = cy + Math.sin(angle) * radius;
		ctx.save();
		ctx.globalAlpha = alpha * 0.7;
		ctx.beginPath();
		ctx.arc(x, y, 7 + 3 * alpha, 0, 2 * Math.PI);
		ctx.fillStyle = '#e6c79c';
		ctx.shadowColor = '#e6c79c';
		ctx.shadowBlur = 18 * alpha;
		ctx.fill();
		ctx.restore();
	}

	function draw(progress: number) {
		ctx.clearRect(0, 0, cssWidth, cssHeight);
		// background
		ctx.save();
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, cssWidth, cssHeight);
		ctx.restore();

		const animatedWin = winRate * progress;
		const start = -Math.PI / 2;
		const mid = start + animatedWin * 2 * Math.PI;

		// win arc
		ctx.save();
		ctx.shadowColor = '#7fc7d9aa';
		ctx.shadowBlur = 16 * progress;
		ctx.beginPath();
		ctx.arc(cx, cy, r, start, mid, false);
		ctx.arc(cx, cy, ir, mid, start, true);
		ctx.closePath();
		ctx.fillStyle = winGradient;
		ctx.fill();
		ctx.strokeStyle = 'rgba(80,80,80,0.42)';
		ctx.lineWidth = 2.5;
		ctx.stroke();

		// loss arc
		ctx.shadowColor = '#b1715a55';
		ctx.shadowBlur = 8 * progress;
		ctx.beginPath();
		ctx.arc(cx, cy, r, mid, start + 2 * Math.PI, false);
		ctx.arc(cx, cy, ir, start + 2 * Math.PI, mid, true);
		ctx.closePath();
		ctx.fillStyle = lossGradient;
		ctx.fill();
		ctx.stroke();

		// animated highlight glow
		if (progress > 0.7) {
			drawGlow(mid, (r + ir) / 2, (progress - 0.7) * 2);
		}

		// center text
		ctx.shadowColor = 'rgba(60,60,60,0.28)';
		ctx.shadowBlur = 8 * progress;
		ctx.fillStyle = '#2f4f4f';
		ctx.font = `bold ${Math.max(18, Math.round(cssWidth / 15))}px "Playfair Display", serif`;
		ctx.textAlign = 'center';
		ctx.fillText(`${(animatedWin * 100).toFixed(1)}%`, cx, cy + 8);
		ctx.shadowBlur = 0;
		ctx.restore();
	}

	// animate donut fill with bounce
	animate(id, draw, 950);

	// HTML legend
	renderLegendHTML('winRateChart', [
		{ label: 'Wins (your victories)', swatch: '#7b93a4' },
		{ label: 'Losses (your defeats)', swatch: '#b1715a' }
	]);
}

export function renderPerformanceChart() {
const canvas = document.getElementById('performanceChart') as HTMLCanvasElement | null;
if (!canvas) return;
let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
try {
	({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
} catch {
	return;
}

const matches = state.history.slice(-10).reverse();
const paddingBottom = Math.max(22, Math.round(cssHeight * 0.12));
const availableH = cssHeight - paddingBottom - 12;
const barW = Math.max(8, cssWidth / Math.max(1, matches.length) - 10);
const maxScore = Math.max(...matches.map(m => m.user_score), 20);

const id = 'performanceChart';
cancelAnim(id);

function draw(progress: number) {
	ctx.clearRect(0, 0, cssWidth, cssHeight);
	// background
	ctx.save();
	ctx.globalAlpha = 0.7;
	const bgGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
	bgGrad.addColorStop(0, '#f4f6fa');
	bgGrad.addColorStop(1, '#e6c79c11');
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, cssWidth, cssHeight);
	ctx.restore();

	if (!matches.length) {
	ctx.fillStyle = '#696969';
	ctx.font = '16px Inter, Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(t.noRecentMatches, cssWidth / 2, cssHeight / 2);
	return;
	}

	matches.forEach((m, i) => {
	const rawH = (m.user_score / maxScore) * (availableH - 8);
	const h = rawH * progress;
	const x = i * (barW + 10) + 8;
	const y = cssHeight - paddingBottom - h;

	const gradient = ctx.createLinearGradient(x, y, x, y + Math.max(6, h));
	if (m.result === 'win') {
		gradient.addColorStop(0, '#cfeff6');
		gradient.addColorStop(1, '#7b93a4');
	} else {
		gradient.addColorStop(0, '#fff0d6');
		gradient.addColorStop(1, '#b1715a');
	}

	ctx.save();
	ctx.shadowColor = m.result === 'win' ? '#7fc7d9cc' : '#b1715a99';
	ctx.shadowBlur = 18 * progress;
	roundRect(ctx, x, y, barW, h, Math.min(10, barW / 1.3));
	ctx.fillStyle = gradient;
	ctx.fill();
	ctx.strokeStyle = 'rgba(80,80,80,0.22)';
	ctx.lineWidth = 1.5;
	ctx.stroke();
	ctx.shadowBlur = 0;
	ctx.restore();

	// label
	ctx.fillStyle = '#2f4f4f';
	ctx.font = '13px Inter, Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(String(m.user_score), x + barW / 2, cssHeight - 6);
	});
}

animate(id, draw, 800);

renderLegendHTML('performanceChart', [
	{ label: t.winsHighBars, swatch: '#7b93a4' },
	{ label: t.lossesLowBars, swatch: '#b1715a' }
]);
}

export function renderScoreDistribution() {
	const canvas = document.getElementById('scoreDistribution') as HTMLCanvasElement | null;
	if (!canvas) return;
	let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
	try {
		({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
	} catch {
		return;
	}

	const scores = state.history.map(m => m.user_score);
	const buckets = Array(6).fill(0);
	for (const s of scores) buckets[Math.min(Math.floor(s / 4), 5)]++;
	const maxCount = Math.max(...buckets, 1);
	const barW = Math.max(12, cssWidth / buckets.length - 8);

	const id = 'scoreDistribution';
	cancelAnim(id);

	function draw(progress: number) {
		ctx.clearRect(0, 0, cssWidth, cssHeight);

		buckets.forEach((count, i) => {
			const rawH = (count / maxCount) * (cssHeight - 36);
			const h = rawH * progress;
			const x = i * (barW + 8) + 8;
			const y = cssHeight - 26 - h;

			const grad = ctx.createLinearGradient(x, y, x, y + Math.max(6, h));
			grad.addColorStop(0, '#e6e6e8');
			grad.addColorStop(1, '#72818a');

			roundRect(ctx, x, y, barW, h, 4);
			ctx.fillStyle = grad;
			ctx.fill();
			ctx.strokeStyle = 'rgba(80,80,80,0.18)';
			ctx.stroke();

			ctx.fillStyle = '#2f4f4f';
			ctx.font = '12px Inter, Arial, sans-serif';
			ctx.textAlign = 'center';
			const label = i === 5 ? '20+' : `${i * 4}-${i * 4 + 3}`;
			ctx.fillText(label, x + barW / 2, cssHeight - 6);
		});
	}

	animate(id, draw, 650);

	renderLegendHTML('scoreDistribution', [
		{ label: t.scoreFrequency || 'Score frequency (how often)', swatch: '#72818a' }
	]);
}

export function renderTimeAnalysisChart() {
	const canvas = document.getElementById('timeAnalysisChart') as HTMLCanvasElement | null;
	if (!canvas) return;
	let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
	try {
		({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
	} catch {
		return;
	}

	const hourly = Array(24).fill(0);
	const wins = Array(24).fill(0);
	for (const m of state.history) {
		const h = new Date(m.date_played).getHours();
		hourly[h]++;
		if (m.result === 'win') wins[h]++;
	}
	const max = Math.max(...hourly, 1);
	const barW = Math.max(3, cssWidth / 24 - 2);

	const id = 'timeAnalysisChart';
	cancelAnim(id);

	function draw(progress: number) {
		ctx.clearRect(0, 0, cssWidth, cssHeight);

		for (let h = 0; h < 24; h++) {
			const games = hourly[h];
			const rate = games ? wins[h] / games : 0;
			const rawH = (games / max) * (cssHeight - 32);
			const hNow = rawH * progress;
			const x = h * (barW + 2) + 4;
			const y = cssHeight - 26 - hNow;

			const gVal = Math.floor(rate * 180) + 60;
			const rVal = Math.floor((1 - rate) * 180) + 60;
			ctx.fillStyle = `rgb(${rVal},${gVal},130)`;
			roundRect(ctx, x, y, barW, hNow, 3);
			ctx.fill();
			ctx.strokeStyle = 'rgba(80,80,80,0.18)';
			ctx.stroke();

			if (h % 4 === 0) {
				ctx.fillStyle = '#6b6f72';
				ctx.font = '11px Inter, Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`${h}h`, x + barW / 2, cssHeight - 6);
			}
		}
	}

	animate(id, draw, 700);

	renderLegendHTML('timeAnalysisChart', [
		{ label: t.winRateColor || "Win rate (color)", swatch: 'gradient:linear-gradient(90deg,#91c27f,#9aa7b2)' },
		{ label: t.gamesPlayedBarHeight || "Games played (bar height)", swatch: '#9aa7b2' }
	]);
}

export function renderTrendsChart() {
	const canvas = document.getElementById('trendsChart') as HTMLCanvasElement | null;
	if (!canvas) return;
	let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
	try {
		({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
	} catch {
		return;
	}

	const padding = 36;
	const cw = cssWidth - padding * 2;
	const ch = cssHeight - padding * 2;
	if (state.history.length < 2) {
		ctx.fillStyle = '#696969';
		ctx.font = '16px Inter, Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(t.notEnoughDataForTrendAnalysis || 'Not enough data for trend analysis', cssWidth / 2, cssHeight / 2);
		return;
	}

	let winsCount = 0;
	const trend: Array<{ x: number; y: number }> = [];
	state.history.forEach((m, i) => {
		if (m.result === 'win') winsCount++;
		const wr = (winsCount / (i + 1)) * 100;
		trend.push({
			x: padding + (i / (state.history.length - 1)) * cw,
			y: padding + (1 - wr / 100) * ch
		});
	});

	// compute total path length to animate stroke using line dash
	let totalLen = 0;
	for (let i = 1; i < trend.length; i++) {
		const a = trend[i - 1], b = trend[i];
		const dx = b.x - a.x, dy = b.y - a.y;
		totalLen += Math.hypot(dx, dy);
	}
	if (totalLen <= 0) totalLen = 1;

	const id = 'trendsChart';
	cancelAnim(id);

	function draw(progress: number) {
		ctx.clearRect(0, 0, cssWidth, cssHeight);

		// draw area fill + stroke but make stroke draw progressively
		ctx.save();
		// AREA
		ctx.beginPath();
		trend.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
		ctx.lineTo(padding + cw, padding + ch);
		ctx.lineTo(padding, padding + ch);
		ctx.closePath();
		const areaGrad = ctx.createLinearGradient(0, padding, 0, padding + ch);
		areaGrad.addColorStop(0, 'rgba(160,200,215,0.28)');
		areaGrad.addColorStop(1, 'rgba(160,200,215,0.04)');
		ctx.fillStyle = areaGrad;
		ctx.fill();

		// LINE progressive draw via dash offset
		ctx.beginPath();
		trend.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
		ctx.strokeStyle = '#89a9b7';
		ctx.lineWidth = 2.5;
		ctx.setLineDash([totalLen]);
		ctx.lineDashOffset = totalLen * (1 - progress);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();

		// axes labels
		ctx.fillStyle = '#696969';
		ctx.font = '12px Inter, Arial, sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText('100%', 6, padding + 6);
		ctx.fillText('0%', 6, padding + ch);
	}

	animate(id, draw, 900);

	renderLegendHTML('trendsChart', [
		{ label: t.winRateTrendProgression || 'Win-rate trend (progression)', swatch: '#89a9b7' }
	]);
}

export function renderWeeklyChart() {
const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement | null;
if (!canvas) return;
let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
try {
	({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
} catch {
	return;
}

const now = new Date();
const weeks = Array.from({ length: 4 }, (_, idx) => {
	const i = 3 - idx;
	const start = new Date(now);
	start.setDate(now.getDate() - (i + 1) * 7);
	start.setHours(0, 0, 0, 0);
	const end = new Date(now);
	end.setDate(now.getDate() - i * 7);
	end.setHours(0, 0, 0, 0);
	const matches = state.history.filter(m => {
	const d = new Date(m.date_played);
	return d >= start && d < end;
	});
	const winsCount = matches.filter(m => m.result === 'win').length;
	return { label: `${t.weekLabel || 'Week'} ${idx + 1}`, games: matches.length, wins: winsCount };
});

if (weeks.every(w => w.games === 0)) {
	ctx.fillStyle = '#696969';
	ctx.font = '14px Inter, Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(t.noMatchesLast4Weeks || 'No matches in last 4 weeks', cssWidth / 2, cssHeight / 2);
	// still render an empty legend
	renderLegendHTML('weeklyChart', [
	{ label: t.grayTotalGames || 'Gray: Total games', swatch: '#72818a' },
	{ label: t.softBlueWins || 'Soft blue: Wins', swatch: '#7b93a4' }
	]);
	return;
}

const barW = Math.max(18, cssWidth / weeks.length - 22);
const maxGames = Math.max(...weeks.map(w => w.games), 1);

const id = 'weeklyChart';
cancelAnim(id);

function draw(progress: number) {
	ctx.clearRect(0, 0, cssWidth, cssHeight);

	weeks.forEach((w, i) => {
	const totalH = (w.games / maxGames) * (cssHeight - 40) * progress;
	const winH = (w.wins / maxGames) * (cssHeight - 40) * progress;
	const x = i * (barW + 22) + 8;
	const yTotal = cssHeight - 24 - totalH;
	const yWin = cssHeight - 24 - winH;

	// total
	const gGrad = ctx.createLinearGradient(x, yTotal, x, yTotal + Math.max(6, totalH));
	gGrad.addColorStop(0, '#e6e6e6');
	gGrad.addColorStop(1, '#72818a');
	roundRect(ctx, x, yTotal, barW * 0.6, totalH, 6);
	ctx.fillStyle = gGrad;
	ctx.fill();
	ctx.strokeStyle = 'rgba(80,80,80,0.18)';
	ctx.stroke();

	// wins overlay
	const wX = x + barW * 0.4;
	const winsGrad = ctx.createLinearGradient(wX, yWin, wX, cssHeight - 24);
	winsGrad.addColorStop(0, '#dff6fb');
	winsGrad.addColorStop(1, '#7b93a4');
	roundRect(ctx, wX, yWin, barW * 0.6, winH, 6);
	ctx.fillStyle = winsGrad;
	ctx.fill();
	ctx.strokeRect(wX, yWin, barW * 0.6, winH);

	ctx.fillStyle = '#2f4f4f';
	ctx.font = '12px Inter, Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(w.label, x + barW / 2, cssHeight - 6);
	});
}

animate(id, draw, 700);

renderLegendHTML('weeklyChart', [
	{ label: t.gamesTotalPerWeek || 'Games (total per week)', swatch: '#72818a' },
	{ label: t.winsPerWeek || 'Wins (per week)', swatch: '#7b93a4' }
]);
}

export function renderActivityHeatmap() {
	const canvas = document.getElementById('activityHeatmap') as HTMLCanvasElement | null;
	if (!canvas) return;
	let ctx: CanvasRenderingContext2D, cssWidth: number, cssHeight: number;
	try {
		({ ctx, cssWidth, cssHeight } = setupCanvas(canvas));
	} catch {
		return;
	}

	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() - (6 - i));
		return d;
	});
	const counts = days.map(day => {
		const next = new Date(day);
		next.setDate(day.getDate() + 1);
		return state.history.filter(m => {
			const d = new Date(m.date_played);
			return d >= day && d < next;
		}).length;
	});
	const max = Math.max(...counts, 1);
	const cw = Math.max(24, Math.floor(cssWidth / 7));

	const id = 'activityHeatmap';
	cancelAnim(id);

	function draw(progress: number) {
		ctx.clearRect(0, 0, cssWidth, cssHeight);
		counts.forEach((c, i) => {
			const alpha = c ? (0.2 + 0.8 * (c / max)) : 0.08;
			const animatedAlpha = alpha * progress;
			ctx.fillStyle = `rgba(176,196,222,${animatedAlpha})`;
			roundRect(ctx, i * cw + 6, 6, cw - 12, cssHeight - 32, 4);
			ctx.fill();
			ctx.strokeStyle = 'rgba(80,80,80,0.14)';
			ctx.strokeRect(i * cw + 6, 6, cw - 12, cssHeight - 32);

			const label = days[i].toLocaleDateString(undefined, { weekday: 'short' });
			ctx.fillStyle = '#2f4f4f';
			ctx.font = '12px Inter, Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(label, i * cw + cw / 2 + 6, cssHeight - 8);
		});
	}

	animate(id, draw, 650);

	renderLegendHTML('activityHeatmap', [
		{ label: t.activityDarkerMoreGames || 'Activity (darker = more games)',  swatch: '#b0cde6' }
	]);
}

/* ----------------------- Render all + resize handling ----------------------- */
let resizeAttached = false;
const debouncedResize = (function () {
	let t: number | null = null;
	return () => {
		if (t) clearTimeout(t);
		t = window.setTimeout(() => {
			renderAllCharts(); // re-run whole suite
			t = null;
		}, 160);
	};
})();

export function renderAllCharts() {
	// make sure fonts/styles present
	ensureFontsAndStyles();

	// draw each with animations
	try {
		renderWinRateChart();
		renderPerformanceChart();
		renderScoreDistribution();
		renderTimeAnalysisChart();
		renderTrendsChart();
		renderWeeklyChart();
		renderActivityHeatmap();
	} catch (e) {
		// prevent crash if any one chart fails
		// console.error('chart render error', e);
	}

	if (!resizeAttached) {
		window.addEventListener('resize', debouncedResize);
		resizeAttached = true;
	}
}
