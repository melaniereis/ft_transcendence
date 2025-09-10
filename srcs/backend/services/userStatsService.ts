//services/userStatsService.ts
import db from '../db/database.js';
import { UserMatch } from '../types/userStats.js';
import { UserStats } from '../types/userStats.js';

export function getUserStatsById(userId: number): Promise<UserStats | null> {
	const tableName = `stats_user_${userId}`;
	const query = `SELECT * FROM ${tableName}`;

	return new Promise((resolve, reject) => {
		db.all(query, [], (err, rows: UserMatch[]) => {
		if (err) {
			console.error(`❌ Failed to fetch matches for user ${userId}:`, err.message);
			reject(err);
			return;
		}

		if (!rows || rows.length === 0) {
			// No matches found, return default stats
			resolve({user_id: userId, matches_played: 0, matches_won: 0, matches_lost: 0,
			points_scored: 0, points_conceded: 0, total_play_time: 0, win_rate: 0, tournaments_played: 0,
			tournaments_won: 0,});
			return;
		}

		let matches_played = rows.length;
		let matches_won = 0;
		let matches_lost = 0;
		let points_scored = 0;
		let points_conceded = 0;
		let total_play_time = 0;
		let tournaments_played = 0; // You might want to add logic for this
		let tournaments_won = 0; // And this too, based on your app logic

		for (const match of rows) {
			if (match.result === 'win') matches_won++;
			else if (match.result === 'loss') matches_lost++;

			points_scored += match.goals_scored;
			points_conceded += match.goals_conceded;
			total_play_time += match.match_duration;
		}

		const win_rate = matches_played > 0 ? Math.round((matches_won / matches_played) * 100) : 0;

		resolve({
			user_id: userId,
			matches_played,
			matches_won,
			matches_lost,
			points_scored,
			points_conceded,
			total_play_time,
			win_rate,
			tournaments_played,
			tournaments_won,
		});
		});
	});
}


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