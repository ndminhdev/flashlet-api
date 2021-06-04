CONTAINER_NAME=node-app

start:
	docker-compose up

stop:
	docker-compose stop

remove:
	docker-compose down

mount: # copy node_modules from inside container to host machine
	sudo docker container cp $(CONTAINER_NAME):/usr/src/app/node_modules .

bash: # make container interactive
	docker container exec -it $(CONTAINER_NAME) /bin/sh