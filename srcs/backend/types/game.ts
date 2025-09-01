//types/game.ts
export type GameRecord = {
    game_id: number;
    player1_id: number;
    player2_id: number;
    max_games: number;
    score_player1: number;
    score_player2: number;
    time_started: string;
    time_ended?: string | null;
    winner_id?: number | null;
    match_duration: number;
    date_played: string;
};

export type GamePlayers = {
    player1Id: number;
    player2Id: number;
};
