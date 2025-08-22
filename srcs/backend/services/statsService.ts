import db from '../db/database.js';
import {UserStats} from '../types/userStats.js';

export function createUserStats(userId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const insertQuery = `INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)`;
		db.run(insertQuery, [userId], (err) => {
			if (err) {
				console.error(`Failed to insert stats for user ${userId}:`, err.message);
				reject(err);
			} 
			else {
				console.log(`Stats initialized for user ${userId}.`);
				resolve();
			}
		});
	});
}

export async function updateUserStatsAfterGame(
gameId: number,
player1Id: number,
player2Id: number,
score1: number,
score2: number
): Promise<void> {
console.log(`Starting updateUserStatsAfterGame for game ${gameId}`);

const updateStats = async (
	userId: number,
	scored: number,
	conceded: number,
	won: boolean
) => {
	await createUserStats(userId); // Ensure stats row exists

	const winInc = won ? 1 : 0;
	const lossInc = won ? 0 : 1;

	return new Promise<void>((resolve, reject) => {
	db.run(
		`UPDATE user_stats
		SET matches_played = matches_played + 1,
			matches_won = matches_won + ?,
			matches_lost = matches_lost + ?,
			points_scored = points_scored + ?,
			points_conceded = points_conceded + ?,
			win_rate = CAST(matches_won + ? AS REAL) / CAST(matches_played + 1 AS REAL)
		WHERE user_id = ?`,
		[winInc, lossInc, scored, conceded, winInc, userId],
		(err) => {
		if (err) {
			console.error(`Error updating stats for user ${userId}:`, err);
			reject(err);
		} 
		else {
			console.log(`Successfully updated stats for user ${userId}`);
			resolve();
		}
		}
	);
	});
};

await Promise.all([
	updateStats(player1Id, score1, score2, score1 > score2),
	updateStats(player2Id, score2, score1, score2 > score1)
]);

console.log(`Finished updating stats for game ${gameId}`);
}

export function getAllUserStats(): Promise<UserStats[]> {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM user_stats`, (err, rows) => {
			if (err){
				console.error('Failed to fetch user stats:', err.message);
				reject(err);
			}
			else 
				resolve(rows as UserStats[]);
		});
	});
}

export function getUserStatsById(userId: number): Promise<UserStats> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT * FROM user_stats WHERE user_id = ?`, [userId], (err, row) => {
			if (err) {
				console.error(`Failed to fetch stats for user ${userId}:`, err.message);
				reject(err);
			} 
			else if (!row)
				reject(new Error(`No stats found for user ${userId}`));
			else
				resolve(row as UserStats);
		});
	});
}