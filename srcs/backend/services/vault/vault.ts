import axios from 'axios';

const SECRET_PATH = 'secret-v2/data/sqlite';
const WRITE_PATH = 'secret-v2/data/sqlite';
const VAULT_ADDR = process.env.VAULT_ADDR!;
const VAULT_TOKEN = process.env.VAULT_TOKEN!;

function vaultHeaders() {
	return {
		'X-Vault-Token': VAULT_TOKEN,
		'Content-Type': 'application/json',
	};
}

export async function getEncryptionKey(): Promise<string> {
	if (!VAULT_ADDR || !VAULT_TOKEN)
		throw new Error('Vault environment variables missing');

	const url = `${VAULT_ADDR}/v1/${SECRET_PATH}`;
	const headers = vaultHeaders();

	const maxRetries = 10;
	const retryDelay = 1000; // milliseconds

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`🔑 Attempt ${attempt}: Fetching encryption key from Vault...`);

			const response = await axios.get(url, { headers });
			const key = response.data?.data?.data?.key;

			if (!key)
				throw new Error('Encryption key not found in Vault response');

			console.log(`✅ Encryption key successfully fetched.`);
			return key;
		} 
		catch (err: any) {
			if (err.response?.status === 404)
				console.warn(`🔁 Vault returned 404 (key not ready). Retrying in ${retryDelay}ms...`);
			else {
				console.error(`❌ Unexpected error: ${err.message}`);
				throw err;
			}
			await delay(retryDelay);
		}
	}

	throw new Error(`❌ Failed to fetch encryption key from Vault after ${maxRetries} attempts`);
}


function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function storeEncryptionKey(key: string): Promise<void> {
	if (!VAULT_ADDR || !VAULT_TOKEN)
		throw new Error('Vault environment variables missing');

	const body = { data: { key } };
	const url = `${VAULT_ADDR}/v1/${WRITE_PATH}`;

	const maxRetries = 3;
	const retryDelay = 500; // milliseconds

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {

			await axios.put(url, body, { headers: vaultHeaders() });
			console.log('Encryption key stored successfully');
			return; // success, exit function
		} 
		catch (err: any) {

			if (attempt === maxRetries) {
				if (err.response?.status === 404) {
				throw new Error(`Vault path not found: ${url}`);
				}
				throw new Error(`Failed to store key in Vault: ${err.message}`);
			}

			// wait before retrying
			await delay(retryDelay);
		}
	}
}