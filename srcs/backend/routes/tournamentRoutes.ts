
import { FastifyInstance } from 'fastify';
import {
createTournament,
getAllTournaments,
getTournamentById,
updateTournament,
deleteTournament,
} from '../services/tournamentsService.js';

export async function tournamentRoutes(fastify: FastifyInstance) {
fastify.post('/tournaments', async (request, reply) => {
	const { name, team_winner, team_victories, size } = request.body as {
	name: string;
	team_winner: string;
	team_victories: number;
	size: number;
	};

	try {
	await createTournament(name, team_winner, team_victories, size);
	reply.status(201).send({ message: 'Tournament created' });
	} catch (error) {
	reply.status(500).send({ error: 'Failed to create tournament' });
	}
});

fastify.get('/tournaments', async (_request, reply) => {
	const tournaments = await getAllTournaments();
	reply.send(tournaments);
});

fastify.get('/tournaments/:id', async (request, reply) => {
	const { id } = request.params as { id: string };
	const tournament = await getTournamentById(Number(id));

	if (!tournament) {
	return reply.status(404).send({ error: 'Tournament not found' });
	}

	reply.send(tournament);
});

fastify.put('/tournaments/:id', async (request, reply) => {
	const { id } = request.params as { id: string };
	const { name, team_winner, team_victories, size } = request.body as {
	name: string;
	team_winner: string;
	team_victories: number;
	size: number;
	};

	try {
	await updateTournament(Number(id), name, team_winner, team_victories, size);
	reply.send({ message: 'Tournament updated' });
	} catch (err) {
	reply.status(500).send({ error: 'Failed to update tournament' });
	}
});

fastify.delete('/tournaments/:id', async (request, reply) => {
	const { id } = request.params as { id: string };
	try {
	await deleteTournament(Number(id));
	reply.send({ message: 'Tournament deleted' });
	} catch (err) {
	reply.status(500).send({ error: 'Failed to delete tournament' });
	}
});
}
