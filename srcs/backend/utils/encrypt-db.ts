import path from 'path';
import { encryptFile } from '../services/vault/encrypt.js';
import { getEncryptionKey } from '../services/vault/vault.js';

async function encryptDatabase() {
	const decryptedPath = path.join(process.cwd(), 'data', 'database.db');
	const encryptedPath = path.join(process.cwd(), 'data', 'database.db.enc');

	const key = await getEncryptionKey();
	await encryptFile(decryptedPath, encryptedPath, key);

	console.log('✅ Database encrypted successfully');
}

encryptDatabase().catch((err) => {
	console.error('❌ Failed to encrypt database:', err);
});