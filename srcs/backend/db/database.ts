import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite');
  }
});

  // Users table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      team TEXT NOT NULL
    )
  `);
});

  // Tournaments table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_winner TEXT NOT NULL,
      team_victories INTEGER NOT NULL,
      size INTEGER NOT NULL,
      date_created TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

  // hacktivists table
db.serialize(() => {
  db.run(`
  CREATE TABLE hacktivists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    members TEXT NOT NULL,
    victories INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0
    )
  `);
});

// Bug busters table
db.serialize(() => {
  db.run(`
  CREATE TABLE bug_busters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    members TEXT NOT NULL,
    victories INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0
    )
  `);
});

// Logic league table
db.serialize(() => {
  db.run(`
  CREATE TABLE logic_league (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    members TEXT NOT NULL,
    victories INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0
    )
  `);
});

// Code allience table
db.serialize(() => {
  db.run(`
  CREATE TABLE code_allience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    members TEXT NOT NULL,
    victories INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0
    )
  `);
});

// User stats table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INTEGER PRIMARY KEY,
      matches_played INTEGER DEFAULT 0,
      matches_won INTEGER DEFAULT 0,
      matches_lost INTEGER DEFAULT 0,
      points_scored INTEGER DEFAULT 0,
      points_conceded INTEGER DEFAULT 0,
      total_play_time INTEGER DEFAULT 0, -- in seconds
      win_rate REAL DEFAULT 0.0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

db.serialize(() => {
db.run(`
	CREATE TABLE IF NOT EXISTS games (
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
	FOREIGN KEY (winner_id) REFERENCES users(id)
	)
`);
});

export default db;