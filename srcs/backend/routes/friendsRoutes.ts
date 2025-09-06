import { FastifyInstance } from 'fastify';
import { sendFriendRequest, acceptFriendRequest, getFriends, removeFriend, getUserByUsername, getPendingRequests, rejectFriendRequest, getOutgoingRequests } from '../services/friendsService.js';
import { verifyToken } from '../services/authService.js';

interface FriendRequestBody {
	friendUsername: string; // username of the friend to add
}

interface AcceptRequestBody {
	friendId: number;
}

export async function friendsRoutes(fastify: FastifyInstance) {

	// Send friend request by username
	fastify.post('/api/friends/request', async (req, reply) => {
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

			const { friendUsername } = req.body as FriendRequestBody;

			if (!friendUsername) {
				return reply.status(400).send({ error: "Friend's username is required" });
			}

			// Check if friend exists
			const friend = await getUserByUsername(friendUsername);
			if (!friend) {
				return reply.status(404).send({ error: 'User not found' });
			}

			if (friend.id === userId) {
				return reply.status(400).send({ error: "You can't add yourself" });
			}

			await sendFriendRequest(userId, friend.id);
			reply.status(201).send({
				success: true,
				message: `Friend request sent to ${friendUsername}`
			});
		}
		catch (err: any) {
			console.error('Error sending request:', err);
			if (err.message.includes('already exists')) {
				reply.status(409).send({ error: 'Request already exists or you are already friends' });
			} else {
				reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Accept friend request
	fastify.post('/api/friends/accept', async (req, reply) => {
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

			const { friendId } = req.body as AcceptRequestBody;

			if (!friendId || typeof friendId !== 'number') {
				return reply.status(400).send({ error: "Friend's ID is required and must be a number" });
			}

			await acceptFriendRequest(userId, friendId);
			reply.send({
				success: true,
				message: 'Friend request accepted'
			});
		}
		catch (err: any) {
			console.error('Error accepting request:', err);
			if (err.message.includes('No pending')) {
				reply.status(404).send({ error: 'Pending request not found' });
			} else {
				reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	// List friends
	fastify.get('/api/friends', async (req, reply) => {
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

			const friends = await getFriends(userId);
			reply.send({ friends });
		}
		catch (err: any) {
			console.error('Error fetching friends:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});


	// Get pending friend requests
	fastify.get('/api/friends/pending', async (req, reply) => {
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

			const pendingRequests = await getPendingRequests(userId);
			reply.send({ pending: pendingRequests });
		}
		catch (err: any) {
			console.error('Error fetching pending requests:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});

	// Reject friend request
	fastify.post('/api/friends/reject', async (req, reply) => {
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

			const { friendId } = req.body as { friendId: number };

			if (!friendId || typeof friendId !== 'number') {
				return reply.status(400).send({ error: "Friend's ID is required and must be a number" });
			}

			await rejectFriendRequest(userId, friendId);
			reply.send({
				success: true,
				message: 'Friend request rejected'
			});
		}
		catch (err: any) {
			console.error('Error rejecting request:', err);
			if (err.message.includes('No pending')) {
				reply.status(404).send({ error: 'Pending request not found' });
			} else {
				reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Remove friend
	fastify.delete('/api/friends/:friendId', async (req, reply) => {
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

			const { friendId } = req.params as { friendId: string };
			const friendIdNum = parseInt(friendId);

			if (isNaN(friendIdNum)) {
				return reply.status(400).send({ error: 'Invalid friend ID' });
			}

			await removeFriend(userId, friendIdNum);
			reply.send({
				success: true,
				message: 'Friend removed successfully'
			});
		}
		catch (err: any) {
			console.error('Error removing friend:', err);
			if (err.message.includes('No friendship found')) {
				reply.status(404).send({ error: 'Friendship not found' });
			} else {
				reply.status(500).send({ error: 'Internal server error' });
			}
		}
	});

	// Get outgoing friend requests
	fastify.get('/api/friends/outgoing', async (req, reply) => {
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

			const outgoingRequests = await getOutgoingRequests(userId);
			reply.send({ outgoing: outgoingRequests });
		}
		catch (err: any) {
			console.error('Error fetching outgoing requests:', err);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});
}
