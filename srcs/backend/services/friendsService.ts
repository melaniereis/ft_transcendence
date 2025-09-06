//services/friendsService.ts
import db from '../db/database.js';
import { Friendship } from '../types/friendship.js';
import { User } from '../types/user.js';


// Obtain outgoing friend requests
export async function getOutgoingRequests(userId: number): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const query = `
            SELECT
                f.*,
                u.username,
                u.name,
                u.display_name,
                u.avatar_url,
                u.team
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            WHERE f.user_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
        `;
		db.all(query, [userId], (err, rows) => {
			if (err) {
				console.error('Error fetching outgoing requests:', err);
				reject(err);
			} else {
				resolve(rows || []);
			}
		});
	});
}

// Function to get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
	return new Promise((resolve, reject) => {
		db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
			if (err) {
				console.error('Error fetching user:', err);
				reject(err);
			} else {
				resolve(row ? (row as User) : null);
			}
		});
	});
}

// Send friend request
export async function sendFriendRequest(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		//Check if friendship or pending request already exists
		db.get(
			`SELECT * FROM friendships
             WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
			[userId, friendId, friendId, userId],
			(err, row) => {
				if (err) {
					console.error('Error checking friendship:', err);
					return reject(err);
				}

				if (row) {
					return reject(new Error('Request already exists or users are already friends'));
				}

				// Insert new friend request
				db.run(
					`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')`,
					[userId, friendId],
					function (err) {
						if (err) {
							console.error('Error inserting request:', err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			}
		);
	});
}

// Accept friend request
export async function acceptFriendRequest(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			// Update request to accepted
			db.run(
				`UPDATE friendships SET status = 'accepted'
				 WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
				[friendId, userId],
				function (err) {
					if (err) {
						console.error('Error accepting request:', err);
						return reject(err);
					}

					if (this.changes === 0) {
						return reject(new Error('Pending request not found'));
					}

					// Create inverse relationship
					db.run(
						`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'accepted')`,
						[userId, friendId],
						function (err) {
							if (err) {
								console.error('Error creating inverse relationship:', err);
								reject(err);
							} else {
								resolve();
							}
						}
					);
				}
			);
		});
	});
}

// Obtain friends list
export async function getFriends(userId: number): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const query = `
            SELECT
                f.*,
                u.username,
                u.name,
                u.display_name,
                u.avatar_url,
                u.online_status,
                u.last_seen,
                u.team
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            WHERE f.user_id = ? AND f.status = 'accepted'
            ORDER BY u.online_status DESC, u.last_seen DESC
        `;

		db.all(query, [userId], (err, rows) => {
			if (err) {
				console.error('Error fetching friends:', err);
				reject(err);
			} else {
				resolve(rows || []);
			}
		});
	});
}

// Obtain pending friend requests
export async function getPendingRequests(userId: number): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const query = `
            SELECT
                f.*,
                u.username,
                u.name,
                u.display_name,
                u.avatar_url,
                u.team
            FROM friendships f
            JOIN users u ON f.user_id = u.id
            WHERE f.friend_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
        `;

		db.all(query, [userId], (err, rows) => {
			if (err) {
				console.error('Error fetching pending requests:', err);
				reject(err);
			} else {
				resolve(rows || []);
			}
		});
	});
}

// Remove friend(remove friendship in both directions)
export async function removeFriend(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM friendships
             WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
			[userId, friendId, friendId, userId],
			function (err) {
				if (err) {
					console.error('Error removing friend:', err);
					reject(err);
				} else {
					// Resolve even if no rows affected (friendship may not exist)
					resolve();
				}
			}
		);
	});
}

// Reject friend request
export async function rejectFriendRequest(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
			`DELETE FROM friendships
             WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
			[friendId, userId],
			function (err) {
				if (err) {
					console.error('Error rejecting request:', err);
					reject(err);
				} else if (this.changes === 0) {
					reject(new Error('Pending request not found'));
				} else {
					resolve();
				}
			}
		);
	});
}
