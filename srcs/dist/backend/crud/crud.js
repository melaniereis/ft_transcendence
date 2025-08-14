import db from '../db/database';
// 🟢 Create a new user
export function createUser(name, username, team) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO users (name, username, team) VALUES (?, ?, ?)`;
        db.run(query, [name, username, team], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// 🔵 Read all users
export function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users`, [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
// 🔍 Read user by username
export function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
// 🟡 Update user info
export function updateUser(id, name, team) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET name = ?, team = ? WHERE id = ?`;
        db.run(query, [name, team, id], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// 🔴 Delete user
export function deleteUser(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
