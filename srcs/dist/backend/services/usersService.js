import db from '../db/database.js';
import bcrypt from 'bcrypt';
import { createTeamMember } from './teamService.js';
import { createUserStats } from './statsService.js';
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
const validTeams = {
    'HACKTIVISTS': 'hacktivists',
    'BUG BUSTERS': 'bug_busters',
    'LOGIC LEAGUE': 'logic_league',
    'CODE ALLIANCE': 'code_alliance'
};
export async function createUser(name, username, team, password) {
    const teamKey = validTeams[team.toUpperCase()];
    if (!teamKey)
        throw new Error('Invalid team name');
    const existingUser = await getUserByUsername(username);
    if (existingUser)
        throw new Error('Username already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, username, team, password) VALUES (?, ?, ?, ?)`;
    await runAsync(query, [name, username, team, hashedPassword]);
    await createTeamMember(teamKey, username);
    const newUser = await getUserByUsername(username);
    if (!newUser)
        throw new Error('Failed to retrieve newly created user');
    const userId = newUser.id;
    await createUserStats(userId);
}
export async function getAllUsers() {
    const query = `SELECT * FROM users`;
    return await allAsync(query);
}
export async function getUserById(userId) {
    const query = `SELECT * FROM users WHERE id = ?`;
    return await getAsync(query, [userId]);
}
export async function getUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    return await getAsync(query, [username]);
}
export async function updateUser(id, name, team) {
    const query = `UPDATE users SET name = ?, team = ? WHERE id = ?`;
    await runAsync(query, [name, team, id]);
}
export async function deleteUser(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    await runAsync(query, [id]);
}
