//services/userStatsService.ts
import db from '../db/database.js';
import { UserMatch } from '../types/userStats.js';

export function insertUserMatch(userId: string | number, match: UserMatch): void {
    const tableName = `stats_user_${userId}`;
    const query = `
        INSERT INTO ${tableName} (result, match_duration, goals_scored, goals_conceded, date_played)
        VALUES (?, ?, ?, ?, ?)
    `;
    const { result, match_duration, goals_scored, goals_conceded, date_played } = match;

    db.run(query, [result, match_duration, goals_scored, goals_conceded, date_played], (err: Error | null) => {
        if (err)
            console.error(`❌ Failed to insert match for user ${userId}:`, err.message);
        else
            console.log(`✅ Match inserted for user ${userId}`);
    });
}

export function getUserMatches(userId: string | number,
callback: (err: Error | null, rows?: UserMatch[]) => void): void {
    const tableName = `stats_user_${userId}`;
    const query = `SELECT * FROM ${tableName} ORDER BY date_played DESC`;

    db.all(query, [], (err: Error | null, rows: unknown[] | undefined) => {
        if (err) {
            console.error(`❌ Failed to fetch matches for user ${userId}:`, err.message);
            callback(err);
        } 
		else
            callback(null, rows as UserMatch[]);
    });
}

export function deleteUserMatch(userId: string | number, matchId: number,
callback: (err: Error | null) => void): void {
    const tableName = `stats_user_${userId}`;
    const query = `DELETE FROM ${tableName} WHERE match_id = ?`;

    db.run(query, [matchId], (err: Error | null) => {
        if (err) {
            console.error(`❌ Failed to delete match ${matchId} for user ${userId}:`, err.message);
        }
        callback(err);
    });
}