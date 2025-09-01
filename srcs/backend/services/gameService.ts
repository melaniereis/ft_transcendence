//services/gameService.ts
import db from '../db/database.js';
import type { GamePlayers } from '../types/game.js';

export function createGame(player1Id: number, player2Id: number, maxGames: number,
timeStarted: string): Promise<number> {
	return new Promise((resolve, reject) => {
		db.run(
		`INSERT INTO games (player1_id, player2_id, max_games, score_player1, score_player2, time_started)
		VALUES (?, ?, ?, 0, 0, ?)`,
		[player1Id, player2Id, maxGames, timeStarted],
		function (err) {
			if (err) 
				reject(err);
			else
				resolve(this.lastID);
		}
		);
	});
}

export function endGame(gameId: string, score1: number, score2: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE games
			SET score_player1 = ?, score_player2 = ?
			WHERE game_id = ?`,
			[score1, score2, gameId],
			function (err) {
				if (err)
					reject(err);
				else
					resolve();
			}
		);
	});
}

export function getPlayersFromGame(gameId: number): Promise<GamePlayers> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT player1_id, player2_id FROM games WHERE game_id = ?`,
			[gameId],
			(err, row: { player1_id: number; player2_id: number } | undefined) => {
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
			}
		);
	});
}

export function getGameById(gameId: number): Promise<any> {
	return new Promise((resolve, reject) => {
		db.get('SELECT * FROM games WHERE game_id = ?', [gameId], (err, row) => {
			if (err) return reject(err);
			resolve(row);
		});
	});
}
