import db from '../db/database.js';
import { Friendship } from '../types/friendship.js';
import { User } from '../types/user.js';

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
	return new Promise((resolve, reject) => {
		db.get(
		`SELECT * FROM users WHERE username = ?`,
		[username],
		(err: Error | null, row: unknown) => {
			if (err) {
				console.error('❌ Erro ao buscar utilizador:', err.message);
				reject(err);
			} 
			else
				resolve(row ? (row as User) : null);
		}
		);
	});
}

// Send friend request
export async function sendFriendRequest(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.get(
		`SELECT * FROM friendships 
		WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
		[userId, friendId, friendId, userId],
		(err: Error | null, row: unknown) => {
			if (err) {
				console.error('❌ Erro ao verificar amizade:', err.message);
				return reject(err);
			}

			if (row)
				return reject(new Error('⚠️ Pedido já existe ou utilizadores já são amigos'));

			db.run(
			`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')`,
			[userId, friendId],
				function (err: Error | null) {
					if (err){
					console.error('❌ Erro ao inserir pedido:', err.message);
					reject(err);
					}
					else 
						resolve();
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
		db.run(
			`UPDATE friendships SET status = 'accepted' 
			WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
			[friendId, userId],
			function (this: { changes: number }, err: Error | null) {
				if (err) {
					console.error('❌ Erro ao aceitar pedido:', err.message);
					return reject(err);
				}

				if (this.changes === 0)
					return reject(new Error('⚠️ Pedido pendente não encontrado'));

				db.run(
					`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'accepted')`,
					[userId, friendId],
					function (err: Error | null) {
						if (err) {
							console.error('❌ Erro ao criar relação inversa:', err.message);
							reject(err);
						} 
						else
							resolve();
					}
				);
			}
		);
		});
	});
}

// Get friends list
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

		db.all(query, [userId], (err: Error | null, rows: unknown[] | undefined) => {
			if (err) {
				console.error('❌ Erro ao buscar amigos:', err.message);
				reject(err);
			} 
			else
				resolve(rows || []);
		});
	});
}

// Get pending friend requests
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

		db.all(query, [userId], (err: Error | null, rows: unknown[] | undefined) => {
		if (err) {
			console.error('❌ Erro ao buscar pedidos pendentes:', err.message);
			reject(err);
		} 
		else
			resolve(rows || []);
		});
	});
}

// Remove friend (both directions)
export async function removeFriend(userId: number, friendId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
		`DELETE FROM friendships 
		WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
		[userId, friendId, friendId, userId],
		function (this: { changes: number }, err: Error | null) {
			if (err) {
				console.error('❌ Erro ao remover amigo:', err.message);
				reject(err);
			} 
			else if (this.changes === 0)
				reject(new Error('⚠️ Amizade não encontrada'));
			else
				resolve();
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
		function (this: { changes: number }, err: Error | null) {
			if (err) {
				console.error('❌ Erro ao rejeitar pedido:', err.message);
				reject(err);
			} 
			else if (this.changes === 0)
				reject(new Error('⚠️ Pedido pendente não encontrado'));
			else
				resolve();
		}
		);
	});
}