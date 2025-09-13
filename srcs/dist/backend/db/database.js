import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
sqlite3.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err)
        console.error('Failed to connect to database:', err.message);
    else
        console.log('Connected to SQLite');
});
db.serialize(() => {
    //USERS
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        team TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //TOURN
    db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team_winner TEXT NOT NULL,
        team_victories INTEGER NOT NULL,
        size INTEGER NOT NULL,
        date_created TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //HACKTI
    db.run(`CREATE TABLE IF NOT EXISTS hacktivists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        members TEXT NOT NULL UNIQUE,
        victories INTEGER DEFAULT 0,
        tournaments_won INTEGER DEFAULT 0,
        defeats INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //BUG BUS
    db.run(`CREATE TABLE IF NOT EXISTS bug_busters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        members TEXT NOT NULL UNIQUE,
        victories INTEGER DEFAULT 0,
        tournaments_won INTEGER DEFAULT 0,
        defeats INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //LOGIC LEA
    db.run(`CREATE TABLE IF NOT EXISTS logic_league (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        members TEXT NOT NULL UNIQUE,
        victories INTEGER DEFAULT 0,
        tournaments_won INTEGER DEFAULT 0,
        defeats INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //CODE AL
    db.run(`CREATE TABLE IF NOT EXISTS code_alliance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        members TEXT NOT NULL UNIQUE,
        victories INTEGER DEFAULT 0,
        tournaments_won INTEGER DEFAULT 0,
        defeats INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
    //USER STATS 
    db.run(`CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        matches_played INTEGER DEFAULT 0,
        matches_won INTEGER DEFAULT 0,
        matches_lost INTEGER DEFAULT 0,
        points_scored INTEGER DEFAULT 0,
        points_conceded INTEGER DEFAULT 0,
        total_play_time INTEGER DEFAULT 0, -- in seconds
        win_rate REAL DEFAULT 0.0,
        tournaments_played INTEGER DEFAULT 0,
        tournaments_won INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id))`);
    //GAMES
    db.run(`CREATE TABLE IF NOT EXISTS games (
        game_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        max_games INTEGER NOT NULL,
        score_player1 INTEGER DEFAULT 0,
        score_player2 INTEGER DEFAULT 0,
        time_started TEXT NOT NULL,
        time_ended TEXT,
        winner_id INTEGER,
        match_duration INTEGER DEFAULT 0,
        date_played TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id),
        FOREIGN KEY (winner_id) REFERENCES users(id))`);
    //SESSIONS
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id))`);
});
export default db;
