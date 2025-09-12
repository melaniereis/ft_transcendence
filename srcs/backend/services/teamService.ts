import db from '../db/database.js';
import { TeamStats } from '../types/team.js';
import { getUserStatsById } from './statsService.js';
import { getUserById, getAllUsersFromTeam } from './usersService.js';

// 💡 Normalized team name to table name (case insensitive)
function mapTeamToTable(team: string): string | null {
	const mapping: Record<string, string> = {
		'hacktivists': 'hacktivists',
		'bug busters': 'bug_busters',
		'logic league': 'logic_league',
		'code alliance': 'code_alliance',
	};

	const normalizedTeam = team.toLowerCase();
	return mapping[normalizedTeam] || null;
}

export async function syncUserStatsToTeam(userId: number): Promise<void> {
	try {
		const user = await getUserById(userId);
		if (!user || !user.team) {
			console.warn(`⚠️ User ${userId} has no team or doesn't exist`);
			return;
		}

		const teamTable = mapTeamToTable(user.team);
		if (!teamTable) {
			console.warn(`⚠️ No matching team table for: ${user.team}`);
			return;
		}

		// Get all users in the same team
		const teamUsers = await getAllUsersFromTeam(user.team);
		if (!teamUsers.length) return;

		// Aggregate stats
		let totalVictories = 0;
		let totalTournamentsWon = 0;
		let totalDefeats = 0;
		let totalGames = 0;

		for (const teammate of teamUsers) {
			const stats = await getUserStatsById(teammate.id);
			if (!stats) 
				continue;

			totalVictories += stats.matches_won;
			totalTournamentsWon += stats.tournaments_won;
			totalDefeats += stats.matches_lost;
			totalGames += stats.matches_played; 
		}

		const winRate = totalGames > 0 ? Math.round((totalVictories / totalGames) * 100) : 0;

		// Compose member string
		const memberNames = teamUsers.map(u => u.username).join(', ');

		// Always use the first (and only) row in team table
		const teamRows = await getAllTeamMembers(teamTable);
		if (!teamRows.length) {
			console.warn(`⚠️ No rows found in table ${teamTable}`);
			return;
		}

		const teamRow = teamRows[0]; // Assuming one row per team

		await updateTeamMember(teamTable,teamRow.id,memberNames,
		totalVictories, totalTournamentsWon,totalDefeats,winRate
		);

		console.log(`✅ Team '${user.team}' updated successfully`);
	}
	catch (err) {
		console.error(`❌ Failed to sync team stats for user ${userId}:`, err);
	}
}

function runAsync(query: string, params: any[] = []): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(query, params, function (err: Error | null) {
			if (err) {
				console.error(`❌ Failed to execute query: ${query}`, err.message);
				reject(err);
			} 
			else
				resolve();
		});
	});
}

function getAsync<T = any>(query: string, params: any[] = []): Promise<T | undefined> {
	return new Promise((resolve, reject) => {
		db.get(query, params, (err: Error | null, row: unknown) => {
			if (err) {
				console.error(`❌ Failed to fetch single record: ${query}`, err.message);
				reject(err);
			} 
			else
				resolve(row as T);
		});
	});
}

function allAsync<T = any>(query: string, params: any[] = []): Promise<T[]> {
	return new Promise((resolve, reject) => {
		db.all(query, params, (err: Error | null, rows: unknown[] | undefined) => {
			if (err){
				console.error(`❌ Failed to fetch multiple records: ${query}`, err.message);
				reject(err);
			}
			else
				resolve(rows as T[]);
		});
	});
}

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

export function updateTeamMember(table: string, id: number, members: string, victories: number,
tournaments_won: number, defeats: number, win_rate: number): Promise<void> {
	const query = `UPDATE ${table} 
		SET members = ?, victories = ?, tournaments_won = ?, defeats = ?, win_rate = ? 
		WHERE id = ?`;
	return runAsync(query, [members, victories, tournaments_won, defeats, win_rate, id]);
}

export function deleteTeamMember(table: string, id: number): Promise<void> {
	const query = `DELETE FROM ${table} WHERE id = ?`;
	return runAsync(query, [id]);
}

// Updated addMemberToTeam to normalize team string to table name internally
export async function addMemberToTeam(team: string, newMember: string): Promise<void> {
	const table = mapTeamToTable(team);
	if (!table) {
		throw new Error(`No matching table found for team: ${team}`);
	}

	const currentMembers = await getTeamMembersString(team);
	let membersArray: string[] = [];

	if (currentMembers) {
		membersArray = currentMembers.split(',').map(m => m.trim());
	}

	if (!membersArray.includes(newMember)) {
		membersArray.push(newMember);
		const updatedMembers = membersArray.join(', ');
		const query = `UPDATE ${table} SET members = ? WHERE id = 1`;
		await runAsync(query, [updatedMembers]);
		console.log(`✅ Added member '${newMember}' to team '${team}'`);
	} 
	else {
		console.log(`ℹ️ Member '${newMember}' already in team '${team}'`);
	}
}

// Similarly update getTeamMembersString
export async function getTeamMembersString(team: string): Promise<string | null> {
	const table = mapTeamToTable(team);
	if (!table) {
		throw new Error(`No matching table found for team: ${team}`);
	}

	const query = `SELECT members FROM ${table} LIMIT 1`;
	const row = await getAsync<{ members: string }>(query);
	return row ? row.members : null;
}
