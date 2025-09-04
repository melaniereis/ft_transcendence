import axios from 'axios';

export async function waitForVaultReady(retries = 10, delay = 2000): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axios.get(`${process.env.VAULT_ADDR}/v1/sys/health`);
            if (res.status === 200 || res.status === 429) {
                console.log('✅ Vault is ready');
                return;
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.warn(`🔁 Vault not ready (attempt ${i + 1}/${retries}): ${err.message}`);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error('❌ Vault unreachable after retries');
}
