import { FastifyInstance } from 'fastify';
import { getUserProfile, updateUserProfile, updateOnlineStatus } from '../services/userProfileService.js';
import { verifyToken } from '../services/authService.js';

export async function userProfileRoutes(fastify: FastifyInstance) {
    fastify.get('/api/profile', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            const userProfile = await getUserProfile(userId);
            reply.send(userProfile);
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to fetch user profile' });
        }
    });

    fastify.put('/api/profile', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            await updateUserProfile(userId, req.body as any);
            reply.send({ success: true });
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to update user profile' });
        }
    });

    fastify.post('/api/status', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            await updateOnlineStatus(userId, req.body as any);
            reply.send({ success: true });
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to update online status' });
        }
    });
}
