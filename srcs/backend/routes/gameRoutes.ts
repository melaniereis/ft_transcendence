import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame, endGame, getPlayersFromGame, getGameById } from '../services/gameService.js';
import { updateUserStatsAfterGame } from '../services/statsService.js';
import { syncUserStatsToTeam } from '../services/teamService.js';
import { createMatchHistoryRecord } from '../services/matchHistoryService.js';
import db from '../db/database.js';
import { authHook } from '../hooks/auth.js';
export async function gameRoutes(fastify: FastifyInstance) {

	fastify.get('/games/:gameId', {
		preHandler: authHook,
		handler: async (req: FastifyRequest, reply: FastifyReply) => {
			const { gameId } = req.params as { gameId: string };

			try {
				const game = await getGameById(Number(gameId));
				if (!game) {
					console.warn(`⚠️ Game ${gameId} not found`);
					return reply.status(404).send({ error: 'Game not found' });
				}

				reply.send({
					game_id: game.game_id, player1_id: game.player1_id, player2_id: game.player2_id,
					score_player1: game.score_player1, score_player2: game.score_player2, winner_id: game.winner_id,
					time_started: game.time_started, time_ended: game.time_ended
				});
			}
			catch (err) {
				console.error('❌ Error fetching game:', err);
				reply.status(500).send({ error: 'Failed to retrieve game data' });
			}
		}
	});

	fastify.post('/games', {
		preHandler: authHook,
		handler: async (req: FastifyRequest, reply: FastifyReply) => {
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
				console.error('❌ Game creation error:', err);
				reply.status(500).send({ error: 'Failed to create game' });
			}
		}
	});

	fastify.put('/games/:gameId/end', {
		preHandler: authHook,
		handler: async (req: FastifyRequest, reply: FastifyReply) => {
			const { gameId } = req.params as { gameId: string };
			const { score_player1, score_player2 } = req.body as { score_player1: number; score_player2: number };

			const userId = (req as any).userId;
			console.log('🔐 Authenticated user ending game:', userId);

			if (typeof score_player1 !== 'number' || typeof score_player2 !== 'number') {
				return reply.status(400).send({ error: 'Scores must be numbers' });
			}

			try {
				await endGame(gameId, score_player1, score_player2);

				const gameIdNum = Number(gameId);
				const { player1Id, player2Id } = await getPlayersFromGame(gameIdNum);

				const winnerId =
					score_player1 > score_player2 ? player1Id :
						score_player2 > score_player1 ? player2Id :
							null;

				if (winnerId !== null)
					await db.run('UPDATE games SET winner_id = ? WHERE game_id = ?', [winnerId, gameIdNum]);
				else
					await db.run('UPDATE games SET winner_id = NULL WHERE game_id = ?', [gameIdNum]);

				await updateUserStatsAfterGame(gameIdNum, player1Id, player2Id, score_player1, score_player2);
				await syncUserStatsToTeam(player1Id);
				await syncUserStatsToTeam(player2Id);

				await createMatchHistoryRecord(gameIdNum, player1Id, player2Id, score_player1, score_player2, 0);
				await createMatchHistoryRecord(gameIdNum, player2Id, player1Id, score_player2, score_player1, 0);

				reply.status(200).send({ message: 'Game ended successfully', winner_id: winnerId });
			}
			catch (err) {
				console.error('Game ending error:', err);
				reply.status(500).send({ error: 'Failed to end game' });
			}
		}
	});
}
