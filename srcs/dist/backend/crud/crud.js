// crud/userService.ts
import db from '../db/database.js';
import bcrypt from 'bcrypt';
// Manually promisify db.run
function runAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// Manually promisify db.get
function getAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
// Manually promisify db.all
function allAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
// 🟢 Create a new user with hashed password
export async function createUser(name, username, team, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, username, team, password) VALUES (?, ?, ?, ?)`;
    await runAsync(query, [name, username, team, hashedPassword]);
}
// 🔵 Get all users
export async function getAllUsers() {
    const query = `SELECT * FROM users`;
    return await allAsync(query);
}
// 🔍 Get user by username
export async function getUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    return await getAsync(query, [username]);
}
// 🟡 Update user info (not password)
export async function updateUser(id, name, team) {
    const query = `UPDATE users SET name = ?, team = ? WHERE id = ?`;
    await runAsync(query, [name, team, id]);
}
// 🔴 Delete user
export async function deleteUser(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    await runAsync(query, [id]);
}
