import { state } from './state.js';
import { loadMatchesWithPagination } from './api.js';
import { historyList, historyDetailed, historyAnalysis } from './templates.js';
import { renderAllCharts } from './charts.js';
import { Match } from './types.js';
import { translations } from '../language/translations.js';

// ✅ Determine language and translation object
const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export async function loadMoreMatches(): Promise<Match[]> {
	if (state.matchPagination.isLoadingMore || !state.matchPagination.hasMoreMatches) {
		return [];
	}

	state.matchPagination.isLoadingMore = true;

	const loadMoreBtn = document.getElementById('load-more-btn') as HTMLButtonElement;
	if (loadMoreBtn) {
		loadMoreBtn.disabled = true;
		loadMoreBtn.textContent = `⏳ ${t.loadingMoreMatches}`;
	}

	try {
		const nextPage = state.matchPagination.currentPage + 1;
		const result = await loadMatchesWithPagination(nextPage, 10);

		if (result.matches.length > 0) {
			state.matchPagination.currentPage = nextPage;
			state.matchPagination.hasMoreMatches = result.hasMore;
			state.matchPagination.totalMatches = result.totalCount;

			appendMatches(result.matches);

			return result.matches;
		}

		state.matchPagination.hasMoreMatches = false;
		return [];
	} catch (error) {
		console.error('Error loading more matches:', error);
		return [];
	} finally {
		state.matchPagination.isLoadingMore = false;

		if (loadMoreBtn) {
			loadMoreBtn.disabled = false;
			if (state.matchPagination.hasMoreMatches) {
				loadMoreBtn.textContent = `📄 ${t.loadMoreMatches}`;
			} else {
				loadMoreBtn.textContent = `✅ ${t.allMatchesLoaded}`;
				loadMoreBtn.disabled = true;
			}
		}
	}
}

export function appendMatches(newMatches: Match[]): void {
	if (!newMatches || newMatches.length === 0) return;

	state.history = [...state.history, ...newMatches];

	const currentView = state.activeHistoryView;
	const historyContentEl = document.getElementById('history-content-inner');
	if (!historyContentEl) return;

	switch (currentView) {
		case 'list':
			appendToHistoryList(newMatches);
			break;
		case 'detailed':
			appendToHistoryDetailed(newMatches);
			break;
		case 'analysis':
			rerenderAnalysisView();
			break;
	}

	setTimeout(() => {
		try {
			renderAllCharts();
		} catch (e) {
			console.log('Chart update error', e);
		}
	}, 100);
}

function appendToHistoryList(newMatches: Match[]): void {
	const historyContentEl = document.getElementById('history-content-inner');
	if (!historyContentEl) return;

	let matchesContainer = historyContentEl.querySelector('.matches-container');
	if (!matchesContainer) {
		historyContentEl.innerHTML = historyList(state.history);
		return;
	}

	const newMatchesHtml = newMatches.map(m => {
		const isWin = m.result === 'win';
		const diff = Math.abs(m.user_score - m.opponent_score);
		const type = diff <= 2 ? { label: t.matchTypeNailBiter, color: '#dc3545' }
			: diff <= 5 ? { label: t.matchTypeClose, color: '#ffc107' }
				: diff <= 10 ? { label: t.matchTypeCompetitive, color: '#17a2b8' }
					: { label: t.matchTypeDominant, color: '#28a745' };

		return `
	<div style="padding:15px;border-bottom:1px solid #f1f3f4;display:flex;align-items:center;gap:15px">
		<div style="width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${isWin ? '#28a745' : '#dc3545'};color:#fff;font-weight:bold;font-size:18px">
		${isWin ? '🏆' : '❌'}
		</div>
		<div style="flex:1">
		<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
			<span style="font-weight:bold;color:#333">${t.vsPlayer} ${m.opponent_id}</span>
			<span style="background:${type.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold">${type.label}</span>
		</div>
		<div style="font-size:13px;color:#666">${new Date(m.date_played).toLocaleDateString()} • ${new Date(m.date_played).toLocaleTimeString()}</div>
		</div>
		<div style="text-align:right">
		<div style="font-family:monospace;font-size:18px;font-weight:bold;color:#333">${m.user_score} - ${m.opponent_score}</div>
		<div style="font-size:12px;color:${isWin ? '#28a745' : '#dc3545'};font-weight:bold">${isWin ? t.victory : t.defeat}</div>
		</div>
		<div style="text-align:center;min-width:60px">
		<div style="font-size:14px;color:#666">⏱️</div>
		<div style="font-size:12px;color:#666">${m.duration || t.notAvailable}</div>
		</div>
	</div>`;
	}).join('');

	matchesContainer.insertAdjacentHTML('beforeend', newMatchesHtml);
}

function appendToHistoryDetailed(newMatches: Match[]): void {
	const historyContentEl = document.getElementById('history-content-inner');
	if (!historyContentEl) return;

	let filteredMatches = historyContentEl.querySelector('#filtered-matches');
	if (!filteredMatches) {
		historyContentEl.innerHTML = historyDetailed(state.history);
		return;
	}

	const startIndex = state.history.length - newMatches.length;
	const newMatchesHtml = newMatches.map((m, idx) => `
	<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);border-left:5px solid ${m.result === 'win' ? '#28a745' : '#dc3545'}">
	<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
		<div style="display:flex;align-items:center;gap:12px">
		<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${m.result === 'win' ? '#28a745' : '#dc3545'};color:#fff;font-size:16px">
			${m.result === 'win' ? '🏆' : '❌'}
		</div>
		<div>
			<h4 style="margin:0;color:#333">${t.matchLabel} #${startIndex + idx + 1}</h4>
			<div style="font-size:13px;color:#666">${new Date(m.date_played).toLocaleString()}</div>
		</div>
		</div>
		<div style="text-align:right">
		<div style="font-family:monospace;font-size:24px;font-weight:bold;color:#333">${m.user_score} - ${m.opponent_score}</div>
		<div style="font-size:12px;color:${m.result === 'win' ? '#28a745' : '#dc3545'};font-weight:bold">${m.result === 'win' ? t.victory : t.defeat}</div>
		</div>
	</div>
	</div>
`).join('');

	filteredMatches.insertAdjacentHTML('beforeend', newMatchesHtml);
}

function rerenderAnalysisView(): void {
	const historyContentEl = document.getElementById('history-content-inner');
	if (!historyContentEl) return;

	historyContentEl.innerHTML = historyAnalysis(state.history);

	renderAllCharts();
}

export function setupHistoryEvents(container: HTMLElement) {
	container.addEventListener('click', async (e) => {
		const t = e.target as HTMLElement;
		const id = t.id;

		if (id === 'load-more-btn') {
			await loadMoreMatches();
			return;
		}

		if (id === 'load-more-matches') {
			state.historyPage = (state.historyPage || 1) + 1;
			const moreMatches = await loadMoreMatches();
			appendMatches(moreMatches);
			return;
		}
	});
}
