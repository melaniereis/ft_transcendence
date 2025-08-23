import db from '../db/database.js';
import { Friendship } from '../types/friendship.js';

export async function sendFriendRequest(u:number,f:number){
    return new Promise<void>((resolve, reject) => {
        db.get(`SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`, [u, f, f, u], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                reject(new Error('Friend request already exists or users are already friends'));
            } else {
                db.run(`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')`, [u, f], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        });
    });
}

export async function acceptFriendRequest(u:number,f:number){
    return new Promise<void>((resolve, reject) => {
        db.run(`UPDATE friendships SET status = 'accepted' WHERE user_id = ? AND friend_id = ? AND status = 'pending'`, [f, u], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('No pending friend request found'));
            } else {
                db.run(`INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'accepted')`, [u, f], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        });
    });
}

export async function getFriends(user_id: number): Promise<Friendship[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT f.*, u.name AS friend_name, u.username AS friend_username,
                u.display_name AS friend_display_name, u.avatar_url AS friend_avatar,
                u.online_status AS friend_online
                from friendships f JOIN users u ON f.friend_id = u.id
                WHERE f.user_id = ? AND f.status = 'accepted'
        `, [user_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows as Friendship[]);
            }
        });
    });
}

export async function getPendingRequests(user_id: number): Promise<Friendship[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT f.*, u.name AS friend_name, u.username AS friend_username,
                u.display_name AS friend_display_name, u.avatar_url AS friend_avatar,
                u.online_status AS friend_online
                from friendships f JOIN users u ON f.user_id = u.id
                WHERE f.friend_id = ? AND f.status = 'pending'
        `, [user_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows as Friendship[]);
            }
        });
    });
}

export async function removeFriend(u:number,f:number){
    return new Promise<void>((resolve, reject) => {
        db.run(`DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`, [u, f, f, u], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('No friendship found to remove'));
            } else {
                resolve();
            }
        });
    });
}