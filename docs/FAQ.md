# FAQ - Questions Frequentes

## Installation et Configuration

### Docker ne demarre pas

**Symptome** : "Cannot connect to the Docker daemon"

**Solution** :
1. Verifier que Docker Desktop est lance
2. Sur Windows, verifier que WSL2 est installe
3. Redemarrer Docker Desktop

### Neo4j refuse de demarrer

**Symptome** : Container en restart loop

**Solutions** :
1. Augmenter la memoire allouee a Docker (minimum 4 GB pour Neo4j)
2. Verifier les ports 7474 et 7687 libres
3. Supprimer les volumes et recreer : `docker-compose down -v`

### Les CSV ne sont pas trouves

**Symptome** : "Couldn't load the external resource"

**Solution** :
1. Verifier que les CSV sont dans `data/csv/`
2. Le dossier est monte vers `/var/lib/neo4j/import` dans le container
3. Dans les requetes, utiliser `file:///` (sans chemin)

## Import des Donnees

### Import tres lent

**Solution** :
- Utiliser `:auto` avec `IN TRANSACTIONS OF 500 ROWS`
- Augmenter `dbms.transaction.timeout` dans neo4j.conf

### Doublons crees a l'import

**Solution** :
1. Supprimer les donnees : `MATCH (n) DETACH DELETE n`
2. Creer les contraintes AVANT l'import
3. Reimporter

### Erreur "Node already exists"

**Solution** :
```cypher
CREATE CONSTRAINT IF NOT EXISTS ...
```

Utiliser `IF NOT EXISTS` pour les contraintes idempotentes.

## Algorithmes GDS

### "Graph 'epidemic-network' does not exist"

**Solution** :
Creer la projection d'abord :
```cypher
CALL gds.graph.project('epidemic-network', 'Patient', 'INFECTED_BY')
```

### Louvain retourne des resultats vides

**Causes possibles** :
1. Pas assez de relations INFECTED_BY
2. Graphe non connecte
3. Projection sur mauvais types de noeuds

### Out of Memory sur GDS

**Solution** :
1. Augmenter la heap Neo4j
2. Reduire la taille du graphe projete
3. Utiliser le mode `stream` au lieu de `write`

## Dashboard

### Le dashboard affiche "Loading..." indefiniment

**Causes** :
1. Backend non demarre : verifier http://localhost:8000/health
2. Neo4j non connecte
3. CORS bloque (verifier la console navigateur)

### Les graphiques ne s'affichent pas

**Solutions** :
1. Verifier que les donnees sont importees dans Neo4j
2. Rafraichir la page
3. Verifier les logs du backend

## Machine Learning

### Le modele n'est pas entraine

Le modele est entraine au premier appel. Si pas assez de donnees :
- Minimum 100 patients pour entrainer
- Verifier les features extraites

### Predictions toujours identiques

Causes :
1. Modele non charge
2. Features mal encodees
3. Fallback sur regles simples

## Performance

### Requetes lentes

**Optimisations** :
1. Creer des index sur les proprietes filtrees
2. Utiliser `EXPLAIN` pour voir le plan d'execution
3. Limiter les resultats avec `LIMIT`

### Neo4j utilise trop de memoire

**Configuration** dans neo4j.conf :
```
server.memory.heap.initial_size=512m
server.memory.heap.max_size=2G
server.memory.pagecache.size=512m
```

## Performance des requetes

### Comment mesurer une requete ?

Utiliser `PROFILE` avant la requete :
```cypher
PROFILE MATCH path = (p:Patient {patient_id: 'P000000'})-[:INFECTED_BY*1..3]->(c)
RETURN count(c)
```

Le plan retourne le temps d'execution et le nombre d'operations.
