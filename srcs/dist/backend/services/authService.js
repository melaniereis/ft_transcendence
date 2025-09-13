import db from '../db/database.js';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
export async function registerUser({ username, password, name, team }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (username, password, name, team) VALUES (?, ?, ?, ?)`, [username, hashedPassword, name, team], function (err) {
            if (err)
                reject(err);
            else
                resolve({ id: this.lastID });
        });
    });
}
export async function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, userRaw) => {
            if (err || !userRaw)
                return resolve(null);
            const user = userRaw;
            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return resolve(null);
            const token = uuidv4();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`, [user.id, token, expiresAt], function (err) {
                if (err)
                    reject(err);
                else
                    resolve({ token });
            });
        });
    });
}
export async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM sessions WHERE token = ?`, [token], (err, sessionRaw) => {
            if (err || !sessionRaw)
                return resolve(null);
            const session = sessionRaw;
            const isExpired = new Date(session.expires_at) < new Date();
            if (isExpired)
                return resolve(null);
            resolve(session.user_id);
        });
    });
}
