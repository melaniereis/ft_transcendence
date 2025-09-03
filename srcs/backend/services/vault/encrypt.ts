// crypto.ts
import fs from 'fs';
import crypto from 'crypto';

export function decryptFile(
  inputPath: string,
  outputPath: string,
  keyHex: string
): Promise<void> {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.alloc(16, 0); // static IV for simplicity

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    input.pipe(decipher).pipe(output)
      .on('finish', resolve)
      .on('error', reject);
  });
}

export function encryptFile(
  inputPath: string,
  outputPath: string,
  keyHex: string
): Promise<void> {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output)
      .on('finish', resolve)
      .on('error', reject);
  });
}
