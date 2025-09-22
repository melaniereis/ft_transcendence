import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../services/authService.js';

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
	const authHeader = request.headers.authorization;

	if (!authHeader) {
		console.warn('🚫 No Authorization header provided');
		reply.code(401).send({ error: 'Missing token' });
		return;
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		console.warn('🚫 Authorization header malformed, no token found');
		reply.code(401).send({ error: 'Missing token' });
		return;
	}

	try {
		const userId = await verifyToken(token);
		if (!userId) {
		console.warn('🚫 Token verification failed: invalid or expired');
		reply.code(403).send({ error: 'Invalid or expired token' });
		return;
		}

		(request as any).userId = userId;  // Ensure type cast if needed

	} 
	catch (err) {
		console.error('🚨 Error during token verification:', err);
		reply.code(500).send({ error: 'Internal server error during authentication' });
	}
}
