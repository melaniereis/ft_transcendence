import { FastifyInstance } from "fastify";
import { getMatchHistory, getMatchHistoryPaginated, getMatchHistoryCount } from "../services/matchHistoryService.js";
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

    fastify.get('/api/match-history-paginated', async (req, reply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
          return reply.status(401).send({ error: 'Authorization header missing' });
    
        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        if (!userId)
          return reply.status(401).send({ error: 'Invalid token' });
    
        try {
          const query = req.query as { offset?: string; limit?: string };
          const offset = parseInt(query.offset || '0');
          const limit = Math.min(parseInt(query.limit || '10'), 50); // Max 50 per request
    
          const matches = await getMatchHistoryPaginated(userId, offset, limit);
          const totalCount = await getMatchHistoryCount(userId);
          const hasMore = offset + limit < totalCount;
    
          reply.send({
            matches,
            totalCount,
            hasMore,
            offset,
            limit
          });
        } catch (err) {
          reply.status(500).send({ error: 'Failed to fetch paginated match history' });
        }
      });
}
