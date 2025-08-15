import db from './database.js';

/**
 * @param {string|number} userId
 */
export function createUserStatsTable(userId : string | number) {
const tableName = `stats_user_${userId}`;

const query = `
	CREATE TABLE IF NOT EXISTS ${tableName} (
	match_id INTEGER PRIMARY KEY AUTOINCREMENT,
	result TEXT NOT NULL CHECK(result IN ('win', 'loss')),
	match_duration INTEGER NOT NULL,
	goals_scored INTEGER NOT NULL,
	goals_conceded INTEGER NOT NULL,
	date_played TEXT NOT NULL  
	)
`;

db.run(query, (err) => {
	if (err) {
	console.error(`❌ Failed to create table ${tableName}:`, err.message);
	} else {
	console.log(`✅ Table '${tableName}' created or already exists.`);
	}
});
}
