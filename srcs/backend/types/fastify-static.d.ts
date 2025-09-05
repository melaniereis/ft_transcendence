//types/fastify-static.d.ts
declare module '@fastify/static';
declare module '@fastify/cors';
declare module 'bcrypt';
declare module '@fastify/websocket';

import 'fastify';
declare module 'fastify' {
	interface FastifyRequest {
	userId?: number;
	}
}