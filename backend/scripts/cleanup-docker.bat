@echo off
docker container prune -f
docker image prune -a -f
docker volume prune -f
docker network prune -f
docker system prune --volumes -f
