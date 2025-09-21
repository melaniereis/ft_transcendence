import db from '../db/database.js';
import { MatchHistoryRecord } from '../types/matchHistory.js';

export async function createMatchHistoryRecord(gameId: number, userId: number, opponentId: number,
	userScore: number, opponentScore: number, duration: number): Promise<void> {
	const result = userScore > opponentScore ? 'win' : 'loss';
	return new Promise<void>((resolve, reject) => {
		db.run(
			`INSERT INTO match_history (
				game_id, user_id, opponent_id, user_score, opponent_score, result, duration, date_played
			) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
			[gameId, userId, opponentId, userScore, opponentScore, result, duration],
			function (err: Error | null) {
				if (err) {
					console.error('❌ Error creating match history:', err.message);
					reject(err);
				}
				else
					resolve();
			}
		);
	});
}

export async function getMatchHistory(userId: number): Promise<MatchHistoryRecord[]> {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT mh.*,
				   COALESCE(u.display_name, u.username, '') AS opponentDisplayName,
				   u.username AS opponentUsername
					FROM match_history mh
					LEFT JOIN users u ON u.id = mh.opponent_id
					WHERE mh.user_id = ? ORDER BY date_played DESC`,
			[userId],
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows as MatchHistoryRecord[]);
				}
			}
		);
	});
}

export async function getMatchHistoryPaginated(userId: number, offset: number, limit: number): Promise<MatchHistoryRecord[]> {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT * FROM match_history WHERE user_id = ? ORDER BY date_played DESC LIMIT ? OFFSET ?`,
			[userId, limit, offset],
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows as MatchHistoryRecord[]);
				}
			}
		);
	});
}

export async function getMatchHistoryCount(userId: number): Promise<number> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT COUNT(*) as count FROM match_history WHERE user_id = ?`,
			[userId],
			(err, row: any) => {
				if (err) {
					reject(err);
				} else {
					resolve(row?.count || 0);
				}
			}
		);
	});
}
