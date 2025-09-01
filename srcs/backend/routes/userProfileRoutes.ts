//routes/userProfileRoutes.ts
import { FastifyInstance } from 'fastify';
import { 
    getUserProfile, 
    updateUserProfile, 
    updateOnlineStatus, 
    getUserWithStats, 
    changeUserPassword
} from '../services/userProfileService.js';
import { verifyToken } from '../services/authService.js';

interface UpdateProfileRequest {
    username?: string;
    display_name?: string;
    email?: string;
    avatar_url?: string;
}

interface UpdateStatusRequest {
    online: boolean;
}

export async function userProfileRoutes(fastify: FastifyInstance) {
    
    // Obtain user profile 
    fastify.get('/api/profile', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Header de autorização em falta' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId) {
                return reply.status(401).send({ error: 'Token inválido' });
            }

            const userProfile = await getUserProfile(userId);
            if (!userProfile) {
                return reply.status(404).send({ error: 'Perfil não encontrado' });
            }

            reply.send(userProfile);
        } 
        catch (err: any) {
            console.error('Erro ao buscar perfil:', err);
            reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // Obtain profile with stats
    fastify.get('/api/profile/stats', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Header de autorização em falta' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId) {
                return reply.status(401).send({ error: 'Token inválido' });
            }

            const userWithStats = await getUserWithStats(userId);
            if (!userWithStats) {
                return reply.status(404).send({ error: 'Utilizador não encontrado' });
            }

            reply.send(userWithStats);
        } 
        catch (err: any) {
            console.error('Erro ao buscar perfil com stats:', err);
            reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // Update user profile
    fastify.put('/api/profile', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Header de autorização em falta' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId) {
                return reply.status(401).send({ error: 'Token inválido' });
            }

            const updates = req.body as UpdateProfileRequest;
            
            // Basic validation
            if (updates.email && !updates.email.includes('@')) {
                return reply.status(400).send({ error: 'Email inválido' });
            }

            if (updates.username && updates.username.length < 3) {
                return reply.status(400).send({ error: 'Username deve ter pelo menos 3 caracteres' });
            }

            await updateUserProfile(userId, updates);
            reply.send({ success: true, message: 'Perfil atualizado com sucesso' });
        } 
        catch (err: any) {
            console.error('Erro ao atualizar perfil:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                reply.status(409).send({ error: 'Username ou email já existe' });
            } else {
                reply.status(500).send({ error: err.message || 'Erro interno do servidor' });
            }
        }
    });

    // Update online status
    fastify.post('/api/profile/status', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Header de autorização em falta' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId) {
                return reply.status(401).send({ error: 'Token inválido' });
            }

            const { online } = req.body as UpdateStatusRequest;
            
            if (typeof online !== 'boolean') {
                return reply.status(400).send({ error: 'Campo "online" deve ser boolean' });
            }

            await updateOnlineStatus(userId, online);
            reply.send({ 
                success: true, 
                message: `Status alterado para ${online ? 'online' : 'offline'}` 
            });
        } 
        catch (err: any) {
            console.error('Erro ao atualizar status:', err);
            reply.status(500).send({ error: err.message || 'Erro interno do servidor' });
        }
    });

    // Change password
    fastify.post('/api/profile/change-password', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ error: 'Header de autorização em falta' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId) {
                return reply.status(401).send({ error: 'Token inválido' });
            }

            const { currentPassword, newPassword } = req.body as { 
                currentPassword: string; 
                newPassword: string;
            };
            
            if (!currentPassword || !newPassword) {
                return reply.status(400).send({ error: 'Password atual e nova são obrigatórias' });
            }

            if (newPassword.length < 6) {
                return reply.status(400).send({ error: 'Nova password deve ter pelo menos 6 caracteres' });
            }

            await changeUserPassword(userId, currentPassword, newPassword);
            reply.send({ 
                success: true, 
                message: 'Password alterada com sucesso' 
            });
        } 
        catch (err: any) {
            console.error('Erro ao alterar password:', err);
            if (err.message.includes('Password atual incorreta')) {
                reply.status(400).send({ error: 'Password atual incorreta' });
            } else {
                reply.status(500).send({ error: 'Erro interno do servidor' });
            }
        }
    });
}