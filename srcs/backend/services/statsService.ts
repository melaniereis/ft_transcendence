import db from '../db/database.js';

export function createUserStats(userId: number): Promise<void> {
return new Promise((resolve, reject) => {
	const insertQuery = `INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)`;
	db.run(insertQuery, [userId], (err) => {
	if (err) {
		console.error(`❌ Failed to insert stats for user ${userId}:`, err.message);
		reject(err);
	} else {
		console.log(`✅ Stats initialized for user ${userId}.`);
		resolve();
	}
	});
});
}
