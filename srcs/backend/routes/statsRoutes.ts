//routes/statsRoutes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllUserStats, getUserStatsById } from '../services/statsService.js'; 

export async function statsRoutes(fastify: FastifyInstance) {
    fastify.get('/stats', async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            const stats = await getAllUserStats();
            reply.send(stats);
        } 
        catch (err) {
            console.error('Error fetching all user stats:', err);
            reply.status(500).send({ error: 'Failed to fetch user stats' });
        }
    });

    fastify.get('/stats/:userId', async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: string };

        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            reply.status(400).send({ error: 'Invalid user ID' });
            return;
        }

        try {
            const stats = await getUserStatsById(userIdNum);
            reply.send(stats);
        } 
        catch (err) {
            console.error(`Error fetching stats for user ${userIdNum}:`, err);
            reply.status(404).send({ error: `Stats not found for user ${userIdNum}` });
        }
    });
}