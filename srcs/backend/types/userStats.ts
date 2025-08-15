export type MatchResult = 'win' | 'loss';

export interface UserMatch {
	result: MatchResult;
	match_duration: number;    
	goals_scored: number;
	goals_conceded: number;
	date_played: string;     
}
