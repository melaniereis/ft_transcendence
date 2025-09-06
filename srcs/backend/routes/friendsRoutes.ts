import { FastifyInstance } from 'fastify';
import { sendFriendRequest, acceptFriendRequest, getFriends, removeFriend, getUserByUsername, getPendingRequests, rejectFriendRequest } from '../services/friendsService.js';
import { verifyToken } from '../services/authService.js';

interface FriendRequestBody {
    friendUsername: string; // username of the friend to add
}

interface AcceptRequestBody {
    friendId: number;
}

export async function friendsRoutes(fastify: FastifyInstance) {

    fastify.post('/api/friends/request', async (req, reply) => {
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
            if (!userId)
                return reply.status(401).send({ error: 'Token inválido' });

            const { friendUsername } = req.body as FriendRequestBody;
            
            if (!friendUsername)
                return reply.status(400).send({ error: 'Username do amigo é obrigatório' });

            // Check if friend exists
            const friend = await getUserByUsername(friendUsername);
            if (!friend)
                return reply.status(404).send({ error: 'Utilizador não encontrado' });

            if (friend.id === userId)
                return reply.status(400).send({ error: 'Não podes adicionar-te a ti próprio' });

            await sendFriendRequest(userId, friend.id);
            reply.status(201).send({ 
                success: true, 
                message: `Pedido de amizade enviado para ${friendUsername}` 
            });
        } 
        catch (err: any) {
            console.error('Erro ao enviar pedido:', err);
            if (err.message.includes('already exists'))
                reply.status(409).send({ error: 'Pedido já existe ou já são amigos' });
            else
                reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // Accept friend request
    fastify.post('/api/friends/accept', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Header de autorização em falta' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return reply.status(401).send({ error: 'Token em falta' });

        try {
            const userId = await verifyToken(token);
            if (!userId)
                return reply.status(401).send({ error: 'Token inválido' });

            const { friendId } = req.body as AcceptRequestBody;
            
            if (!friendId || typeof friendId !== 'number')
                return reply.status(400).send({ error: 'ID do amigo é obrigatório e deve ser número' });

            await acceptFriendRequest(userId, friendId);
            reply.send({ 
                success: true, 
                message: 'Pedido de amizade aceite' 
            });
        } 
        catch (err: any) {
            console.error('Erro ao aceitar pedido:', err);
            if (err.message.includes('No pending'))
                reply.status(404).send({ error: 'Pedido pendente não encontrado' });
            else
                reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // List friends
    fastify.get('/api/friends', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Header de autorização em falta' });

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ error: 'Token em falta' });
        }

        try {
            const userId = await verifyToken(token);
            if (!userId)
                return reply.status(401).send({ error: 'Token inválido' });

            const friends = await getFriends(userId);
            reply.send({ friends });
        } 
        catch (err: any) {
            console.error('Erro ao buscar amigos:', err);
            reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    
    // Get pending friend requests
    fastify.get('/api/friends/pending', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Header de autorização em falta' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return reply.status(401).send({ error: 'Token em falta' });

        try {
            const userId = await verifyToken(token);
            if (!userId)
                return reply.status(401).send({ error: 'Token inválido' });

            const pendingRequests = await getPendingRequests(userId);
            reply.send({ pending: pendingRequests });
        } 
        catch (err: any) {
            console.error('Erro ao buscar pedidos pendentes:', err);
            reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // Reject friend request
    fastify.post('/api/friends/reject', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Header de autorização em falta' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return reply.status(401).send({ error: 'Token em falta' });

        try {
            const userId = await verifyToken(token);
            if (!userId)
                return reply.status(401).send({ error: 'Token inválido' });

            const { friendId } = req.body as { friendId: number };
            
            if (!friendId || typeof friendId !== 'number')
                return reply.status(400).send({ error: 'ID do amigo é obrigatório e deve ser número' });

            await rejectFriendRequest(userId, friendId);
            reply.send({ 
                success: true, 
                message: 'Pedido de amizade rejeitado' 
            });
        } 
        catch (err: any) {
            console.error('Erro ao rejeitar pedido:', err);
            if (err.message.includes('No pending'))
                reply.status(404).send({ error: 'Pedido pendente não encontrado' });
            else
                reply.status(500).send({ error: 'Erro interno do servidor' });
        }
    });

    // Remove friend
    fastify.delete('/api/friends/:friendId', async (req, reply) => {
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

            const { friendId } = req.params as { friendId: string };
            const friendIdNum = parseInt(friendId);
            
            if (isNaN(friendIdNum)) {
                return reply.status(400).send({ error: 'ID do amigo inválido' });
            }

            await removeFriend(userId, friendIdNum);
            reply.send({ 
                success: true, 
                message: 'Amigo removido com sucesso' 
            });
        } 
        catch (err: any) {
            console.error('Erro ao remover amigo:', err);
            if (err.message.includes('No friendship found')) {
                reply.status(404).send({ error: 'Amizade não encontrada' });
            } else {
                reply.status(500).send({ error: 'Erro interno do servidor' });
            }
        }
    });
}