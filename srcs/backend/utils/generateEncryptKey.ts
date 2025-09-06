import { randomBytes } from 'crypto';
import { storeEncryptionKey } from '../services/vault/vault.js';

async function generateEncryptionKey() {
  const key = randomBytes(32).toString('hex');
  console.log('Generated encryption key:', key);

  try {
    await storeEncryptionKey(key);
    console.log('Encryption key successfully stored in Vault.');
  } catch (err) {
    console.error('Error storing encryption key in Vault:', err);
    process.exit(1);
  }
}

generateEncryptionKey();
