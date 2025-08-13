import sqlite3 from './sqlite-wrapper.js'; // use .js if compiled
const db = new sqlite3.Database('./database.db');
export default db;
