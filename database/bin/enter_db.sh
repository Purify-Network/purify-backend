#!/usr/bin/env bash
#########################################
#  Enter aqua database docker container
#########################################

# Set local variables
DOCKER_CONTAINER_NAME="aqua_database"

# Enter the postgres docker container
docker exec -it \
    "$DOCKER_CONTAINER_NAME" \
    psql -U postgres
