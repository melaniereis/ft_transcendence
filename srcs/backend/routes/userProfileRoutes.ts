//routes/userProfileRoutes.ts
import { FastifyInstance } from 'fastify';
import {
	getUserProfile,
	updateUserProfile,
	updateOnlineStatus,
	getUserWithStats,
	changeUserPassword
} from '../services/userProfileService.js';
import { verifyToken } from '../services/authService.js';
import db from '../db/database.js';

interface UpdateProfileRequest {
	username?: string;
	display_name?: string;
	email?: string;
	avatar_url?: string;
	bio?: string;
}

interface UpdateStatusRequest {
	online: boolean;
}

export async function userProfileRoutes(fastify: FastifyInstance) {

	// Obtain user profile
	fastify.get('/api/profile', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			const userProfile = await getUserProfile(userId);
			if (!userProfile) {
				return reply.status(404).send({ error: 'Profile not found' });
			}

			reply.send(userProfile);
		}
		catch (err: any) {
			console.error('Error fetching profile:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});

	// Obtain profile with stats
	fastify.get('/api/profile/stats', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			const userWithStats = await getUserWithStats(userId);
			if (!userWithStats) {
				return reply.status(404).send({ error: 'User not found' });
			}

			reply.send(userWithStats);
		}
		catch (err: any) {
			console.error('Error fetching profile with stats:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});

	// Update user profile
	fastify.put('/api/profile', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			const updates = req.body as UpdateProfileRequest;

			// Basic validation
			if (updates.email && !updates.email.includes('@')) {
				return reply.status(400).send({ error: 'Invalid email' });
			}

			if (updates.username && updates.username.length < 3) {
				return reply.status(400).send({ error: 'Username must be at least 3 characters' });
			}

			await updateUserProfile(userId, updates);
			reply.send({ success: true, message: 'Profile updated successfully' });
		}
		catch (err: any) {
			console.error('Error updating profile:', err);
			if (err.message.includes('UNIQUE constraint failed')) {
				reply.status(409).send({ error: 'Username or email already exists' });
			} else {
				reply.status(500).send({ error: err.message || 'Internal server error' });
			}
		}
	});

	// Update online status
	fastify.post('/api/profile/status', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			const { online } = req.body as UpdateStatusRequest;

			if (typeof online !== 'boolean') {
				return reply.status(400).send({ error: 'Field "online" must be boolean' });
			}

			await updateOnlineStatus(userId, online);
			reply.send({
				success: true,
				message: `Status changed to ${online ? 'online' : 'offline'}`
			});
		}
		catch (err: any) {
			console.error('Error updating status:', err);
			reply.status(500).send({ error: err.message || 'Internal server error' });
		}
	});

	// Change password
	fastify.post('/api/profile/change-password', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			const { currentPassword, newPassword } = req.body as {
				currentPassword: string;
				newPassword: string;
			};

			if (!currentPassword || !newPassword) {
				return reply.status(400).send({ error: 'Current and new password are required' });
			}

			if (newPassword.length < 6) {
				return reply.status(400).send({ error: 'New password must be at least 6 characters' });
			}

			await changeUserPassword(userId, currentPassword, newPassword);
			reply.send({
				success: true,
				message: 'Password changed successfully'
			});
		}
		catch (err: any) {
			console.error('Error changing password:', err);
			if (err.message.includes('Incorrect current password')) {
				reply.status(400).send({ error: 'Incorrect current password' });
			} else {
				reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Update last seen
	fastify.post('/api/profile/update-last-seen', async (req, reply) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return reply.status(401).send({ error: 'Authorization header missing' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return reply.status(401).send({ error: 'Token missing' });
		}

		try {
			const userId = await verifyToken(token);
			if (!userId) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			db.run(
				`UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
				[userId],
				function (err) {
					if (err) {
						console.error('Error updating last_seen:', err);
						return reply.status(500).send({ error: 'Internal error' });
					}
					reply.send({ success: true });
				}
			);
		} catch (err: any) {
			console.error('Error:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});
}
