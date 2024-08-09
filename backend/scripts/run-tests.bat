@echo off
setlocal

set OPTS=-f docker-compose.yml -f docker-compose.tests.yml

docker-compose %OPTS% down --volumes
docker-compose %OPTS% build
docker-compose %OPTS% run --rm api sh -c "npm install"
docker-compose %OPTS% run --rm api sh -c "npm test"
docker-compose %OPTS% down --volumes

endlocal
