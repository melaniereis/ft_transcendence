import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame } from '../services/gameService.js';

export async function gameRoutes(fastify: FastifyInstance) {
fastify.post('/games', async (req: FastifyRequest, reply: FastifyReply) => {
	const { player1_id, player2_id, max_games, time_started } = req.body as {
	player1_id: number;
	player2_id: number;
	max_games: number;
	time_started: string;
	};

	try {
	const gameId = await createGame(player1_id, player2_id, max_games, time_started);
	reply.status(201).send({ message: 'Game created', game_id: gameId });
	} catch (err) {
	console.error('Game creation error:', err);
	reply.status(500).send({ error: 'Failed to create game' });
	}
});
}
