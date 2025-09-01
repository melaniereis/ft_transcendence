//routes/tournamentRoutes.ts
import { FastifyInstance } from 'fastify';
import {createTournament, getTournamentById, updateMatchResult,
getAllTournaments, deleteTournamentByName} from '../services/tournamentsService.js';

export async function tournamentRoutes(fastify: FastifyInstance) {
	fastify.get('/api/tournaments', async (_req, reply) => {
		try {
			const tournaments = await getAllTournaments();
			reply.send(tournaments);
		} 
		catch (err) {
			reply.status(500).send({ error: 'Failed to fetch tournaments' });
		}
	});

	fastify.get('/api/tournaments/:id', async (req, reply) => {
		const { id } = req.params as { id: string };
		
		try {
			const tournament = await getTournamentById(+id);
			reply.send(tournament);
		}
		catch (err) {
			reply.status(404).send({ error: 'Tournament not found' });
		}
	});
	
	fastify.post('/api/tournaments', async (req, reply) => {
		const { name, playerIds } = req.body as { name?: string; playerIds?: number[] };
		
		if (!name || !playerIds || playerIds.length !== 4)
			return reply.status(400).send({ error: 'Tournament name and 4 player IDs are required' });
		
		try {
			const tournament = await createTournament(name, playerIds);
			reply.status(201).send(tournament);
		} 
		catch (err) {
			console.error('Error creating tournament:', err);
			reply.status(500).send({ error: 'Failed to create tournament' });
		}
	});
	
	fastify.put('/api/tournaments/:id/match', async (req, reply) => {
		const { id } = req.params as { id: string };
		const { round, winnerId } = req.body as {
			round?: 'semifinal1' | 'semifinal2' | 'final';
			winnerId?: number;
		};

		if (!round || !winnerId)
			return reply.status(400).send({ error: 'Round and winnerId are required' });

		try {
			await updateMatchResult(+id, round, winnerId);
			reply.send({ message: `Match result for ${round} updated` });
		} 
		catch (err) {
			reply.status(500).send({ error: 'Failed to update match result' });
		}
	});

	fastify.delete('/api/tournaments', async (req, reply) => {
		const { name } = req.body as { name?: string };

		if (!name)
			return reply.status(400).send({ error: 'Tournament name is required' });

		try {
			const deleted = await deleteTournamentByName(name);
			if (deleted)
				reply.send({ message: `Tournament "${name}" deleted successfully.` }); 
			else
				reply.status(404).send({ error: `Tournament "${name}" not found.` });
		} 
		catch (err) {
			reply.status(500).send({ error: 'Failed to delete tournament' });
		}
	});
}