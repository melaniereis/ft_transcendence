import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';

import { userRoutes } from './routes/user.js';
import { tournamentRoutes } from './routes/tournamentRoutes.js';
import { registerTeamRoutes } from './routes/teamRoutes.js';

import '../backend/db/database.js';

const fastify = Fastify({ logger: true });

// Enable CORS for all origins
fastify.register(fastifyCors, {
  origin: true,
});

// Serve static files from 'pages' at root '/'
const pagesPath = path.join(process.cwd(), 'dist', 'frontend', 'pages');
console.log('Serving pages from:', pagesPath);
fastify.register(fastifyStatic, {
  root: pagesPath,
  prefix: '/',
  index: ['index.html'],
});

fastify.register(userRoutes);
fastify.register(tournamentRoutes);
fastify.register(registerTeamRoutes);

// Explicit '/' route not required because of index: ['index.html'] in pages static

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
