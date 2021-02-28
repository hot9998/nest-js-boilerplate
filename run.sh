up() {
    docker-compose -f docker/docker-compose.yml up --remove-orphans --build
}

down() {
    docker-compose -f docker/docker-compose.yml down --remove-orphans
}

MODE=$1

if [ "${MODE}" == "up" ]; then
  up
elif [ "${MODE}" == "down" ]; then
  down
else
  echo "ERROR: The \"up\" or \"down\" command must be in the parameter."
  exit 1
fi