import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import fastifyCors from '@fastify/cors';

const require = createRequire(import.meta.url);

const sqlite3 = require('sqlite3');
sqlite3.verbose();
console.log('✅ Imported sqlite3');

const db = new sqlite3.Database('./database.db');
console.log('✅ Connected to SQLite');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// ✅ Register CORS after fastify is created
fastify.register(fastifyCors, {
  origin: true,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'frontend'),
  prefix: '/',
});
console.log('✅ Registered static frontend');

fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

fastify.post('/users', async (request, reply) => {
  const { name, username, team } = request.body as {
    name: string;
    username: string;
    team: string;
  };

  const query = `INSERT INTO users (name, username, team) VALUES (?, ?, ?)`;
  db.run(query, [name, username, team], function (err: Error | null) {
    if (err) {
      console.error('❌ Failed to insert user:', err);
      reply.code(500).send({ error: err.message });
    } else {
      reply.code(201).send({ message: 'User created' });
    }
  });
});

fastify.get('/users', async (request, reply) => {
  db.all(`SELECT * FROM users`, [], (err: Error | null, rows: any[]) => {
    if (err) {
      console.error('❌ Failed to fetch users:', err);
      reply.code(500).send({ error: err.message });
    } else {
      reply.send(rows);
    }
  });
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
