import db from ../db/database.js;
import { User } from '../types/user.js';

export async function getUserProfile(userId: number)
: Promise<Omit<User, 'password'> | null> {
  return new Promise((resolve, reject) => {
    return new Promise (resolve => {
    db.get(`SELECT id, username, team, display_name, email, avatar_url, online_status, last_seen, created_at FROM users WHERE id = ?`, [userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
    });
    });
}

export async function updateUserProfile(userId: number, updates: 
    Partial<Pick<User, 'username' |'display_name' | 'email' | 'avatar_url'>>) {
        const entries = Object.entries(updates).filter(([_, v]) => v !== undefined && v !== null);
        if (entries.length) return;
        const set = entries.map(([k]) => `${k} = ?`).join(', ');
        const values = entries.map(([_, v]) => v);
        await new Promise<void>((resolve, reject) => {
            db.run(`UPDATE users SET ${set} WHERE id = ?`, [...values, userId], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

}

export async function updateOnlineStatus(userId: number, onlineStatus: boolean) {
    await new Promise<void>((resolve, reject) => {
        db.run(`UPDATE users SET online_status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
        [onlineStatus ? 1 : 0, userId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}