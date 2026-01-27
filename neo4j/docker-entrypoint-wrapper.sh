#!/bin/bash
# Wrapper pour demarrer Neo4j et executer l'initialisation

# Demarrer Neo4j en arriere-plan
/startup/docker-entrypoint.sh neo4j &

# Attendre que Neo4j soit completement demarre
echo "Attente du demarrage de Neo4j..."
until cypher-shell -u "${NEO4J_AUTH%%/*}" -p "${NEO4J_AUTH##*/}" "RETURN 1" > /dev/null 2>&1; do
  sleep 3
done

echo "Neo4j demarre, lancement de l'initialisation..."

# Executer le script d'initialisation
/scripts/init.sh

# Garder le conteneur en vie
wait
