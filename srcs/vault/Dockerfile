FROM hashicorp/vault:1.20.2

COPY init-vault.sh /usr/local/bin/init-vault.sh

RUN chmod +x /usr/local/bin/init-vault.sh

ENTRYPOINT ["sh", "/usr/local/bin/init-vault.sh"]
