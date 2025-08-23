import { FastifyInstance } from 'fastify';
import { sendFriendRequest, acceptFriendRequest, getPendingRequests, getFriends, removeFriend } from '../services/friendsService';
import { verifyToken } from '../services/authService.js';

export async function friendsRoutes(fastify: FastifyInstance) {
    fastify.post('/api/friends', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        const { friendId } = req.body as { friendId: number };

        try {
            await sendFriendRequest(userId, friendId);
            reply.status(201).send({ message: 'Friend request sent' });
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to send friend request' });
        }
    });

    fastify.post('/api/friends/accept', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        const { friendId } = req.body as { friendId: number };
        try {
            await acceptFriendRequest(userId, friendId);
            reply.send({ message: 'Friend request accepted' });
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to accept friend request' });
        }
    });

    fastify.get('/api/friends/requests', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            const friends = await getFriends(userId);
            reply.send(friends);
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to fetch friends' });
        }
    });

    fastify.post('/api/friends/requests', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            const requests = await getPendingRequests(userId);
            reply.send(requests);
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to fetch pending requests' });
        }
    }
    );

    fastify.delete('/api/friends/:friendId', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });
        
        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        const { friendId } = req.params as { friendId: string };
        try {
            await removeFriend(userId, Number(friendId));
            reply.send({ message: 'Friend removed' });
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to remove friend' });
        }
    });
    
}