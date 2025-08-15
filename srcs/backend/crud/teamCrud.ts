import db from '../db/database.js';
import { TeamStats } from '../types/team.js';

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

// CRUD for team table
export function createTeamMember(table: string, members: string): Promise<void> {
	const query = `INSERT INTO ${table} (members) VALUES (?)`;
	return runAsync(query, [members]);
}

export function getAllTeamMembers(table: string): Promise<TeamStats[]> {
	const query = `SELECT * FROM ${table}`;
	return allAsync<TeamStats>(query);
}

export function getTeamMemberById(table: string, id: number): Promise<TeamStats | undefined> {
	const query = `SELECT * FROM ${table} WHERE id = ?`;
	return getAsync<TeamStats>(query, [id]);
}

export function updateTeamMember( table: string, id: number, members: string,
victories: number, tournaments_won: number, defeats: number, win_rate: number
): Promise<void> {
	const query = `UPDATE ${table} SET members = ?, victories = ?, tournaments_won = ?, defeats = ?, win_rate = ? WHERE id = ?`;
	return runAsync(query, [members, victories, tournaments_won, defeats, win_rate, id]);
}

export function deleteTeamMember(table: string, id: number): Promise<void> {
	const query = `DELETE FROM ${table} WHERE id = ?`;
	return runAsync(query, [id]);
}
