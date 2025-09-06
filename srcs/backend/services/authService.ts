//services/authService.ts
import db from '../db/database.js';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/user.js';
import { Session } from '../types/session.js';

export async function registerUser({
	username,
	password,
	name,
	team,
	display_name,
	email
}: {
	username: string;
	password: string;
	name: string;
	team: string;
	display_name?: string;
	email?: string;
}): Promise<{ id: number }> {
	const hashedPassword = await bcrypt.hash(password, 10);

	return new Promise((resolve, reject) => {
		// Query to insert new user
		db.run(
			`INSERT INTO users (username, password, name, team, display_name, email)
           VALUES (?, ?, ?, ?, ?, ?)`,
			[username, hashedPassword, name, team, display_name || null, email || null],
			function (err) {
				if (err) {
					console.error('Error inserting user:', err);
					reject(err);
				} else {
					console.log('New user created successfully');
					resolve({ id: this.lastID });
				}
			}
		);
	});
}

export async function loginUser(username: string, password: string): Promise<{ token: string } | null> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, userRaw) => {
			if (err) {
				console.error('Error querying user:', err);
				return reject(err);
			}

			if (!userRaw) {
				console.log('User not found');
				return resolve(null);
			}

			const user = userRaw as User;

			try {
				const match = await bcrypt.compare(password, user.password);
				if (!match) {
					return resolve(null);
				}

				// Token generation
				const token = uuidv4();
				const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

				// Use serialize to ensure sequential execution
				db.serialize(() => {
					// Insert session into
					db.run(
						`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
						[user.id, token, expiresAt],
						function (err) {
							if (err) {
								console.error('Error creating session:', err);
								reject(err);
							} else {
								resolve({ token });
							}
							// Update user status to online
							db.run(
								`UPDATE users SET online_status = 1, last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
								[user.id],
								function (err) {
									if (err) {
										console.error('Error updating online status:', err);
										reject(err);
									} else {
										console.log(`User ${user.id} set to online`);
										resolve({ token });
									}
								}
							);
						}
					);
				});
			} catch (bcryptErr) {
				console.error('Error comparing password:', bcryptErr);
				reject(bcryptErr);
			}
		});
	});
}

export async function verifyToken(token: string): Promise<number | null> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`,
			[token],
			(err, sessionRaw) => {
				if (err) {
					console.error('Error verifying token:', err);
					return reject(err);
				}

				if (!sessionRaw) {
					return resolve(null);
				}

				const session = sessionRaw as Session;
				resolve(session.user_id);
			}
		);
	});
}

// Function to clean up expired sessions
export async function cleanExpiredSessions(): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM sessions WHERE expires_at < datetime('now')`,
			[],
			function (err) {
				if (err) {
					console.error('Error cleaning expired sessions:', err);
					reject(err);
				} else {
					console.log(`${this.changes} expired sessions removed`);
					resolve();
				}
			}
		);
	});
}
