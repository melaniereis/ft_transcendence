IMAGE_NAME=ft_transcendence
COMPOSE=docker compose
COMPOSE_FILE=srcs/docker-compose.yml

all: build up

encrypt:
	@echo "🔐 Encrypting database before startup..."
	$(COMPOSE) -f $(COMPOSE_FILE) run --rm \
	-e VAULT_ADDR=http://vault:8200 \
	-e VAULT_TOKEN=root \
	web \
	node --loader ts-node/esm backend/utils/encrypt-db.ts
	
build:
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

re: clean build up
