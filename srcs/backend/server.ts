import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import fs from 'fs';

import '../backend/db/database.js';
import {userRoutes,tournamentRoutes,registerTeamRoutes,
gameRoutes,statsRoutes, authRoutes, websocketMatchmakingRoutes, 
gameSocketRoutes, matchHistoryRoutes, userProfileRoutes, friendsRoutes} from './routes/routes.js';

const keyPath = path.join(process.cwd(), 'certs', 'key.pem');
const certPath = path.join(process.cwd(), 'certs', 'cert.pem');

const fastify = Fastify({
logger: true,
https: {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(certPath),
},
});

await fastify.register(fastifyWebsocket);
await fastify.register(fastifyCors, { origin: true });

const pagesPath = path.join(process.cwd(), 'dist', 'frontend', 'pages');
console.log('Serving pages from:', pagesPath);

await fastify.register(fastifyStatic, {
	root: pagesPath,
	prefix: '/',
	index: ['index.html'],
});

await fastify.register(matchHistoryRoutes);
await fastify.register(userProfileRoutes);
await fastify.register(friendsRoutes);
await fastify.register(userRoutes);
await fastify.register(tournamentRoutes);
await fastify.register(registerTeamRoutes);
await fastify.register(gameRoutes);
await fastify.register(statsRoutes);
await fastify.register(authRoutes);
await fastify.register(websocketMatchmakingRoutes);
await fastify.register(gameSocketRoutes); 

const start = async () => {
try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
	console.log('✅ Server running at https://localhost:3000');
} 
catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
};

start();
