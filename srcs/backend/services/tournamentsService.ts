import db from '../db/database.js';
import { Tournament } from '../types/tournament.js';

function runAsync(query: string, params: any[] = []): Promise<void> {
return new Promise((resolve, reject) => {
	db.run(query, params, function (err) {
	if (err) 
		reject(err);
	else 
		resolve();
	});
});
}

function getAsync<T = any>(query: string, params: any[] = []): Promise<T | undefined> {
return new Promise((resolve, reject) => {
	db.get(query, params, (err, row) => {
	if (err) 
		reject(err);
	else 
		resolve(row as T);
	});
});
}

function allAsync<T = any>(query: string, params: any[] = []): Promise<T[]> {
return new Promise((resolve, reject) => {
	db.all(query, params, (err, rows) => {
	if (err)
		reject(err);
	else
		resolve(rows as T[]);
	});
});
}

// CREATE
export function createTournament(name: string, team_winner: string,
team_victories: number, size: number): Promise<void> {
	const query = `
		INSERT INTO tournaments (name, team_winner, team_victories, size)
		VALUES (?, ?, ?, ?)
		`;
	return runAsync(query, [name, team_winner, team_victories, size]);
}

// READ
export function getAllTournaments(): Promise<Tournament[]> {
	const query = `SELECT * FROM tournaments`;
	return allAsync<Tournament>(query);
}

export function getTournamentById(id: number): Promise<Tournament | undefined> {
	const query = `SELECT * FROM tournaments WHERE id = ?`;
	return getAsync<Tournament>(query, [id]);
}

// UPDATE
export function updateTournament(id: number, name: string, team_winner: string,
team_victories: number, size: number): Promise<void> {
	const query = `
		UPDATE tournaments
		SET name = ?, team_winner = ?, team_victories = ?, size = ?
		WHERE id = ?
		`;
	return runAsync(query, [name, team_winner, team_victories, size, id]);
}

// DELETE
export function deleteTournament(id: number): Promise<void> {
	const query = `DELETE FROM tournaments WHERE id = ?`;
	return runAsync(query, [id]);
}


//usage
/* import * as TournamentService from './tournamentService.js';

await TournamentService.createTournament('Code Warz', 'hacktivists', 5, 8);
const tournaments = await TournamentService.getAllTournaments();
 */