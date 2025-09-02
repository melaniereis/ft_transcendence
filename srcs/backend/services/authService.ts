import db from '../db/database.js';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/user.js';
import { Session } from '../types/session.js';

export async function registerUser({username, password, name, team, display_name, email,}: {
username: string;
password: string;
name: string;
team: string;
display_name?: string;
email?: string;
}): Promise<{ id: number }> {
	const hashedPassword = await bcrypt.hash(password, 10);

	return new Promise((resolve, reject) => {
		db.run(
		`INSERT INTO users (username, password, name, team, display_name, email) 
		VALUES (?, ?, ?, ?, ?, ?)`,
		[username, hashedPassword, name, team, display_name || null, email || null],
		function (this: { lastID: number }, err: Error | null) {
			if (err) {
				console.error('❌ Erro ao inserir utilizador:', err.message);
				reject(err);
			} 
			else {
				console.log('✅ Novo utilizador criado com sucesso');
				resolve({ id: this.lastID });
			}
		}
		);
	});
}

export async function loginUser(username: string, password: string):
 Promise<{ token: string; user: { id: number; username: string } } | null> {
	return new Promise((resolve, reject) => {
		db.get(
		`SELECT * FROM users WHERE username = ?`,
		[username],
		async (err: Error | null, userRaw: unknown) => {
			if (err) {
				console.error('❌ Erro na consulta de utilizador:', err.message);
				return reject(err);
			}

			if (!userRaw) {
				console.log('⚠️ Utilizador não encontrado');
				return resolve(null);
			}

			const user = userRaw as User;

			try {
				const match = await bcrypt.compare(password, user.password);
				if (!match) {
					console.log(`⚠️ Password incorreta para o utilizador ${username}`);
					return resolve(null);
				}

				const token = uuidv4();
				const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

				db.run(
					`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
					[user.id, token, expiresAt],
					function (this: { lastID?: number }, err: Error | null) {
					if (err) {
						console.error('❌ Erro ao criar sessão:', err.message);
						reject(err);
					} else {
						resolve({
						token,
						user: {
							id: user.id,
							username: user.username,
						},
						});
					}
					}
				);
			} 
			catch (bcryptErr) {
				console.error('❌ Erro na comparação de password:', bcryptErr);
				reject(bcryptErr);
			}
		});
	});
}

export async function verifyToken(token: string): Promise<number | null> {
	return new Promise((resolve, reject) => {
		db.get(
		`SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`,
		[token],
		(err: Error | null, sessionRaw: unknown) => {
			if (err) {
				console.error('❌ Erro na verificação do token:', err.message);
				return reject(err);
			}

			if (!sessionRaw)
			return resolve(null);

			const session = sessionRaw as Session;
			resolve(session.user_id);
		}
		);
	});
}

export async function cleanExpiredSessions(): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(
		`DELETE FROM sessions WHERE expires_at < datetime('now')`,
		[],
		function (this: { changes: number }, err: Error | null) {
			if (err) {
				console.error('❌ Erro ao limpar sessões expiradas:', err.message);
				reject(err);
			} 
			else {
				console.log(`🧹 ${this.changes} sessões expiradas removidas`);
				resolve();
			}
		}
		);
	});
}