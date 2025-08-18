import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame, endGame, getPlayersFromGame } from '../services/gameService.js';
import { updateUserStatsAfterGame } from '../services/statsService.js';

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
		} 
		catch (err) {
			console.error('Game creation error:', err);
			reply.status(500).send({ error: 'Failed to create game' });
		}
	});

	fastify.put('/games/:gameId/end', async (req: FastifyRequest, reply: FastifyReply) => {
		const { gameId } = req.params as { gameId: string };
		const { score_player1, score_player2 } = req.body as {
			score_player1: number;
			score_player2: number;
		};

		try {
			await endGame(gameId, score_player1, score_player2);

			const gameIdNum = Number(gameId);
			const { player1Id, player2Id } = await getPlayersFromGame(gameIdNum);
			await updateUserStatsAfterGame(gameIdNum, player1Id, player2Id, score_player1, score_player2);

			reply.status(200).send({ message: 'Game ended successfully' });
		} 
		catch (err) {
			console.error('Game ending error:', err);
			reply.status(500).send({ error: 'Failed to end game' });
		}
	});
}