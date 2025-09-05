import path from 'path';
import fs from 'fs';
import { getEncryptionKey } from '../services/vault/vault.js';
import { encryptAndRemoveOriginal } from '../services/vault/encrypt.js';

async function encryptDb() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const decryptedPath = path.join(__dirname, '..', '..', 'data', 'database.db');
  const encryptedPath = path.join(__dirname, '..', '..', 'data', 'database.db.enc');

  if (!fs.existsSync(decryptedPath)) {
    console.error('❌ Decrypted database file does not exist:', decryptedPath);
    process.exit(1);
  }

  const stats = fs.statSync(decryptedPath);
  console.log(`ℹ️ Decrypted DB size: ${(stats.size / 1024).toFixed(2)} KB`);

  if (stats.size === 0) {
    console.warn('⚠️ Decrypted DB is empty. Are you sure this is correct?');
  }

  try {
    console.log('🔑 Fetching encryption key from Vault...');
    const key = await getEncryptionKey();
    console.log('✅ Encryption key retrieved');

    console.log(`🔐 Encrypting database from ${decryptedPath} to ${encryptedPath}...`);
    await encryptAndRemoveOriginal(decryptedPath, encryptedPath, key);
    console.log('✅ Database encrypted successfully');

  } catch (err) {
    console.error('❌ Failed to encrypt database:', err);
    process.exit(1);
  }
}

encryptDb();
