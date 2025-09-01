//services/tournamentsService.ts
import db from '../db/database.js';
import { Tournament } from '../types/tournament.js';

export async function createTournament(name: string, playerIds: number[]): Promise<Tournament> {
	const [p1, p2, p3, p4] = playerIds;

	const tournamentId = await new Promise<number>((resolve, reject) => {
		db.run(
			`INSERT INTO tournaments (
				name, player1_id, player2_id, player3_id, player4_id,
				semifinal1_player1_id, semifinal1_player2_id,
				semifinal2_player1_id, semifinal2_player2_id,
				size
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[name, p1, p2, p3, p4, p1, p2, p3, p4, 4],
			function (err) {
				if (err) 
					return reject(err);
				resolve(this.lastID);
			}
		);
	});
	return await getTournamentById(tournamentId);
}

export function getTournamentById(id: number): Promise<Tournament> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT * FROM tournaments WHERE id = ?`, [id], (err, row) => {
			if (err) 
				return reject(err);
			if (!row) 
				return reject(new Error(`Tournament with ID ${id} not found`));
			resolve(row as Tournament);
		});
	});
}

export async function updateMatchResult(
	tournamentId: number,
	round: 'semifinal1' | 'semifinal2' | 'final',
	winnerId: number
	): Promise<void> {
	const fieldMap: Record<typeof round, string> = {
		semifinal1: 'semifinal1_winner_id',
		semifinal2: 'semifinal2_winner_id',
		final: 'winner_id'
	};

	const field = fieldMap[round];

	await new Promise<void>((resolve, reject) => {
		db.run(`UPDATE tournaments SET ${field} = ? WHERE id = ?`, [winnerId, tournamentId], function (err) {
			if (err) 
				return reject(err);
			resolve();
		});
	});

	if (round === 'semifinal2') {
		const tournament = await getTournamentById(tournamentId);
		if (tournament.semifinal1_winner_id && winnerId) {
			await new Promise<void>((resolve, reject) => {
				db.run(
					`UPDATE tournaments SET final_player1_id = ?, final_player2_id = ? WHERE id = ?`,
					[tournament.semifinal1_winner_id, winnerId, tournamentId],
					function (err) {
						if (err) return reject(err);
						resolve();
					}
					);
			});
		}
	}
}

export function getAllTournaments(): Promise<Tournament[]> {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM tournaments ORDER BY id DESC`, [], (err, rows) => {
		if (err) 
			return reject(err);
		resolve(rows as Tournament[]);
		});
	});
}

export function deleteTournamentByName(name: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		db.run('DELETE FROM tournaments WHERE name = ?', [name], function (err) {
		if (err) 
			return reject(err);
		resolve(this.changes > 0);
		});
	});
}