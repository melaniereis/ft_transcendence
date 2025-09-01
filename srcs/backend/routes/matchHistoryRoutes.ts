import { FastifyInstance } from "fastify";
import { getMatchHistory } from "../services/matchHistoryService.js";
import { verifyToken } from "../services/authService.js";

export async function matchHistoryRoutes(fastify: FastifyInstance) {
    fastify.get('/api/match-history', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return reply.status(401).send({ error: 'Authorization header missing' });

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
            return reply.status(401).send({ error: 'Invalid token' });

        try {
            const history = await getMatchHistory(userId);
            reply.send(history);
        } 
        catch (err) {
            reply.status(500).send({ error: 'Failed to fetch match history' });
        }
    });
}
