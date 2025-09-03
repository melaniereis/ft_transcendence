#!/bin/bash

set -e

echo "🔐 Starting Vault initialization at $(date)..."

# Set VAULT_TOKEN and VAULT_ADDR from environment
export VAULT_TOKEN=root
export VAULT_ADDR=http://127.0.0.1:8200

# Start Vault in dev mode in the background
echo "🚀 Starting Vault server..."
vault server -dev -dev-root-token-id=root -dev-listen-address=0.0.0.0:8200 &
VAULT_PID=$!

# Wait for Vault to become ready
echo "⏳ Waiting for Vault to be ready..."
for i in {1..20}; do
  if vault status >/dev/null 2>&1; then
    echo "✅ Vault is ready."
    break
  fi
  echo "🔄 Vault not ready yet... retrying ($i/20)"
  sleep 1
done

# Enable KV v2 secrets engine
echo "📁 Enabling KV v2 secrets engine..."
vault secrets enable -path=secret-v2 kv-v2 || echo "KV v2 already enabled."

# Store app config secret
echo "📦 Setting secret at secret-v2/ft_transcendence..."
vault kv put secret-v2/ft_transcendence \
  db_path="/usr/src/app/data/database.db" \
  jwt_secret="a-very-secure-random-key-123"

# Store encryption key for SQLite
echo "🔑 Checking if encryption key already exists..."
if ! vault kv get secret-v2/sqlite > /dev/null 2>&1; then
  echo "🔐 Generating and storing new encryption key at secret-v2/sqlite..."
  RANDOM_KEY=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  vault kv put secret-v2/sqlite key="$RANDOM_KEY"
else
  echo "✅ Encryption key already exists at secret-v2/sqlite"
fi

echo "🎉 Vault initialized with secrets at $(date)"

# Keep the Vault process running
echo "🟢 Vault server running and ready for connections..."
wait $VAULT_PID
