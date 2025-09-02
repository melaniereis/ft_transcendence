import Vault from 'node-vault';

const vault = Vault
({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'root'
});

export async function getSecrets() 
{
    try
    {
        const secret = await vault.read('secret-v2/data/ft_transcendence');
        process.env.DB_PATH = secret.data.data.db_path;
        process.env.JWT_SECRET = secret.data.data.jwt_secret || process.env.JWT_SECRET; // Fallback if not set
        console.log('Secrets fetched from Vault:', { db_path: process.env.DB_PATH, jwt_secret: process.env.JWT_SECRET ? 'set' : 'not set' });
    }
    catch (error)
    {
        console.error('Failed to fetch secrets from Vault:', error);
        throw error;
    }
}