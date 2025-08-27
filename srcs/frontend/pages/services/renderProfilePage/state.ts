// renderProfilePage/state.ts

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
  onBadgeUpdate?: () => void;
  container?: HTMLElement;
} = {
  token: '',
  stats: DEFAULT_STATS,
  history: [],
  friends: [],
  editMode: false,
  activeStatsTab: 'overview',
  activeHistoryView: 'list',
};