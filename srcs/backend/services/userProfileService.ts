import db from '../db/database.js';
import { User } from '../types/user.js';
import * as bcrypt from 'bcrypt';

// Function to get user profile by IDexport async function getUserProfile(userId: number)
export async function getUserProfile(userId: number)
	: Promise<Omit<User, 'password'> | null> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT id, username, name, team, display_name, email, avatar_url, bio, online_status, last_seen, created_at FROM users WHERE id = ?`, [userId], (err, row) => {
			if (err) {
				console.error('❌ Error fetching profile:', err);
				reject(err);
			} else {
				console.log('✅ Profile found:', row);
				resolve(row ? (row as Omit<User, 'password'>) : null);
			}
		});
	});
}

// Function to update user profile
export async function updateUserProfile(
	userId: number,
	updates: Partial<Pick<User, 'username' | 'display_name' | 'email' | 'avatar_url' | 'bio'>>
): Promise<void> {
	// Filter out undefined or null fields
	const entries = Object.entries(updates).filter(([_, value]) =>
		value !== undefined && value !== null && value !== ''
	);
	if (entries.length === 0) {
		throw new Error('No fields to update');
	}

	// Check for uniqueness
	if (updates.username) {
		const existing = await new Promise((resolve, reject) => {
			db.get('SELECT id FROM users WHERE username = ? AND id != ?', [updates.username, userId], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
		if (existing) throw new Error('Username already exists.');
	}
	if (updates.display_name) {
		const existing = await new Promise((resolve, reject) => {
			db.get('SELECT id FROM users WHERE display_name = ? AND id != ?', [updates.display_name, userId], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
		if (existing) throw new Error('Display name already exists.');
	}
	if (updates.email) {
		const existing = await new Promise((resolve, reject) => {
			db.get('SELECT id FROM users WHERE email = ? AND id != ?', [updates.email, userId], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
		if (existing) throw new Error('Email already exists.');
	}

	const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
	const values = entries.map(([_, value]) => value);

	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE users SET ${setClause} WHERE id = ?`,
			[...values, userId],
			function (err) {
				if (err) {
					console.error('Error updating profile:', err);
					reject(err);
				} else if (this.changes === 0) {
					reject(new Error('User not found'));
				} else {
					resolve();
				}
			}
		);
	});
}

// Update user's online status
export async function updateOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE users SET online_status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
			[isOnline ? 1 : 0, userId],
			function (err) {
				if (err) {
					console.error('Error updating online status:', err);
					reject(err);
				} else if (this.changes === 0) {
					reject(new Error('User not found'));
				} else {
					resolve();
				}
			}
		);
	});
}

// Get user with stats
export async function getUserWithStats(userId: number): Promise<any> {
	return new Promise((resolve, reject) => {
		const query = `
            SELECT
                u.id, u.username, u.name, u.team, u.display_name, u.email,
                u.avatar_url, u.online_status, u.last_seen, u.created_at,
                COALESCE(s.matches_played, 0) as matches_played,
                COALESCE(s.matches_won, 0) as matches_won,
                COALESCE(s.matches_lost, 0) as matches_lost,
                COALESCE(s.points_scored, 0) as points_scored,
                COALESCE(s.points_conceded, 0) as points_conceded,
                COALESCE(s.win_rate, 0) as win_rate,
                COALESCE(s.tournaments_played, 0) as tournaments_played,
                COALESCE(s.tournaments_won, 0) as tournaments_won
            FROM users u
            LEFT JOIN user_stats s ON u.id = s.user_id
            WHERE u.id = ?
        `;

		db.get(query, [userId], (err, row) => {
			if (err) {
				console.error('Error fetching user with stats:', err);
				reject(err);
			} else {
				resolve(row || null);
			}
		});
	});
}

// Function to change user password
export async function changeUserPassword(
	userId: number,
	currentPassword: string,
	newPassword: string
): Promise<void> {
	return new Promise((resolve, reject) => {
		// First get current user data
		db.get(`SELECT password FROM users WHERE id = ?`, [userId], async (err, row) => {
			if (err) {
				console.error('Error fetching user:', err);
				return reject(err);
			}

			if (!row) {
				return reject(new Error('User not found'));
			}

			const user = row as { password: string };

			try {
				// Verify current password
				const match = await bcrypt.compare(currentPassword, user.password);
				if (!match) {
					return reject(new Error('Incorrect current password'));
				}

				// Hash new password
				const hashedNewPassword = await bcrypt.hash(newPassword, 10);

				// Update password in database
				db.run(
					`UPDATE users SET password = ? WHERE id = ?`,
					[hashedNewPassword, userId],
					function (err) {
						if (err) {
							console.error('Error updating password:', err);
							reject(err);
						} else if (this.changes === 0) {
							reject(new Error('User not found'));
						} else {
							resolve();
						}
					}
				);
			} catch (bcryptErr) {
				console.error('Error comparing password:', bcryptErr);
				reject(bcryptErr);
			}
		});
	});
}
