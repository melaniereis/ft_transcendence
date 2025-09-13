import { createTournament, getAllTournaments, getTournamentById, updateTournament, deleteTournament } from '../services/tournamentsService.js';
export async function tournamentRoutes(fastify) {
    fastify.post('/tournaments', async (request, reply) => {
        const { name, team_winner, team_victories, size } = request.body;
        try {
            await createTournament(name, team_winner, team_victories, size);
            reply.status(201).send({ message: 'Tournament created' });
        }
        catch (error) {
            reply.status(500).send({ error: 'Failed to create tournament' });
        }
    });
    fastify.get('/tournaments', async (_request, reply) => {
        const tournaments = await getAllTournaments();
        reply.send(tournaments);
    });
    fastify.get('/tournaments/:id', async (request, reply) => {
        const { id } = request.params;
        const tournament = await getTournamentById(Number(id));
        if (!tournament)
            return reply.status(404).send({ error: 'Tournament not found' });
        reply.send(tournament);
    });
    fastify.put('/tournaments/:id', async (request, reply) => {
        const { id } = request.params;
        const { name, team_winner, team_victories, size } = request.body;
        try {
            await updateTournament(Number(id), name, team_winner, team_victories, size);
            reply.send({ message: 'Tournament updated' });
        }
        catch (err) {
            reply.status(500).send({ error: 'Failed to update tournament' });
        }
    });
    fastify.delete('/tournaments/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            await deleteTournament(Number(id));
            reply.send({ message: 'Tournament deleted' });
        }
        catch (err) {
            reply.status(500).send({ error: 'Failed to delete tournament' });
        }
    });
}
