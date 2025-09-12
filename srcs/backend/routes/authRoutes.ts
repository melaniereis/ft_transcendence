import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerUser, loginUser, verifyToken } from '../services/authService.js';
import { LoginRequest, RegisterRequest } from '../types/login.js';
import * as TeamService from '../services/teamService.js';

export async function authRoutes(fastify: FastifyInstance) {
	// User Registration
	fastify.post('/api/register', async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const { username, password, name, team, display_name, email } = req.body as {
			username: string;
			password: string;
			name: string;
			team: string;
			display_name?: string;
			email?: string;
			};

			if (!username || !password || !name || !team) {
				return reply.status(400).send({
					error: 'Required fields: username, password, name, team'
				});
			}

			// Register user
			const result = await registerUser({ username, password, name, team, display_name, email });

			// Add user to team members string (update the single row)
			await TeamService.addMemberToTeam(team, username);

			// Confirm addition
			const updatedMembers = await TeamService.getTeamMembersString(team);
			if (updatedMembers && updatedMembers.split(',').map(m => m.trim()).includes(username)) {
			console.log(`✅ User '${username}' successfully added to team '${team}'`);
			} else {
			console.error(`❌ Failed to confirm user '${username}' in team '${team}'`);
			}

			reply.send({ success: true, userId: result.id });
		} 
		catch (err: any) {
			console.error('Registration error:', err);
			reply.status(400).send({
			error: 'Registration failed',
			details: err.message
			});
		}
	});

	// Login
	fastify.post('/api/login', async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const { username, password } = req.body as LoginRequest;

			if (!username || !password) {
				return reply.status(400).send({
					error: 'Username and password are required'
				});
			}

			const result = await loginUser(username, password);
			if (!result) {
				return reply.status(401).send({ error: 'Invalid credentials' });
			}

			reply.send({token: result.token, user: result.user, message: 'Login successful'});
		}
		catch (err: any) {
			console.error('Login error:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});

	// Route protected for testing token verification
	fastify.get('/api/protected', async (req: FastifyRequest, reply: FastifyReply) => {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing in header' });
		}

		const userId = await verifyToken(token);
		if (!userId) {
			return reply.status(401).send({ error: 'Invalid token' });
		}

		reply.send({ message: `Authenticated user: ${userId}` });
	});
}
