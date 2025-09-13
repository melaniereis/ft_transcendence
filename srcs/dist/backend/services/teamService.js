import db from '../db/database.js';
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
export function createTeamMember(table, members) {
    const query = `INSERT INTO ${table} (members) VALUES (?)`;
    return runAsync(query, [members]);
}
export function getAllTeamMembers(table) {
    const query = `SELECT * FROM ${table}`;
    return allAsync(query);
}
export function getTeamMemberById(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    return getAsync(query, [id]);
}
export function updateTeamMember(table, id, members, victories, tournaments_won, defeats, win_rate) {
    const query = `UPDATE ${table} SET members = ?, victories = ?, tournaments_won = ?, defeats = ?, win_rate = ? WHERE id = ?`;
    return runAsync(query, [members, victories, tournaments_won, defeats, win_rate, id]);
}
export function deleteTeamMember(table, id) {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    return runAsync(query, [id]);
}
