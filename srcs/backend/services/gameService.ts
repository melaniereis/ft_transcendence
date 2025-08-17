import db from '../db/database.js';

/**
 * Creates a new game.
 * @param player1Id - ID of player 1
 * @param player2Id - ID of player 2
 * @param maxGames - Max number of games
 * @param timeStarted - ISO timestamp
 * @returns Promise resolving to the new game ID
 */
export function createGame(
player1Id: number,
player2Id: number,
maxGames: number,
timeStarted: string
): Promise<number> {
return new Promise((resolve, reject) => {
	db.run(
	`INSERT INTO games (player1_id, player2_id, max_games, score_player1, score_player2, time_started)
	VALUES (?, ?, ?, 0, 0, ?)`,
	[player1Id, player2Id, maxGames, timeStarted],
	function (err) {
		if (err) reject(err);
		else resolve(this.lastID);
	}
	);
});
}
