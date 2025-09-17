//renderProfilePage/types.ts
export type Stats = {
	matches_played: number;
	matches_won: number;
	matches_lost: number;
	win_rate: number; // 0..1
	points_scored: number;
	points_conceded: number;
	tournaments_won: number;
};

export type Match = {
	id: string;
	date_played: string; // ISO
	opponent_id: string;
	opponent_name?: string;
	opponent_display_name?: string;
	opponent_username?: string;
	user_score: number;
	opponent_score: number;
	result: 'win' | 'loss';
	duration?: string;
};

export type Friend = {
	id: string;
	friend_id?: number; // In case the API returns friend_id instead of id
	name?: string;
	username: string;
	display_name: string;
	avatar_url: string;
	team: string;
	last_seen?: string;
	online_status: boolean;
};

export type Profile = {
	id: number;
	username: string;
	display_name?: string;
	name?: string;
	email?: string;
	avatar_url: string;
	team?: string;
	created_at: string;
	last_seen?: string;
	online_status?: boolean;
	bio?: string;
};

export type StatsTab = 'overview' | 'performance' | 'trends';
export type HistoryView = 'list' | 'detailed' | 'analysis';

export const DEFAULT_STATS: Stats = {
	matches_played: 0,
	matches_won: 0,
	matches_lost: 0,
	win_rate: 0,
	points_scored: 0,
	points_conceded: 0,
	tournaments_won: 0
};

export const AVAILABLE_AVATARS: string[] = [
	'/default.png',
	'/Blue_002.png',
	'/Blue_003.png',
	'/Blue_004.png',
	'/Blue_005.png',
	'/Blue_006.png',
	'/Blue_007.png',
	'/Blue_008.png',
	'/Blue_009.png',
	'/Blue_010.png',
	'/Blue_011.png',
	'/Blue_012.png',
	'/Blue_013.png',
	'/Blue_014.png',
	'/Blue_015.png',
	'/Blue_016.png',
	'/Blue_017.png',
	'/Blue_018.png',
	'/Blue_019.png',
	'/Blue_020.png'
];
