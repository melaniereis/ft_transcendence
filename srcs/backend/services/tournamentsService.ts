import db from '../db/database.js';
import { Tournament } from '../types/tournament.js';

export async function createTournament(name: string, playerIds: number[]): Promise<Tournament> {
	const [p1, p2, p3, p4] = playerIds;

	console.log('Creating tournament:', { name, playerIds });

	const tournamentId = await new Promise<number>((resolve, reject) => {
		db.run(
			`INSERT INTO tournaments (
				name, player1_id, player2_id, player3_id, player4_id,
				semifinal1_player1_id, semifinal1_player2_id,
				semifinal2_player1_id, semifinal2_player2_id,
				size
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[name, p1, p2, p3, p4, p1, p2, p3, p4, 4],
			function (this: { lastID: number }, err: Error | null) {
				if (err) {
					console.error('❌ Failed to create tournament:', err.message);
					console.error('Insert params:', { name, p1, p2, p3, p4 });
					return reject(err);
				}
				console.log('✅ Tournament created with ID:', this.lastID);
				resolve(this.lastID);
			}
		);
	});

	console.log('Fetching tournament by ID:', tournamentId);
	const tournament = await getTournamentById(tournamentId);
	console.log('Tournament fetched:', tournament);
	return tournament;
}


export function getTournamentById(id: number): Promise<Tournament> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT * FROM tournaments WHERE id = ?`,
			[id],
			(err: Error | null, row: unknown) => {
				if (err) {
					console.error(`❌ Failed to fetch tournament ${id}:`, err.message);
					return reject(err);
				}
				if (!row)
					return reject(new Error(`⚠️ Tournament with ID ${id} not found`));
				resolve(row as Tournament);
			}
		);
	});
}

export async function updateMatchResult(tournamentId: number, round: 'semifinal1' | 'semifinal2' | 'final',
winnerId: number): Promise<void> {
	const fieldMap: Record<typeof round, string> = {
		semifinal1: 'semifinal1_winner_id',
		semifinal2: 'semifinal2_winner_id',
		final: 'winner_id'
	};

	const field = fieldMap[round];

	await new Promise<void>((resolve, reject) => {
		db.run(
			`UPDATE tournaments SET ${field} = ? WHERE id = ?`,
			[winnerId, tournamentId],
			function (err: Error | null) {
				if (err) {
					console.error(`❌ Failed to update ${round} result:`, err.message);
					return reject(err);
				}
				resolve();
			}
		);
	});

	if (round === 'semifinal2') {
		const tournament = await getTournamentById(tournamentId);
		if (tournament.semifinal1_winner_id && winnerId) {
			await new Promise<void>((resolve, reject) => {
				db.run(
					`UPDATE tournaments SET final_player1_id = ?, final_player2_id = ? WHERE id = ?`,
					[tournament.semifinal1_winner_id, winnerId, tournamentId],
					function (err: Error | null) {
						if (err) {
							console.error('❌ Failed to set final match players:', err.message);
							return reject(err);
						}
						resolve();
					}
				);
			});
		}
	}
}

export function getAllTournaments(): Promise<Tournament[]> {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT * FROM tournaments ORDER BY id DESC`,
			[],
			(err: Error | null, rows: unknown[] | undefined) => {
				if (err) {
					console.error('❌ Failed to fetch tournaments:', err.message);
					return reject(err);
				}
				resolve(rows as Tournament[]);
			}
		);
	});
}

export function deleteTournamentByName(name: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM tournaments WHERE name = ?`,
			[name],
			function (this: { changes: number }, err: Error | null) {
				if (err) {
					console.error(`❌ Failed to delete tournament "${name}":`, err.message);
					return reject(err);
				}
				resolve(this.changes > 0);
			}
		);
	});
}
