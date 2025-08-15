import { FastifyInstance } from 'fastify';
import * as TeamService from '../services/teamService.js';

export async function bugBusterRoutes(fastify: FastifyInstance) {
const table = 'bug_busters';

fastify.get('/bug-busters', async (_req, reply) => {
	const data = await TeamService.getAllTeamMembers(table);
	reply.send(data);
});

fastify.post('/bug-busters', async (req, reply) => {
	const { members } = req.body as { members: string };
	if (!members) return reply.status(400).send({ error: 'Members field required' });

	await TeamService.createTeamMember(table, members);
	reply.status(201).send({ message: 'Bug Buster added' });
});

fastify.put('/bug-busters/:id', async (req, reply) => {
	const { id } = req.params as { id: string };
	const { members, victories, tournaments_won, defeats, win_rate } = req.body as {
	members: string;
	victories: number;
	tournaments_won: number;
	defeats: number;
	win_rate: number;
	};

	await TeamService.updateTeamMember(table, +id, members, victories, tournaments_won, defeats, win_rate);
	reply.send({ message: 'Bug Buster updated' });
});

fastify.delete('/bug-busters/:id', async (req, reply) => {
	const { id } = req.params as { id: string };
	await TeamService.deleteTeamMember(table, +id);
	reply.send({ message: `Bug Buster ${id} deleted` });
});
}
