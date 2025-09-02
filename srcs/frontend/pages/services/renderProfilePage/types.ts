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
	'/assets/avatar/default.png',
	'/assets/avatar/Blue_002.png',
	'/assets/avatar/Blue_003.png',
	'/assets/avatar/Blue_004.png',
	'/assets/avatar/Blue_005.png',
	'/assets/avatar/Blue_006.png',
	'/assets/avatar/Blue_007.png',
	'/assets/avatar/Blue_008.png',
	'/assets/avatar/Blue_009.png',
	'/assets/avatar/Blue_010.png',
	'/assets/avatar/Blue_011.png',
	'/assets/avatar/Blue_012.png',
	'/assets/avatar/Blue_013.png',
	'/assets/avatar/Blue_014.png',
	'/assets/avatar/Blue_015.png',
	'/assets/avatar/Blue_016.png',
	'/assets/avatar/Blue_017.png',
	'/assets/avatar/Blue_018.png',
	'/assets/avatar/Blue_019.png',
	'/assets/avatar/Blue_020.png'
];
