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
					console.error('❌ Erro ao criar histórico de partida:', err.message);
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
			`SELECT * FROM match_history 
			WHERE user_id = ? 
			ORDER BY date_played DESC 
			LIMIT 20`,
			[userId],
			(err: Error | null, rows: unknown[] | undefined) => {
				if (err) {
					console.error('❌ Erro ao buscar histórico de partidas:', err.message);
					reject(err);
				} 
				else
					resolve(rows as MatchHistoryRecord[]);
			}
		);
	});
}