export type  MultiplayerGameOptions = {
    container: HTMLElement;
    playerName: string;
    opponentName: string;
    gameId: string;
    maxGames: number;
    difficulty: 'easy' | 'normal' | 'hard' | 'crazy';
};
