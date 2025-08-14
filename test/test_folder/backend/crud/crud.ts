import db from '../db/database';
import { RunResult } from 'sqlite3';

// 🟢 Create a new user
export function createUser(name: string, username: string, team: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (name, username, team) VALUES (?, ?, ?)`;
    db.run(query, [name, username, team], function (err: Error | null) {
      if (err) reject(err);
      else resolve();
    });
  });
}

// 🔵 Read all users
export function getAllUsers(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users`, [], (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// 🔍 Read user by username
export function getUserByUsername(username: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// 🟡 Update user info
export function updateUser(id: number, name: string, team: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET name = ?, team = ? WHERE id = ?`;
    db.run(query, [name, team, id], function (err: Error | null) {
      if (err) reject(err);
      else resolve();
    });
  });
}

// 🔴 Delete user
export function deleteUser(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err: Error | null) {
      if (err) reject(err);
      else resolve();
    });
  });
}
