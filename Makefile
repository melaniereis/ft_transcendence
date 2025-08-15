IMAGE_NAME=ft_transcendence
<<<<<<< HEAD
SERVICE_NAME=web
=======
COMPOSE=docker-compose
COMPOSE_FILE=srcs/docker-compose.yml
>>>>>>> main

all: build up

build:
<<<<<<< HEAD
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans
	docker image rm $(IMAGE_NAME) || true
=======
	$(COMPOSE) -f $(COMPOSE_FILE) build

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans
>>>>>>> main

reset:
	$(MAKE) clean
	$(MAKE) all