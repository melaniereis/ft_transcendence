import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getEncryptionKey } from './services/vault/vault.js';
import { decryptFile, encryptFile } from './services/vault/encrypt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const encryptedPath = path.join(__dirname, '..', 'data', 'database.db.enc');
const decryptedPath = path.join(__dirname, '..', 'data', 'database.db');
const dataDir = path.dirname(decryptedPath);

const keyPath = path.join(process.cwd(), 'certs', 'key.pem');
const certPath = path.join(process.cwd(), 'certs', 'cert.pem');

const fastify = Fastify({
logger: true,
https: {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(certPath),
},
});

async function start() {
try {
	const key = await getEncryptionKey();

	// Ensure data directory exists
	if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
	}

	// Handle first-run or decrypt existing DB
	if (!fs.existsSync(encryptedPath)) {
	console.warn('⚠️ Encrypted database not found. Creating blank DB for first run.');
	fs.writeFileSync(decryptedPath, ''); // SQLite will initialize this
	} else {
	console.log('🔓 Decrypting database...');
	await decryptFile(encryptedPath, decryptedPath, key);
	}

	// Import database AFTER decryption
	await import('../backend/db/database.js');

	await fastify.register(fastifyWebsocket);
	await fastify.register(fastifyCors, { origin: true });

	const pagesPath = path.join(process.cwd(), 'dist', 'frontend', 'pages');
	console.log('📁 Serving pages from:', pagesPath);

	await fastify.register(fastifyStatic, {
	root: pagesPath,
	prefix: '/',
	index: ['index.html'],
	});

	// Register routes
	const {
	userRoutes, tournamentRoutes, registerTeamRoutes,
	gameRoutes, statsRoutes, authRoutes, websocketMatchmakingRoutes,
	gameSocketRoutes, matchHistoryRoutes, userProfileRoutes, friendsRoutes
	} = await import('./routes/routes.js');

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

	await fastify.listen({ port: 3000, host: '0.0.0.0' });
	console.log('✅ Server running at https://localhost:3000');

	// Encrypt DB on shutdown
	const shutdown = async () => {
	if (fs.existsSync(decryptedPath)) {
		console.log('🔒 Encrypting database before shutdown...');
		await encryptFile(decryptedPath, encryptedPath, key);
		fs.unlinkSync(decryptedPath);
	}
	process.exit();
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
	process.on('exit', shutdown);

} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
}

start();