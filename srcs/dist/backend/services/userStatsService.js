import db from '../db/database.js';
export function insertUserMatch(userId, match) {
    const tableName = `stats_user_${userId}`;
    const query = `
		INSERT INTO ${tableName} (result, match_duration, goals_scored, goals_conceded, date_played)
		VALUES (?, ?, ?, ?, ?)
	`;
    const { result, match_duration, goals_scored, goals_conceded, date_played } = match;
    db.run(query, [result, match_duration, goals_scored, goals_conceded, date_played], (err) => {
        if (err)
            console.error(`Failed to insert match for user ${userId}:`, err.message);
        else
            console.log(`Match inserted for user ${userId}`);
    });
}
export function getUserMatches(userId, callback) {
    const tableName = `stats_user_${userId}`;
    const query = `SELECT * FROM ${tableName} ORDER BY date_played DESC`;
    db.all(query, (err, rows) => {
        callback(err, rows);
    });
}
export function deleteUserMatch(userId, matchId, callback) {
    const tableName = `stats_user_${userId}`;
    const query = `DELETE FROM ${tableName} WHERE match_id = ?`;
    db.run(query, [matchId], (err) => {
        callback(err);
    });
}
