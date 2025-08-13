CREATE TABLE users(
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	username TEXT NOT NULL UNIQUE,
	team TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMNS status TEXT;

DROP TABLE users;

INSERT INTO user (name, username, team)
VALUES ('hugo', 'lopes', 'hacktivists');

INSERT INTO user (name, username, team)
VALUES ('ricardo', 'ricky', 'hacktivists'), ('rafa', 'rafasita', 'hacktivists') ;

SELECT * FROM users
WHERE username ='js';

UPDATE users set username = 'outro lopes' WHERE id = 1;

DELETE FROM users WHERE id = 2;

CREATE VIEW view_table AS
	SELECT * FROM users;

SELECT * view_table; 