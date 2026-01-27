#!/bin/bash
# Script de demarrage du backend avec entrainement ML

# Attendre que Neo4j soit pret
echo "Attente de Neo4j..."
until curl -s http://neo4j:7474 > /dev/null 2>&1; do
  sleep 2
done
echo "Neo4j pret."

# Entrainer le modele si non existant
if [ ! -f "/app/models/risk_model.pkl" ]; then
  echo "Entrainement du modele ML..."
  python train_model.py
else
  echo "Modele ML deja present."
fi

# Demarrer l'API
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
