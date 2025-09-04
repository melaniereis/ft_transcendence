import axios from 'axios';

export async function getEncryptionKey(): Promise<string> {
    const VAULT_ADDR = process.env.VAULT_ADDR;
    const VAULT_TOKEN = process.env.VAULT_TOKEN;

    if (!VAULT_ADDR || !VAULT_TOKEN)
        throw new Error('Vault environment variables are missing');

    for (let i = 0; i < 10; i++) {
        try {
            const response = await axios.get(`${VAULT_ADDR}/v1/secret-v2/data/sqlite`, {
                headers: { 'X-Vault-Token': VAULT_TOKEN },
            });
            const key = response.data?.data?.data?.key;
            if (!key) throw new Error('Encryption key not found in Vault');
            return key;
        } catch (error: any) {
            console.warn(`🔁 Vault not ready (attempt ${i + 1}/10): ${error.message}`);
            await new Promise(res => setTimeout(res, 2000));
        }
    }
    throw new Error('❌ Vault unreachable after retries');
}
