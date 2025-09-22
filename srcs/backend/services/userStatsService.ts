//services/userStatsService.ts
import db from '../db/database.js';
import { UserMatch } from '../types/userStats.js';
import { UserStats } from '../types/userStats.js';
import { getUserById } from './usersService.js';
import { getAllTeamMembers, updateTeamMember } from './teamService.js';

export function getUserStatsById(userId: number): Promise<UserStats | null> {
	const tableName = `stats_user_${userId}`;
	const query = `SELECT * FROM ${tableName}`;

	return new Promise((resolve, reject) => {
		db.all(query, [], (err, rows: UserMatch[]) => {
		if (err) {
			console.error(`❌ Failed to fetch matches for user ${userId}:`, err.message);
			reject(err);
			return;
		}

		if (!rows || rows.length === 0) {
			// No matches found, return default stats
			resolve({user_id: userId, matches_played: 0, matches_won: 0, matches_lost: 0,
			points_scored: 0, points_conceded: 0, total_play_time: 0, win_rate: 0, tournaments_played: 0,
			tournaments_won: 0,});
			return;
		}

		let matches_played = rows.length;
		let matches_won = 0;
		let matches_lost = 0;
		let points_scored = 0;
		let points_conceded = 0;
		let total_play_time = 0;
		let tournaments_played = 0; // You might want to add logic for this
		let tournaments_won = 0; // And this too, based on your app logic

		for (const match of rows) {
			if (match.result === 'win') matches_won++;
			else if (match.result === 'loss') matches_lost++;

			points_scored += match.goals_scored;
			points_conceded += match.goals_conceded;
			total_play_time += match.match_duration;
		}

		const win_rate = matches_played > 0 ? Math.round((matches_won / matches_played) * 100) : 0;

		resolve({
			user_id: userId,
			matches_played,
			matches_won,
			matches_lost,
			points_scored,
			points_conceded,
			total_play_time,
			win_rate,
			tournaments_played,
			tournaments_won,
		});
		});
	});
}


export function insertUserMatch(userId: string | number, match: UserMatch): void {
	const tableName = `stats_user_${userId}`;
	const query = `
		INSERT INTO ${tableName} (result, match_duration, goals_scored, goals_conceded, date_played)
		VALUES (?, ?, ?, ?, ?)
	`;
	const { result, match_duration, goals_scored, goals_conceded, date_played } = match;

	db.run(query, [result, match_duration, goals_scored, goals_conceded, date_played], (err: Error | null) => {
		if (err)
			console.error(`❌ Failed to insert match for user ${userId}:`, err.message);
		else
			console.log(`✅ Match inserted for user ${userId}`);
	});
}

export function getUserMatches(userId: string | number,
callback: (err: Error | null, rows?: UserMatch[]) => void): void {
	const tableName = `stats_user_${userId}`;
	const query = `SELECT * FROM ${tableName} ORDER BY date_played DESC`;

	db.all(query, [], (err: Error | null, rows: unknown[] | undefined) => {
		if (err) {
			console.error(`❌ Failed to fetch matches for user ${userId}:`, err.message);
			callback(err);
		} 
		else
			callback(null, rows as UserMatch[]);
	});
}

export function deleteUserMatch(userId: string | number, matchId: number,
callback: (err: Error | null) => void): void {
	const tableName = `stats_user_${userId}`;
	const query = `DELETE FROM ${tableName} WHERE match_id = ?`;

	db.run(query, [matchId], (err: Error | null) => {
		if (err) {
			console.error(`❌ Failed to delete match ${matchId} for user ${userId}:`, err.message);
		}
		callback(err);
	});
}


function mapTeamToTable(team: string): string | null {
	const mapping: Record<string, string> = {
		'hacktivists': 'hacktivists',
		'bug busters': 'bug_busters',
		'logic league': 'logic_league',
		'code alliance': 'code_alliance',
	};

	return mapping[team.toLowerCase()] || null;
}

export function updateUserStatsForTournament(userId: number, isWinner: boolean): Promise<void> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT * FROM user_stats WHERE user_id = ?`, [userId], async (err, stats: UserStats | undefined) => {
		if (err) {
			console.error(`❌ Failed to get stats for user ${userId}:`, err.message);
			return reject(err);
		}

		const tournamentsPlayed = (stats?.tournaments_played || 0) + 1;
		const tournamentsWon = (stats?.tournaments_won || 0) + (isWinner ? 1 : 0);

		const runStatsUpdate = () => {
			db.run(
			`UPDATE user_stats SET tournaments_played = ?, tournaments_won = ? WHERE user_id = ?`,
			[tournamentsPlayed, tournamentsWon, userId],
			async (updateErr) => {
				if (updateErr) {
				console.error(`❌ Failed to update stats for user ${userId}:`, updateErr.message);
				return reject(updateErr);
				}

				// ✅ If winner, also update the team table
				if (isWinner) {
				try {
					const user = await getUserById(userId);
					if (!user || !user.team) {
					console.warn(`⚠️ Cannot update team stats — user ${userId} has no team`);
					return resolve();
					}

					const tableName = mapTeamToTable(user.team);
					if (!tableName) {
					console.warn(`⚠️ No valid table found for team: ${user.team}`);
					return resolve();
					}

					const teamRows = await getAllTeamMembers(tableName);
					if (!teamRows.length) {
					console.warn(`⚠️ No existing team rows found in table ${tableName}`);
					return resolve();
					}

					const teamRow = teamRows[0];

					const updatedTeamTournamentsWon = (teamRow.tournaments_won || 0) + 1;

					await updateTeamMember(
					tableName,
					teamRow.id,
					teamRow.members,
					teamRow.victories,
					updatedTeamTournamentsWon,
					teamRow.defeats,
					teamRow.win_rate
					);

					console.log(`✅ Team '${user.team}' tournament count updated`);
				} catch (teamErr) {
					console.error(`❌ Failed to update team tournament wins:`, teamErr);
				}
				}

				resolve();
			}
			);
		};

		// If no stats yet, insert a new row
		if (!stats) {
			db.run(
			`INSERT INTO user_stats (user_id, tournaments_played, tournaments_won) VALUES (?, ?, ?)`,
			[userId, tournamentsPlayed, tournamentsWon],
			async (insertErr) => {
				if (insertErr) {
				console.error(`❌ Failed to insert stats for user ${userId}:`, insertErr.message);
				return reject(insertErr);
				}

				// ✅ Handle team win if needed
				if (isWinner) {
				try {
					const user = await getUserById(userId);
					if (!user || !user.team) return resolve();

					const tableName = mapTeamToTable(user.team);
					if (!tableName) return resolve();

					const teamRows = await getAllTeamMembers(tableName);
					if (!teamRows.length) return resolve();

					const teamRow = teamRows[0];
					const updatedTeamTournamentsWon = (teamRow.tournaments_won || 0) + 1;

					await updateTeamMember(tableName, teamRow.id, teamRow.members, teamRow.victories,
					updatedTeamTournamentsWon, teamRow.defeats, teamRow.win_rate);

					console.log(`✅ Team '${user.team}' tournament count updated`);
				} catch (teamErr) {
					console.error(`❌ Failed to update team tournament wins:`, teamErr);
				}
				}

				resolve();
			}
			);
		} else {
			// Existing stats: update
			runStatsUpdate();
		}
		});
	});
}
