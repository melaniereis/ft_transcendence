import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerUser, loginUser, verifyToken } from '../services/authService.js';

export async function authRoutes(fastify: FastifyInstance) {
	fastify.post('/api/register', async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const { username, password, name, team } = req.body as {
				username: string;
				password: string;
				name: string;
				team: string;
			};

			const result = await registerUser({ username, password, name, team });
			reply.send({ success: true, userId: result.id });
		} 
		catch (err: any) {
			reply.status(400).send({ error: 'Registration failed', details: err.message });
		}
	});

	fastify.post('/api/login', async (req: FastifyRequest, reply: FastifyReply) => {
		const { username, password } = req.body as { username: string; password: string };

		const result = await loginUser(username, password);
		if (!result)
			return reply.status(401).send({ error: 'Invalid credentials' });

		reply.send({ token: result.token });
	});

	fastify.get('/api/protected', async (req: FastifyRequest, reply: FastifyReply) => {
		const authHeader = req.headers.authorization;

		if (!authHeader)
			return reply.status(401).send({ error: 'Authorization header missing' });

		const token = authHeader.split(' ')[1];
		if (!token)
			return reply.status(401).send({ error: 'Token missing from header' });
	
		const userId = await verifyToken(token);
		if (!userId) 
			return reply.status(401).send({ error: 'Unauthorized' });
		
		reply.send({ message: `Hello user ${userId}` });
	});
}