IMAGE_NAME=ft_transcendence
CONTAINER_NAME=ft_transcendence

all: build up

build:
	docker build -t $(IMAGE_NAME) .

up:
	docker run -d --name $(CONTAINER_NAME) $(IMAGE_NAME)

down:
	docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME)

clean:
	docker stop $(CONTAINER_NAME) || true
	docker rm -v $(CONTAINER_NAME) || true
	docker rmi $(IMAGE_NAME) || true

reset:
	$(MAKE) clean
	$(MAKE) all

NPM=npm --prefix srcs/

npmClean:
	$(NPM) run clean

buildFront:
	$(NPM) run build:frontend

buildBack:
	$(NPM) run build:backend

npmRun:
	$(NPM) run dev
