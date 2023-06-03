#!make
include .env

build-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

createdb:
	docker exec -it mysql_zen mysql -u root -p

startdb:
	docker start mysql_zen

stopdb:
	docker stop mysql_zen

dev:
	yarn run dev

start:
	docker start zenitha

stop:
	docker stop zenitha

restart:
	docker stop zenitha && docker start zenitha

log:
	docker logs zenitha

migrate-test:
	 knex migrate:latest --env test

migrate:
	 knex migrate:latest


.PHONY: mysql createdb startdb stopdb dev start stop restart build-dev log migrate migrate-test