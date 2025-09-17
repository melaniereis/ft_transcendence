import db from '../db/database.js';
import { Tournament } from '../types/tournament.js';
import {updateUserStatsForTournament} from '../services/userStatsService.js'

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
	final: 'winner_id',
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

	// Get tournament details
	const tournament = await getTournamentById(tournamentId);

	// Handle semifinal rounds: set final players & update stats for winner and loser
	if (round === 'semifinal1' || round === 'semifinal2') {
		// Determine semifinal players for this round
		const player1Id = round === 'semifinal1' ? tournament.semifinal1_player1_id : tournament.semifinal2_player1_id;
		const player2Id = round === 'semifinal1' ? tournament.semifinal1_player2_id : tournament.semifinal2_player2_id;

		if (!player1Id || !player2Id) {
			console.warn(`Players for ${round} not properly set.`);
		} 
		else {
			const loserId = player1Id === winnerId ? player2Id : player1Id;

			// Update loser stats: +1 tournament played
			await updateUserStatsForTournament(loserId, false);
		}

		// If this is semifinal2 and semifinal1 winner exists, set final players
		if (round === 'semifinal2' && tournament.semifinal1_winner_id && winnerId) {
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

	// For final round, update winner and loser stats accordingly (winner gets tournament won)
	if (round === 'final') {
		if (!tournament.final_player1_id || !tournament.final_player2_id) {
			console.warn('Final players not set properly.');
		} 
		else {
			const loserId = tournament.final_player1_id === winnerId ? tournament.final_player2_id : tournament.final_player1_id;

			// Winner: +1 tournament played +1 tournament won
			await updateUserStatsForTournament(winnerId, true);

			// Loser: +1 tournament played (no win)
			await updateUserStatsForTournament(loserId, false);
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
