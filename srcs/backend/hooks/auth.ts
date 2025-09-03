import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../services/authService.js'; // adjust path as needed

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
	const authHeader = request.headers.authorization;
	const token = authHeader?.split(' ')[1];

	if (!token) {
		reply.code(401).send({ error: 'Missing token' });
		return;
	}

	const userId = await verifyToken(token);
	if (!userId) {
		reply.code(403).send({ error: 'Invalid or expired token' });
		return;
	}

	request.userId = userId; // attach user info to request
}