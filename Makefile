IMAGE_NAME=ft_transcendence
COMPOSE=docker compose
COMPOSE_FILE=srcs/docker-compose.yml

all: build up

build:
	$(COMPOSE) -f $(COMPOSE_FILE) build

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

reset:
	$(MAKE) clean
	$(MAKE) all