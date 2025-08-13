IMAGE_NAME=ft_transcendence
SERVICE_NAME=web

all: build up

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down --remove-orphans
	docker image rm $(IMAGE_NAME) || true

reset:
	$(MAKE) clean
	$(MAKE) all