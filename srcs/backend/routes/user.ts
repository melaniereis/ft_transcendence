// routes/userRoutes.ts
import { FastifyInstance } from 'fastify';
import { createUser, getAllUsers } from '../crud/crud.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/users', async (request, reply) => {
    const { name, username, team, password } = request.body as {
      name: string;
      username: string;
      team: string;
      password: string;
    };

    if (!name || !username || !team || !password) {
      return reply.status(400).send({ error: 'Missing fields' });
    }

    try {
      await createUser(name, username, team, password);
      return reply.status(201).send({ message: 'User created' });
    } catch (err) {
      console.error('Error:', err);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/users', async (_request, reply) => {
    const users = await getAllUsers();
    return reply.send(users);
  });
}

