export type MatchResult = 'win' | 'loss';

export interface UserMatch {
	result: MatchResult;
	match_duration: number;    
	goals_scored: number;
	goals_conceded: number;
	date_played: string;     
}


export type UserStats = {
    user_id: number;
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    points_scored: number;
    points_conceded: number;
    win_rate: number;
};