// renderProfilePage/charts.ts
import { state } from './state.js';

export function renderWinRateChart() {
  const canvas = document.getElementById('winRateChart') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const winRate = (state.stats.win_rate || 0) * 100;

  const cx = canvas.width / 2, cy = canvas.height / 2, r = 60, ir = 35;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, (winRate / 100) * 2 * Math.PI);
  ctx.arc(cx, cy, ir, (winRate / 100) * 2 * Math.PI, 0, true);
  ctx.fillStyle = '#28a745'; ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, (winRate / 100) * 2 * Math.PI, 2 * Math.PI);
  ctx.arc(cx, cy, ir, 2 * Math.PI, (winRate / 100) * 2 * Math.PI, true);
  ctx.fillStyle = '#dc3545'; ctx.fill();

  ctx.fillStyle = '#333'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
  ctx.fillText(`${winRate.toFixed(1)}%`, cx, cy + 5);
}

export function renderPerformanceChart() {
  const canvas = document.getElementById('performanceChart') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const matches = state.history.slice(-10).reverse();
  if (!matches.length) return;
  const barW = canvas.width / matches.length - 5;
  const maxScore = Math.max(...matches.map(m => m.user_score), 20);
  matches.forEach((m, i) => {
    const h = (m.user_score / maxScore) * (canvas.height - 40);
    const x = i * (barW + 5), y = canvas.height - h - 20;
    ctx.fillStyle = m.result === 'win' ? '#28a745' : '#dc3545';
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#333'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(String(m.user_score), x + barW / 2, canvas.height - 5);
  });
}

export function renderScoreDistribution() {
  const canvas = document.getElementById('scoreDistribution') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scores = state.history.map(m => m.user_score);
  if (!scores.length) return;
  const buckets = Array(6).fill(0);
  for (const s of scores) buckets[Math.min(Math.floor(s / 4), 5)]++;
  const maxCount = Math.max(...buckets, 1);
  const barW = canvas.width / buckets.length - 5;
  buckets.forEach((count, i) => {
    const h = (count / maxCount) * (canvas.height - 40);
    const x = i * (barW + 5), y = canvas.height - h - 20;
    ctx.fillStyle = '#17a2b8'; ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#333'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
    const label = i === 5 ? '20+' : `${i * 4}-${i * 4 + 3}`; ctx.fillText(label, x + barW / 2, canvas.height - 5);
  });
}

export function renderTimeAnalysisChart() {
  const canvas = document.getElementById('timeAnalysisChart') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const hourly = Array(24).fill(0);
  const wins = Array(24).fill(0);
  for (const m of state.history) {
    const h = new Date(m.date_played).getHours();
    hourly[h]++; if (m.result === 'win') wins[h]++;
  }
  const max = Math.max(...hourly, 1);
  const barW = canvas.width / 24 - 1;
  for (let h = 0; h < 24; h++) {
    const games = hourly[h]; const rate = games ? wins[h] / games : 0;
    const bh = (games / max) * (canvas.height - 30);
    const x = h * (barW + 1), y = canvas.height - bh - 20;
    const g = Math.floor(rate * 255), r = Math.floor((1 - rate) * 255);
    ctx.fillStyle = `rgb(${r},${g},0)`; ctx.fillRect(x, y, barW, bh);
    if (h % 4 === 0) {
      ctx.fillStyle = '#666'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
      ctx.fillText(`${h}h`, x + barW / 2, canvas.height - 5);
    }
  }
}

export function renderTrendsChart() {
  const canvas = document.getElementById('trendsChart') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40, cw = canvas.width - 2 * padding, ch = canvas.height - 2 * padding;
  if (state.history.length < 2) {
    ctx.fillStyle = '#666'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
    ctx.fillText('Not enough data for trend analysis', canvas.width / 2, canvas.height / 2);
    return;
  }
  const trend: Array<{ x: number; y: number }> = [];
  let wins = 0;
  state.history.forEach((m, i) => {
    if (m.result === 'win') wins++;
    const wr = (wins / (i + 1)) * 100;
    trend.push({ x: padding + (i / (state.history.length - 1)) * cw, y: padding + (1 - wr / 100) * ch });
  });
  ctx.strokeStyle = '#007bff'; ctx.lineWidth = 2; ctx.beginPath();
  trend.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.fillStyle = '#666'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
  ctx.fillText('100%', 5, padding + 10); ctx.fillText('0%', 5, padding + ch);
}

export function renderWeeklyChart() {
  const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const now = new Date();
  const weeks = Array.from({ length: 4 }, (_, idx) => {
    const i = 3 - idx;
    const start = new Date(now); start.setDate(now.getDate() - (i + 1) * 7);
    const end = new Date(now); end.setDate(now.getDate() - i * 7);
    const matches = state.history.filter(m => {
      const d = new Date(m.date_played);
      return d >= start && d < end;
    });
    const wins = matches.filter(m => m.result === 'win').length;
    return { label: `Week ${idx + 1}`, games: matches.length, wins };
  });

  if (weeks.every(w => w.games === 0)) {
    ctx.fillStyle = '#666'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('No matches in last 4 weeks', canvas.width / 2, canvas.height / 2);
    return;
  }

  const barW = canvas.width / weeks.length - 10;
  const max = Math.max(...weeks.map(w => w.games), 1);
  weeks.forEach((w, i) => {
    const h = (w.games / max) * (canvas.height - 40);
    const x = i * (barW + 10) + 5, y = canvas.height - h - 20;
    ctx.fillStyle = '#007bff'; ctx.fillRect(x, y, barW * 0.6, h);
    const wh = (w.wins / max) * (canvas.height - 40);
    ctx.fillStyle = '#28a745'; ctx.fillRect(x + barW * 0.4, canvas.height - wh - 20, barW * 0.6, wh);
    ctx.fillStyle = '#333'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(w.label, x + barW / 2, canvas.height - 5);
  });
}

export function renderActivityHeatmap() {
  const canvas = document.getElementById('activityHeatmap') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Real activity based on matches in last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const counts = days.map(day => {
    const next = new Date(day); next.setDate(day.getDate() + 1);
    return state.history.filter(m => {
      const d = new Date(m.date_played);
      return d >= day && d < next;
    }).length;
  });
  const max = Math.max(...counts, 1);
  const cw = canvas.width / 7, ch = canvas.height;

  counts.forEach((c, i) => {
    const alpha = c ? (0.2 + 0.8 * (c / max)) : 0.1;
    ctx.fillStyle = `rgba(40,167,69,${alpha})`;
    ctx.fillRect(i * cw, 0, cw - 2, ch - 18);
    const label = days[i].toLocaleDateString(undefined, { weekday: 'short' });
    ctx.fillStyle = '#333'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
    ctx.fillText(label, i * cw + cw / 2, ch - 4);
  });
}

export function renderAllCharts() {
  // Delay to let DOM mount
  setTimeout(() => {
    try {
      renderWinRateChart();
      renderPerformanceChart();
      renderScoreDistribution();
      renderTimeAnalysisChart();
      renderTrendsChart();
      renderWeeklyChart();
      renderActivityHeatmap();
    } catch (e) {
      console.log('Chart error', e);
    }
  }, 50);
}