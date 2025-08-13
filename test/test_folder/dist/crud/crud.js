"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserByUsername = exports.getAllUsers = exports.createUser = void 0;
const database_1 = __importDefault(require("../database")); // Make sure this path matches your project structure
// 🟢 Create a new user
const createUser = (name, username, team) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO users (name, username, team) VALUES (?, ?, ?)`;
        database_1.default.run(query, [name, username, team], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.createUser = createUser;
// 🔵 Read all users
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        database_1.default.all(`SELECT * FROM users`, [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.getAllUsers = getAllUsers;
// 🔍 Read user by username
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        database_1.default.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
exports.getUserByUsername = getUserByUsername;
// 🟡 Update user info
const updateUser = (id, name, team) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET name = ?, team = ? WHERE id = ?`;
        database_1.default.run(query, [name, team, id], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.updateUser = updateUser;
// 🔴 Delete user
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        database_1.default.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=crud.js.map