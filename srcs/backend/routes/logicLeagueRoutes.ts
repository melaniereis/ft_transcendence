import { FastifyInstance } from 'fastify';
import * as TeamService from '../crud/teamCrud.js';

export async function logicLeagueRoutes(fastify: FastifyInstance) {
const table = 'logic_league';

fastify.get('/logic-league', async (_req, reply) => {
	const data = await TeamService.getAllTeamMembers(table);
	reply.send(data);
});

fastify.post('/logic-league', async (req, reply) => {
	const { members } = req.body as { members: string };
	if (!members) return reply.status(400).send({ error: 'Members field required' });

	await TeamService.createTeamMember(table, members);
	reply.status(201).send({ message: 'Logic League member added' });
});

fastify.put('/logic-league/:id', async (req, reply) => {
	const { id } = req.params as { id: string };
	const { members, victories, tournaments_won, defeats, win_rate } = req.body as {
	members: string;
	victories: number;
	tournaments_won: number;
	defeats: number;
	win_rate: number;
	};

	await TeamService.updateTeamMember(table, +id, members, victories, tournaments_won, defeats, win_rate);
	reply.send({ message: 'Logic League member updated' });
});

fastify.delete('/logic-league/:id', async (req, reply) => {
	const { id } = req.params as { id: string };
	await TeamService.deleteTeamMember(table, +id);
	reply.send({ message: `Logic League member ${id} deleted` });
});
}
