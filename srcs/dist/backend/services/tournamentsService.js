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
export function createTournament(name, team_winner, team_victories, size) {
    const query = `INSERT INTO tournaments (name, team_winner, team_victories, size)
	VALUES (?, ?, ?, ?)`;
    return runAsync(query, [name, team_winner, team_victories, size]);
}
export function getAllTournaments() {
    const query = `SELECT * FROM tournaments`;
    return allAsync(query);
}
export function getTournamentById(id) {
    const query = `SELECT * FROM tournaments WHERE id = ?`;
    return getAsync(query, [id]);
}
export function updateTournament(id, name, team_winner, team_victories, size) {
    const query = `UPDATE tournaments SET name = ?, team_winner = ?, team_victories = ?, size = ?
	WHERE id = ?`;
    return runAsync(query, [name, team_winner, team_victories, size, id]);
}
export function deleteTournament(id) {
    const query = `DELETE FROM tournaments WHERE id = ?`;
    return runAsync(query, [id]);
}
