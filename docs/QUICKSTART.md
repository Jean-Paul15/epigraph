# Guide de Demarrage Rapide

Ce guide decrit le demarrage local d'EpiGraph avec Docker.

## Prerequis

- Docker Desktop installe et lance
- 8 GB de RAM disponible
- Connexion internet (pour telecharger les images)

## Etape 1 : Configuration

```bash
# Aller dans le dossier du projet
cd epigraph

# Copier le fichier d'environnement
cp .env.example .env
```

## Etape 2 : Generation des donnees

```bash
# Generer les CSV
docker-compose run --rm data-generator
```

Les fichiers CSV du graphe dans `data/csv/`.

## Etape 3 : Demarrer les services

```bash
docker-compose up -d
```

Attendre que tous les services soient prets :

```bash
docker-compose ps
```

Tous les services doivent etre en statut "healthy" ou "running".

## Etape 4 : Import des donnees

L'import est lance automatiquement au demarrage du conteneur Neo4j (`neo4j/scripts/init.sh`), a partir des CSV de `data/csv/`. Les scripts Cypher, executes dans l'ordre :

- `01_constraints.cypher` : contraintes et index
- `02_import_nodes.cypher` : noeuds
- `03a`, `03b`, `03c` : relations (patients, evenements, entites)
- `06_healthy_patients.cypher` : patients sains pour les predictions
- `04_projections.cypher` et `05_validation.cypher` : projections GDS et controles, a lancer manuellement dans Neo4j Browser (http://localhost:7474)

## Etape 5 : Acceder au Dashboard

Ouvrir http://localhost:3000

## Verification

Si tout fonctionne, vous devriez voir :

- **Dashboard** avec les KPIs affiches
- **Neo4j Browser** accessible
- **API Swagger** avec tous les endpoints

## Troubleshooting

### Les CSV ne sont pas generes

```bash
# Verifier les logs du generateur
docker-compose logs data-generator
```

### Neo4j ne demarre pas

```bash
# Verifier les logs Neo4j
docker-compose logs neo4j
```

### Le dashboard n'affiche pas de donnees

1. Verifier que les donnees sont importees dans Neo4j
2. Verifier que le backend est lance : http://localhost:8000/health

## Prochaines etapes

- Explorer les notebooks Jupyter : http://localhost:8888
- Lire la documentation des algorithmes GDS
