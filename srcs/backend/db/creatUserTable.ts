// srcs/backend/db/createStatsTable.js

import db from './database.js';

/**
 * Creates a stats table for a specific user if it doesn't already exist.
 * @param {string|number} userId - A unique identifier for the user
 */
export function createUserStatsTable(userId) {
const tableName = `stats_user_${userId}`;

const query = `
CREATE TABLE IF NOT EXISTS ${tableName} (
	match_id INTEGER PRIMARY KEY AUTOINCREMENT,
	score INTEGER NOT NULL,
	time_played INTEGER NOT NULL,
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
