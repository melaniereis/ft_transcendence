#!/bin/sh
set -e

export VAULT_TOKEN=root
export VAULT_ADDR=http://127.0.0.1:8200

vault server -dev -dev-root-token-id=$VAULT_TOKEN -dev-listen-address=0.0.0.0:8200 &
VAULT_PID=$!

# Wait for Vault to be ready
for i in $(seq 1 20); do
  if vault status >/dev/null 2>&1; then
    echo "✅ Vault is ready"
    break
  fi
  echo "⏳ Waiting for Vault ($i/20)..."
  sleep 1
done

# Enable KV v2
vault secrets enable -path=secret-v2 kv-v2 || true

# Read key from secret file
ENC_KEY=$(cat /run/secrets/encryption_key.txt)

# Only store it if it doesn't already exist
if vault kv get secret-v2/sqlite >/dev/null 2>&1; then
  echo "🔐 Key already exists in Vault — skipping"
else
  echo "📦 Storing encryption key from secret file..."
  vault kv put secret-v2/sqlite key="$ENC_KEY"
fi

wait $VAULT_PID
