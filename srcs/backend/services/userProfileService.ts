import db from '../db/database.js';
import { User } from '../types/user.js';
import * as bcrypt from 'bcrypt';

// Get user profile by ID
export async function getUserProfile(userId: number): Promise<Omit<User, 'password'> | null> {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, username, name, team, display_name, email, avatar_url, online_status, last_seen, created_at 
             FROM users WHERE id = ?`,
            [userId],
            (err: Error | null, row: unknown) => {
                if (err) {
                    console.error('❌ Erro ao buscar perfil:', err.message);
                    reject(err);
                } 
                else {
                    console.log('✅ Perfil encontrado:', row);
                    resolve(row ? (row as Omit<User, 'password'>) : null);
                }
            }
        );
    });
}

// Update user profile
export async function updateUserProfile(userId: number,
updates: Partial<Pick<User, 'username' | 'display_name' | 'email' | 'avatar_url'>>): Promise<void> {
    const entries = Object.entries(updates).filter(([_, value]) =>
        value !== undefined && value !== null && value !== ''
    );

    if (entries.length === 0)
        throw new Error('⚠️ Nenhum campo para atualizar');

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([_, value]) => value);

    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            [...values, userId],
            function (this: { changes: number }, err: Error | null) {
                if (err) {
                    console.error('❌ Erro ao atualizar perfil:', err.message);
                    reject(err);
                } 
                else if (this.changes === 0)
                    reject(new Error('⚠️ Utilizador não encontrado'));
                else
                    resolve();
            }
        );
    });
}

// Update user's online status
export async function updateOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET online_status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
            [isOnline ? 1 : 0, userId],
            function (this: { changes: number }, err: Error | null) {
                if (err) {
                    console.error('❌ Erro ao atualizar status online:', err.message);
                    reject(err);
                } 
                else if (this.changes === 0)
                    reject(new Error('⚠️ Utilizador não encontrado'));
                else
                    resolve();
            }
        );
    });
}

// Get user with stats
export async function getUserWithStats(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                u.id, u.username, u.name, u.team, u.display_name, u.email, 
                u.avatar_url, u.online_status, u.last_seen, u.created_at,
                COALESCE(s.matches_played, 0) as matches_played,
                COALESCE(s.matches_won, 0) as matches_won,
                COALESCE(s.matches_lost, 0) as matches_lost,
                COALESCE(s.points_scored, 0) as points_scored,
                COALESCE(s.points_conceded, 0) as points_conceded,
                COALESCE(s.win_rate, 0) as win_rate,
                COALESCE(s.tournaments_played, 0) as tournaments_played,
                COALESCE(s.tournaments_won, 0) as tournaments_won
            FROM users u
            LEFT JOIN user_stats s ON u.id = s.user_id
            WHERE u.id = ?
        `;

        db.get(query, [userId], (err: Error | null, row: unknown) => {
            if (err) {
                console.error('❌ Erro ao buscar utilizador com stats:', err.message);
                reject(err);
            } 
            else
                resolve(row || null);
        });
    });
}

// Change user password
export async function changeUserPassword(userId: number, currentPassword: string,
newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT password FROM users WHERE id = ?`,
            [userId],
            async (err: Error | null, row: unknown) => {
                if (err) {
                    console.error('❌ Erro ao buscar utilizador:', err.message);
                    return reject(err);
                }

                if (!row)
                    return reject(new Error('⚠️ Utilizador não encontrado'));

                const user = row as { password: string };

                try {
                    const match = await bcrypt.compare(currentPassword, user.password);
                    if (!match) {
                        return reject(new Error('⚠️ Password atual incorreta'));
                    }

                    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

                    db.run(
                        `UPDATE users SET password = ? WHERE id = ?`,
                        [hashedNewPassword, userId],
                        function (this: { changes: number }, err: Error | null) {
                            if (err) {
                                console.error('❌ Erro ao atualizar password:', err.message);
                                reject(err);
                            } 
                            else if (this.changes === 0)
                                reject(new Error('⚠️ Utilizador não encontrado'));
                            else
                                resolve();
                        }
                    );
                } 
                catch (bcryptErr) {
                    console.error('❌ Erro na comparação de password:', bcryptErr);
                    reject(bcryptErr);
                }
            }
        );
    });
}