import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame, endGame, getPlayersFromGame, getGameById } from '../services/gameService.js';
import { updateUserStatsAfterGame, getUserStatsById } from '../services/statsService.js';
import { updateTeamMember } from '../services/teamService.js';
import { getUserById } from '../services/usersService.js';
import  db  from '../db/database.js';

export async function gameRoutes(fastify: FastifyInstance) {
	fastify.get('/games/:gameId', async (req: FastifyRequest, reply: FastifyReply) => {
		const { gameId } = req.params as { gameId: string };

		try {
			const game = await getGameById(Number(gameId));

			if (!game)
				return reply.status(404).send({ error: 'Game not found' });
			reply.send({
				game_id: game.game_id,
				player1_id: game.player1_id,
				player2_id: game.player2_id,
				score_player1: game.score_player1,
				score_player2: game.score_player2,
				winner_id: game.winner_id,
				time_started: game.time_started,
				time_ended: game.time_ended
			});
		} 
		catch (err) {
			console.error('Error fetching game:', err);
			reply.status(500).send({ error: 'Failed to retrieve game data' });
		}
	});

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

	fastify.put('/games/:gameId/end', async (req, reply) => {
		const { gameId } = req.params as { gameId: string };
		const { score_player1, score_player2 } = req.body as {
			score_player1: number;
			score_player2: number;
		};

		try {
			await endGame(gameId, score_player1, score_player2);

			const gameIdNum = Number(gameId);
			const { player1Id, player2Id } = await getPlayersFromGame(gameIdNum);

			const winnerId = score_player1 > score_player2 ? player1Id :
			score_player2 > score_player1 ? player2Id : null;

			if (winnerId)
				await db.run('UPDATE games SET winner_id = ? WHERE game_id = ?', [winnerId, gameIdNum]);

			await updateUserStatsAfterGame(gameIdNum, player1Id, player2Id, score_player1, score_player2);
			await syncUserStatsToTeam(player1Id);
			await syncUserStatsToTeam(player2Id);

			reply.status(200).send({ message: 'Game ended successfully', winner_id: winnerId });
		} 
		catch (err) {
			console.error('Game ending error:', err);
			reply.status(500).send({ error: 'Failed to end game' });
		}
	});
}

const validTeams = {
	'HACKTIVISTS': 'hacktivists',
	'BUG BUSTERS': 'bug_busters',
	'LOGIC LEAGUE': 'logic_league',
	'CODE ALLIANCE': 'code_alliance'
};

export async function syncUserStatsToTeam(id: number): Promise<void> {
	const user = await getUserById(id);
	if (!user) 
		throw new Error(`User ${id} not found`);

	const teamTable = validTeams[user.team.toUpperCase() as keyof typeof validTeams];

	if (!teamTable)
		throw new Error(`Invalid team name: ${user.team}`);

	const stats = await getUserStatsById(user.id);
	const winRate = stats.matches_played > 0 ? (stats.matches_won / stats.matches_played) * 100 : 0;
	
	console.log('teamTable:', teamTable,'| user.id:', user.id, '| user.username:', user.username,
	'| stats.matches_won:', stats.matches_won, '| stats.tournaments_won:', stats.tournaments_won,
	'| stats.matches_lost:', stats.matches_lost,'| winRate:', winRate,);

	await updateTeamMember(teamTable, user.id, user.username, stats.matches_won,
	stats.tournaments_won, stats.matches_lost, winRate);
}