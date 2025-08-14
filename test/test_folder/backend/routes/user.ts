import { FastifyInstance } from 'fastify';
import db from '../db/database.js';

interface UserRequestBody {
  name: string;
  username: string;
  team: string;
}

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/users', async (request, reply) => {
    const { name, username, team } = request.body as UserRequestBody;

    const query = `INSERT INTO users (name, username, team) VALUES (?, ?, ?)`;
    db.run(query, [name, username, team], function (err) {
      if (err) {
        console.error('❌ Failed to insert user:', err);
        reply.code(500).send({ error: err.message });
      } else {
        reply.code(201).send({ message: 'User created', id: this.lastID });
      }
    });
  });

  fastify.get('/users', async (_request, reply) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        console.error('❌ Failed to fetch users:', err);
        reply.code(500).send({ error: err.message });
      } else {
        reply.send(rows);
      }
    });
  });
}
