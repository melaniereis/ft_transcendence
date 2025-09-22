COMPOSE=docker compose
COMPOSE_FILE=srcs/docker-compose.yml

all: build up

encryptdb:
	@echo "🔐 Encrypting the database using stored Vault key..."
	$(COMPOSE) -f $(COMPOSE_FILE) run --rm \
		-e VAULT_ADDR=http://vault:8200 \
		-e VAULT_TOKEN=root \
		web \
		npx tsx backend/utils/encrypt-db.ts
	sudo chown $$(whoami):$$(whoami) ./srcs/data/database.db.enc
	sudo chmod u+rw ./srcs/data/database.db.enc

build:
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

stop:
	$(COMPOSE) -f $(COMPOSE_FILE) stop

clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

re: clean build up
