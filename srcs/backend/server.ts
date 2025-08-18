import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';

import { userRoutes } from './routes/user.js';
import { tournamentRoutes } from './routes/tournamentRoutes.js';
import { registerTeamRoutes } from './routes/teamRoutes.js';
import { gameRoutes } from './routes/gameRoutes.js';
import { statsRoutes } from './routes/statsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';


import '../backend/db/database.js';

const fastify = Fastify({ logger: true });

// Enable CORS for all origins
fastify.register(fastifyCors, {
	origin: true,
});

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
fastify.register(gameRoutes);
fastify.register(statsRoutes);
fastify.register(authRoutes);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('Server running at http://localhost:3000');
	} 
	catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();