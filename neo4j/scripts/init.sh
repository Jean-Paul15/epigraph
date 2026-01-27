#!/bin/bash
# Script d'initialisation automatique Neo4j
# Execute au demarrage du conteneur apres Neo4j ready

set -e

NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:?NEO4J_PASSWORD non défini}"
NEO4J_URI="bolt://localhost:7687"

echo "=========================================="
echo "  EpiGraph - Initialisation Neo4j"
echo "=========================================="

# Attendre que Neo4j soit pret
echo "[1/5] Attente de Neo4j..."
until cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "RETURN 1" > /dev/null 2>&1; do
  sleep 2
done
echo "      Neo4j pret"

# Verifier si les donnees existent deja
echo "[2/5] Verification des donnees existantes..."
COUNT=$(cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
  "MATCH (n) RETURN count(n) AS c" --format plain | tail -1)

if [ "$COUNT" -gt "100" ]; then
  echo "      Donnees deja presentes ($COUNT noeuds). Import ignore."
  exit 0
fi

# Importer les contraintes
echo "[3/5] Creation des contraintes..."
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/01_constraints.cypher

# Importer les noeuds
echo "[4/5] Import des noeuds..."
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/02_import_nodes.cypher

# Importer les relations
echo "[5/5] Import des relations..."
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/03a_import_patient_rels.cypher
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/03b_import_event_rels.cypher
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/03c_import_entity_rels.cypher

# Creer les patients sains pour les predictions ML
echo "[6/6] Creation des patients sains..."
cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -f /scripts/06_healthy_patients.cypher || true

echo ""
echo "=========================================="
echo "  Import termine avec succes"
echo "==========================================""
