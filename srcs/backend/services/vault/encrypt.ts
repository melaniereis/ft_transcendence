import fs from 'fs';
import crypto from 'crypto';

import path from 'path';

export function decryptFile(inputPath: string, outputPath: string, keyHex: string): Promise<void> {
  try {
    const key = Buffer.from(keyHex, 'hex');
    const input = fs.readFileSync(inputPath);

    console.log('🔍 Decrypting file:', inputPath, 'size:', input.length);

    const iv = input.slice(0, 16);
    const encrypted = input.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // ✅ Ensure the output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created missing directory:', dir);
    }

    console.log('📁 Writing decrypted file to:', outputPath);
    fs.writeFileSync(outputPath, decrypted);
    console.log('✅ Decrypted file written:', outputPath);

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return Promise.reject(error);
  }
}

export function encryptFile(inputPath: string, outputPath: string, keyHex: string): Promise<void> {
	const key = Buffer.from(keyHex, 'hex');
	const iv = crypto.randomBytes(16);

	const input = fs.readFileSync(inputPath);
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

	const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
	const output = Buffer.concat([iv, encrypted]);

	fs.writeFileSync(outputPath, output);
	return Promise.resolve();
}

export async function encryptAndRemoveOriginal(inputPath: string, outputPath: string, keyHex: string) {
  try {
    await encryptFile(inputPath, outputPath, keyHex);
    console.log('Encryption successful, deleting original file...');
    await fs.promises.unlink(inputPath);
    console.log('Original file deleted.');
  } catch (error) {
    console.error('Error during encryption or deleting original file:', error);
    throw error;
  }
}
