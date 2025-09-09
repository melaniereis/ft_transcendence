// renderProfilePage/render.ts
import { state } from './state.js';
import { layout, statsOverview, statsPerformance, statsTrends, historyList, historyDetailed, historyAnalysis, friendsList } from './templates.js';
import { renderAllCharts } from './charts.js';
import { Match } from './types.js';
import { translations } from '../language/translations.js'

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function render(container: HTMLElement) {
	if (!state.profile) return;
	container.innerHTML = layout(state.profile, state.stats, state.history, state.friends,
	state.activeStatsTab, state.activeHistoryView, state.editMode, state.activeMainTab || 'profile'
	);
	// Always re-attach button events after render
	if (typeof window.setupButtons === 'function') window.setupButtons();

	// Controle de visibilidade dos painéis das tabs principais
	const mainTab = state.activeMainTab || 'profile';
	document.querySelectorAll('.tab-panel').forEach(panel => {
		(panel as HTMLElement).style.display = 'none';
	});
	const activePanel = document.getElementById(mainTab + '-panel');
	if (activePanel) (activePanel as HTMLElement).style.display = 'block';

	// Preencher conteúdo das sub-abas SÓ se a tab principal correspondente estiver ativa
	if (mainTab === 'stats') {
		const statsInner = document.getElementById('stats-content-inner');
		if (statsInner) {
			if (state.activeStatsTab === 'overview') statsInner.innerHTML = statsOverview(state.stats, state.history);
			if (state.activeStatsTab === 'performance') statsInner.innerHTML = statsPerformance(state.stats, state.history);
			if (state.activeStatsTab === 'trends') statsInner.innerHTML = statsTrends(state.stats);
		}
	}
	if (mainTab === 'history') {
		const histInner = document.getElementById('history-content-inner');
		if (histInner) {
			if (state.activeHistoryView === 'list') histInner.innerHTML = historyList(state.history);
			if (state.activeHistoryView === 'detailed') {
				// Persist filter values at module level
				let profileHistoryFilters: { match: string; time: string } = (globalThis as any)._profileHistoryFilters || { match: 'all', time: 'all' };
				(globalThis as any)._profileHistoryFilters = profileHistoryFilters;
				function renderFiltered(matches: Match[]) {
					if (!histInner) return;
					histInner.innerHTML = historyDetailed(matches);
					setTimeout(() => {
						// Restore filter values
						const matchFilterEl = document.getElementById('match-filter') as HTMLSelectElement | null;
						const timeFilterEl = document.getElementById('time-filter') as HTMLSelectElement | null;
						if (matchFilterEl) matchFilterEl.value = profileHistoryFilters.match;
						if (timeFilterEl) timeFilterEl.value = profileHistoryFilters.time;
						const filterBtn = document.querySelector('[data-action="apply-history-filters"]');
						if (filterBtn) {
							filterBtn.addEventListener('click', () => {
								const matchFilter = (document.getElementById('match-filter') as HTMLSelectElement)?.value || 'all';
								const timeFilter = (document.getElementById('time-filter') as HTMLSelectElement)?.value || 'all';
								profileHistoryFilters.match = matchFilter;
								profileHistoryFilters.time = timeFilter;
								(globalThis as any)._profileHistoryFilters = profileHistoryFilters;
								let filtered = [...state.history];
								// Apply match result filter
								if (matchFilter === 'wins') filtered = filtered.filter(m => m.result === 'win');
								else if (matchFilter === 'losses') filtered = filtered.filter(m => m.result === 'loss');
								else if (matchFilter === 'close') filtered = filtered.filter(m => Math.abs(m.user_score - m.opponent_score) <= 2);
								else if (matchFilter === 'blowouts') filtered = filtered.filter(m => Math.abs(m.user_score - m.opponent_score) >= 10);
								// Apply time filter
								if (timeFilter !== 'all') {
									const now = Date.now();
									let cutoff = 0;
									if (timeFilter === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000;
									else if (timeFilter === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000;
									else if (timeFilter === 'quarter') cutoff = now - 90 * 24 * 60 * 60 * 1000;
									filtered = filtered.filter(m => {
										const matchDate = typeof m.date_played === 'string' ? Date.parse(m.date_played) : new Date(m.date_played).getTime();
										return matchDate >= cutoff;
									});
								}
								renderFiltered(filtered);
							});
						}
					}, 0);
				}
				// Use persisted filter values for initial render
				let filtered = [...state.history];
				const matchFilter = profileHistoryFilters.match;
				const timeFilter = profileHistoryFilters.time;
				if (matchFilter === 'wins') filtered = filtered.filter(m => m.result === 'win');
				else if (matchFilter === 'losses') filtered = filtered.filter(m => m.result === 'loss');
				else if (matchFilter === 'close') filtered = filtered.filter(m => Math.abs(m.user_score - m.opponent_score) <= 2);
				else if (matchFilter === 'blowouts') filtered = filtered.filter(m => Math.abs(m.user_score - m.opponent_score) >= 10);
				if (timeFilter !== 'all') {
					const now = Date.now();
					let cutoff = 0;
					if (timeFilter === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000;
					else if (timeFilter === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000;
					else if (timeFilter === 'quarter') cutoff = now - 90 * 24 * 60 * 60 * 1000;
					filtered = filtered.filter(m => {
						const matchDate = typeof m.date_played === 'string' ? Date.parse(m.date_played) : new Date(m.date_played).getTime();
						return matchDate >= cutoff;
					});
				}
				renderFiltered(filtered);
			}
			if (state.activeHistoryView === 'analysis') histInner.innerHTML = historyAnalysis(state.history);
		}
	}
	if (mainTab === 'friends') {
		const friendsContainer = document.getElementById('friends-container');
		if (friendsContainer) {
			friendsContainer.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;">
				<div style="width:48px;height:48px;border:5px solid #eaeaea;border-top:5px solid #b6a6ca;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px;"></div>
				<div style="font-size:18px;color:#b6a6ca;font-weight:500;">${t.loadingFriends}</div>
				<style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
			</div>`;
			setTimeout(() => {
				friendsContainer.innerHTML = friendsList(state.friends);
			}, 350);
		}
	}

	renderAllCharts();
}