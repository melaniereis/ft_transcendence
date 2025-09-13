import db from '../db/database.js';
export function createGame(player1Id, player2Id, maxGames, timeStarted) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO games (player1_id, player2_id, max_games, score_player1, score_player2, time_started)
		VALUES (?, ?, ?, 0, 0, ?)`, [player1Id, player2Id, maxGames, timeStarted], function (err) {
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
export function endGame(gameId, score1, score2) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE games
             SET score_player1 = ?, score_player2 = ?
             WHERE game_id = ?`, [score1, score2, gameId], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export function getPlayersFromGame(gameId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT player1_id, player2_id FROM games WHERE game_id = ?`, [gameId], (err, row) => {
            if (err)
                reject(err);
            else if (!row)
                reject(new Error(`Game with ID ${gameId} not found.`));
            else {
                resolve({
                    player1Id: row.player1_id,
                    player2Id: row.player2_id,
                });
            }
        });
    });
}
