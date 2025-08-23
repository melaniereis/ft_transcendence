export interface MatchHistoryRecord {
    id: number;
    game_id: number;
    user_id: number;
    opponent_id: number;
    user_score: number;
    opponent_score: number;
    result: 'win' | 'loss';
    duration: number;
    date_played: string;
}
