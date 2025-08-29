// renderProfilePage/state.ts - FIXED VERSION
import { DEFAULT_STATS, Friend, HistoryView, Match, Profile, Stats, StatsTab } from './types.js';

export const state: {
	token: string;
	profile?: Profile;
	stats: Stats;
	history: Match[];
	friends: Friend[];
	editMode: boolean;
	activeStatsTab: StatsTab;
	activeHistoryView: HistoryView;
	historyPage?: number; // FIX: Add pagination support
	onBadgeUpdate?: () => void;
	container?: HTMLElement;
	matchPagination: {
		currentPage: number;
		totalMatches: number;
		hasMoreMatches: boolean;
		isLoadingMore: boolean;
	};
	outgoingFriendRequests: { username: string }[];
} = {
	token: '',
	stats: DEFAULT_STATS,
	history: [],
	friends: [],
	editMode: false,
	activeStatsTab: 'overview',
	activeHistoryView: 'list',
	historyPage: 1,
	matchPagination: {
		currentPage: 0,
		totalMatches: 0,
		hasMoreMatches: true,
		isLoadingMore: false
	},
	outgoingFriendRequests: []
};
