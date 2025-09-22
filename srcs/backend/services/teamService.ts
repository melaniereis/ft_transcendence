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

		const teamUsers = await getAllUsersFromTeam(user.team);
		if (!teamUsers.length) {
			console.warn(`⚠️ No users found for team ${user.team}`);
			return;
		}

		for (const teammate of teamUsers) {
			const stats = await getUserStatsById(teammate.id);
			if (!stats) {
				console.warn(`⚠️ No stats found for user ${teammate.username}`);
				continue;
			}

			const winRate = stats.matches_played > 0
				? Math.round((stats.matches_won / stats.matches_played) * 100)
				: 0;

			// 👇 This should insert or update based on username or id
			await upsertTeamMember(teamTable, {
				username: teammate.username,
				victories: stats.matches_won,
				defeats: stats.matches_lost,
				tournaments_won: stats.tournaments_won,
				win_rate: winRate
			});
		}

		console.log(`✅ Team '${user.team}' updated with individual stats`);
	} catch (err) {
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
async function upsertTeamMember(table: string,
data: {
	username: string;
	victories: number;
	defeats: number;
	tournaments_won: number;
	win_rate: number;
}
): Promise<void> {
	// Check if user already exists in team table
	const existing = await getAsync<TeamStats>(`SELECT * FROM ${table} WHERE members = ?`, [data.username]);

	if (existing) {
		// Update
		await runAsync(
			`UPDATE ${table} 
			SET victories = ?, defeats = ?, tournaments_won = ?, win_rate = ? 
			WHERE members = ?`,
			[data.victories, data.defeats, data.tournaments_won, data.win_rate, data.username]
		);
	} 
	else {
		// Insert
		await runAsync(
			`INSERT INTO ${table} 
			(members, victories, defeats, tournaments_won, win_rate) 
			VALUES (?, ?, ?, ?, ?)`,
			[data.username, data.victories, data.defeats, data.tournaments_won, data.win_rate]
		);
	}
}