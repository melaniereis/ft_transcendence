//routes/user.ts
import { FastifyInstance } from 'fastify';
import { createUser, getAllUsers, deleteUser, getDisplayNameById, getUsernameById } from '../services/services.js';
import { authHook } from '../hooks/auth.js';

export async function userRoutes(fastify: FastifyInstance) {
	fastify.get('/users', {
		preHandler: authHook,
		handler: async (_request, reply) => {
			const users = await getAllUsers();
			return reply.send(users);
		}
	});

	fastify.get('/users/:id/display_name', {
		preHandler: authHook,
		handler: async (request, reply) => {
			const { id } = request.params as { id: string };
			const userId = Number(id);
			if (isNaN(userId)) {
				return reply.status(400).send({ error: 'Invalid user id' });
			}

			try {
				const displayName = await getDisplayNameById(userId);
				if (!displayName) {
					return reply.send({ display_name: '' });
				}
				return reply.send({ display_name: displayName });
			} catch (err) {
				console.error('Error fetching display name:', err);
				return reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	fastify.post('/users', async (request, reply) => {
		const { name, username, team, password } = request.body as {
			name: string;
			username: string;
			team: string;
			password: string;
		};

		if (!name || !username || !team || !password)
			return reply.status(400).send({ error: 'Missing fields' });

		try {
			await createUser(name, username, team, password);
			return reply.status(201).send({ message: 'User created' });
		}
		catch (err) {
			console.error('Error:', err);
			return reply.status(500).send({ error: 'Internal server error' });
		}
		fastify.get('/api/users/:id', {
			preHandler: authHook,
			handler: async (request, reply) => {
				const { id } = request.params as { id: string };
				const userId = Number(id);
				if (isNaN(userId)) {
					return reply.status(400).send({ error: 'Invalid user id' });
				}
				try {
					const { getUserById } = await import('../services/services.js');
					const user = await getUserById(userId);
					if (!user) {
						return reply.status(404).send({ error: 'User not found' });
					}
					return reply.send(user);
				} catch (err) {
					console.error('Error fetching user by id:', err);
					return reply.status(500).send({ error: 'Internal server error' });
				}
			}
		});
	});

	fastify.get('/api/users/:username', {
		preHandler: authHook, handler: async (request, reply) => {
			const { username } = request.params as { username: string };
			const users = await getAllUsers();
			const user = users.find((u: any) => u.username === username);
			if (!user)
				return reply.status(404).send({ error: 'User not found' });
			return reply.send(user);
		}
	});

	fastify.get('/users/:id/username', {
		preHandler: authHook,
		handler: async (request, reply) => {
			const { id } = request.params as { id: string };
			const userId = Number(id);
			if (isNaN(userId)) {
				return reply.status(400).send({ error: 'Invalid user id' });
			}

			try {
				const username = await getUsernameById(userId);
				// Return empty string if no username found instead of 404
				return reply.send('');
			}
			catch (err) {
				console.error('Error fetching username:', err);
				return reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});


	fastify.delete('/users/:id', {
		preHandler: authHook,
		handler: async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				await deleteUser(Number(id));
				return reply.send({ message: `User ${id} deleted` });
			}
			catch (err) {
				console.error('Delete error:', err);
				return reply.status(500).send({ error: 'Failed to delete user' });
			}
		}
	});
}
