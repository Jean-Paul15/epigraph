# Architecture Technique EpiGraph

Ce document decrit l'architecture technique complete du projet.

## Vue d'ensemble

EpiGraph est compose de 5 services Docker interconnectes.

## Services

### 1. Neo4j (epigraph-neo4j)

Base de donnees graphe principale.

- **Image** : neo4j:5.15.0-enterprise
- **Ports** : 7474 (HTTP), 7687 (Bolt)
- **Plugins** : APOC, Graph Data Science (GDS)
- **Volume** : neo4j_data pour la persistence

**Responsabilites** :
- Stockage du graphe epidemiologique
- Execution des requetes Cypher
- Algorithmes GDS (Louvain, PageRank, etc.)

### 2. Backend API (epigraph-backend)

API REST pour servir le frontend.

- **Framework** : FastAPI (Python 3.11)
- **Port** : 8000
- **Documentation** : /docs (Swagger UI)

**Responsabilites** :
- Connexion a Neo4j via driver Python
- Endpoints REST pour les requetes
- Service ML pour les predictions
- Validation des donnees (Pydantic)

### 3. Frontend (epigraph-frontend)

Dashboard interactif.

- **Framework** : Next.js 14 (React 18)
- **Port** : 3000
- **Styling** : Tailwind CSS

**Responsabilites** :
- Interface utilisateur
- Visualisations (D3.js, Neovis.js)
- Appels API vers le backend

### 4. Jupyter (epigraph-jupyter)

Environnement d'analyse.

- **Image** : jupyter/scipy-notebook
- **Port** : 8888
- **Token** : valeur de `JUPYTER_TOKEN` (fichier `.env`)

**Responsabilites** :
- Exploration des donnees
- Prototypage des requetes
- Entrainement des modeles ML

### 5. Data Generator (epigraph-generator)

Generation du dataset.

- **Execution** : One-shot (run --rm)
- **Output** : fichiers CSV (noeuds et relations) dans `data/csv/`

**Responsabilites** :
- Telechargement donnees JHU
- Simulation reseau SEIR
- Export CSV pour Neo4j

## Flux de donnees

```text
[Johns Hopkins API]
        |
        v
[Data Generator] --> [CSV Files] --> [Neo4j Import]
                                            |
                                            v
                                      [Neo4j Database]
                                            |
                    +-----------------------+
                    |                       |
                    v                       v
              [Backend API]          [Jupyter Notebooks]
                    |
                    v
              [Frontend Dashboard]
```

## Reseau Docker

Tous les services sont sur le reseau `epigraph-network` (bridge).

Communication interne :
- Frontend -> Backend : http://backend:8000
- Backend -> Neo4j : bolt://neo4j:7687
- Jupyter -> Neo4j : bolt://neo4j:7687

## Volumes

| Volume | Service | Contenu |
|--------|---------|---------|
| neo4j_data | neo4j | Donnees du graphe |
| neo4j_logs | neo4j | Logs Neo4j |
| ./data/csv | neo4j, generator | Fichiers CSV |
| ./notebooks | jupyter | Notebooks |

## Securite

- Pas de secrets hardcodes (variables d'environnement)
- CORS configure pour localhost:3000
- Authentification Neo4j obligatoire
