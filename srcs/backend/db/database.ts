    import sqlite3 from 'sqlite3';
    import path from 'path';
    import { fileURLToPath } from 'url';

    sqlite3.verbose();

    const __filename = fileURLToPath(import.meta.url);

    const __dirname = path.dirname(__filename);

    const dbPath = path.join(__dirname, '..' , '..', '..', 'data', 'database.db');

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err)
            console.error('Failed to connect to database:', err.message);
        else 
            console.log('Connected to SQLite');
    });

    db.serialize(() => {
        // USERS - Com campo TEAM corrigido
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            team TEXT NOT NULL,
            display_name TEXT,
            email TEXT UNIQUE,
            avatar_url TEXT DEFAULT '/assets/default-avatar.png',
            online_status INTEGER DEFAULT 0,
            last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // TOURNAMENTS
        db.run(`CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            player1_id INTEGER,
            player2_id INTEGER,
            player3_id INTEGER,
            player4_id INTEGER,
            semifinal1_player1_id INTEGER,
            semifinal1_player2_id INTEGER,
            semifinal1_winner_id INTEGER,
            semifinal2_player1_id INTEGER,
            semifinal2_player2_id INTEGER,
            semifinal2_winner_id INTEGER,
            final_player1_id INTEGER,
            final_player2_id INTEGER,
            winner_id INTEGER,
            size INTEGER NOT NULL,
            date_created TEXT DEFAULT CURRENT_TIMESTAMP);`);
    //HACKTI
        db.run(`CREATE TABLE IF NOT EXISTS hacktivists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            members TEXT NOT NULL UNIQUE,
            victories INTEGER DEFAULT 0,
            tournaments_won INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS bug_busters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            members TEXT NOT NULL UNIQUE,
            victories INTEGER DEFAULT 0,
            tournaments_won INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS logic_league (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            members TEXT NOT NULL UNIQUE,
            victories INTEGER DEFAULT 0,
            tournaments_won INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS code_alliance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            members TEXT NOT NULL UNIQUE,
            victories INTEGER DEFAULT 0,
            tournaments_won INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // USER STATS 
        db.run(`CREATE TABLE IF NOT EXISTS user_stats (
            user_id INTEGER PRIMARY KEY,
            matches_played INTEGER DEFAULT 0,
            matches_won INTEGER DEFAULT 0,
            matches_lost INTEGER DEFAULT 0,
            points_scored INTEGER DEFAULT 0,
            points_conceded INTEGER DEFAULT 0,
            total_play_time INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0.0,
            tournaments_played INTEGER DEFAULT 0,
            tournaments_won INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // GAMES
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
            FOREIGN KEY (winner_id) REFERENCES users(id)
        )`);

        // SESSIONS
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // FRIENDSHIPS
        db.run(`CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT CHECK(status IN ('pending','accepted','blocked')) DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, friend_id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(friend_id) REFERENCES users(id)
        )`);

        // MATCH HISTORY
        db.run(`CREATE TABLE IF NOT EXISTS match_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            opponent_id INTEGER NOT NULL,
            user_score INTEGER NOT NULL,
            opponent_score INTEGER NOT NULL,
            result TEXT CHECK(result IN ('win','loss')) NOT NULL,
            duration INTEGER DEFAULT 0,
            date_played TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('📋 Database tables created successfully');
    });

    export default db;