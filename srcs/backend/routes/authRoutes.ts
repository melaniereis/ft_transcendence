import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerUser, loginUser, verifyToken } from '../services/authService.js';
import { LoginRequest, RegisterRequest } from '../types/login.js';

export async function authRoutes(fastify: FastifyInstance) {
	// User Registration
	fastify.post('/api/register', async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const { username, password, name, team, display_name, email } = req.body as RegisterRequest;

			// Simple validation
			if (!username || !password || !name || !team) {
				return reply.status(400).send({
					error: 'Required fields: username, password, name, team'
				});
			}

			const result = await registerUser({
				username,
				password,
				name,
				team,
				display_name,
				email
			});

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

			reply.send({ token: result.token, message: 'Login successful' });
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
