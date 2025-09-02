FROM hashicorp/vault:1.20.2

# Copy the initialization script
COPY init-vault.sh /usr/local/bin/init-vault.sh

# Make it executable
RUN chmod +x /usr/local/bin/init-vault.sh

# Use sh to execute
ENTRYPOINT ["sh", "/usr/local/bin/init-vault.sh"]