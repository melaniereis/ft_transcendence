// backend/routes/registerTeamRoutes.ts
import { FastifyInstance } from 'fastify';
import * as TeamService from '../services/teamService.js';

const validTeams = ['hacktivists', 'logic_league', 'bug_busters', 'code_allience'];

export async function registerTeamRoutes(fastify: FastifyInstance) {
// GET all members
fastify.get('/api/teams/:team', async (req, reply) => {
	const { team } = req.params as { team: string };

	if (!validTeams.includes(team)) {
	return reply.status(400).send({ error: 'Invalid team name' });
	}

	try {
	const members = await TeamService.getAllTeamMembers(team);
	reply.send(members);
	} catch (err) {
	reply.status(500).send({ error: 'Failed to fetch members' });
	}
});

// POST new member
fastify.post('/api/teams/:team', async (req, reply) => {
	const { team } = req.params as { team: string };
	const { members } = req.body as { members?: string };

	if (!validTeams.includes(team)) {
	return reply.status(400).send({ error: 'Invalid team name' });
	}

	if (!members) {
	return reply.status(400).send({ error: 'Members field is required' });
	}

	try {
	await TeamService.createTeamMember(team, members);
	reply.status(201).send({ message: `Member added to ${team}` });
	} catch (err) {
	reply.status(500).send({ error: 'Failed to add member' });
	}
});

// PUT update member
fastify.put('/api/teams/:team/:id', async (req, reply) => {
	const { team, id } = req.params as { team: string; id: string };
	const { members, victories, tournaments_won, defeats, win_rate } = req.body as {
	members: string;
	victories: number;
	tournaments_won: number;
	defeats: number;
	win_rate: number;
	};

	if (!validTeams.includes(team)) {
	return reply.status(400).send({ error: 'Invalid team name' });
	}

	if (!members) {
	return reply.status(400).send({ error: 'Members field is required' });
	}

	try {
	await TeamService.updateTeamMember(team, +id, members, victories, tournaments_won, defeats, win_rate);
	reply.send({ message: `${team} member updated` });
	} catch (err) {
	reply.status(500).send({ error: 'Failed to update member' });
	}
});

// DELETE member
fastify.delete('/api/teams/:team/:id', async (req, reply) => {
	const { team, id } = req.params as { team: string; id: string };

	if (!validTeams.includes(team)) {
	return reply.status(400).send({ error: 'Invalid team name' });
	}

	try {
	await TeamService.deleteTeamMember(team, +id);
	reply.send({ message: `${team} member ${id} deleted` });
	} catch (err) {
	reply.status(500).send({ error: 'Failed to delete member' });
	}
});
}
