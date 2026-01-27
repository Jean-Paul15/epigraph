# Reference des Requetes Cypher

Ce document liste toutes les requetes Cypher importantes du projet.

## Statistiques Generales

### Compter les noeuds par type

```cypher
MATCH (n)
RETURN labels(n)[0] AS Type, count(n) AS Count
ORDER BY Count DESC
```

### Compter les relations par type

```cypher
MATCH ()-[r]->()
RETURN type(r) AS Type, count(r) AS Count
ORDER BY Count DESC
```

## Contact Tracing

### Chaine de contamination simple

```cypher
MATCH path = (p:Patient {patient_id: $id})-[:INFECTED_BY*1..3]->(contact)
RETURN path
LIMIT 50
```

### Super-propagateurs

```cypher
MATCH (spreader:Patient)-[:INFECTED_BY]->(infected:Patient)
WITH spreader, count(infected) AS infections
WHERE infections >= 5
RETURN spreader.patient_id, spreader.age, infections
ORDER BY infections DESC
LIMIT 10
```

### Chemin le plus court

```cypher
MATCH (source:Patient {patient_id: $source}),
      (target:Patient {patient_id: $target}),
      path = shortestPath((source)-[:INFECTED_BY*]-(target))
RETURN [n IN nodes(path) | n.patient_id] AS path, length(path) AS hops
```

## Algorithmes GDS

### Creer la projection

```cypher
CALL gds.graph.project(
  'epidemic-network',
  'Patient',
  'INFECTED_BY'
) YIELD graphName, nodeCount, relationshipCount
```

### Louvain (communautes)

```cypher
CALL gds.louvain.stream('epidemic-network')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId)) AS patients
RETURN communityId, size(patients) AS cluster_size
ORDER BY cluster_size DESC
```

### PageRank

```cypher
CALL gds.pageRank.stream('epidemic-network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS patient, score
RETURN patient.patient_id, score
ORDER BY score DESC
LIMIT 20
```

### Betweenness Centrality

```cypher
CALL gds.betweenness.stream('epidemic-network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS patient, score
WHERE score > 0
RETURN patient.patient_id, score
ORDER BY score DESC
```

## Analyses Geographiques

### Cas par pays

```cypher
MATCH (p:Patient)-[:LIVES_IN]->(l:Location)
MATCH (p)-[:HAS_DISEASE]->(:Disease)
RETURN l.country, count(p) AS cases
ORDER BY cases DESC
```

### Infections par ville avec coordonnees

```cypher
MATCH (p:Patient)-[:LIVES_IN]->(l:Location)
MATCH (p)-[:HAS_DISEASE]->(:Disease)
RETURN l.city, l.latitude, l.longitude, count(p) AS cases
ORDER BY cases DESC
```

## Ressources Hospitalieres

### Capacite par pays

```cypher
MATCH (h:Hospital)
RETURN h.country,
       count(h) AS hospitals,
       sum(h.capacity) AS total_capacity,
       sum(h.available_beds) AS available
ORDER BY total_capacity DESC
```

### Hopitaux proches saturation

```cypher
MATCH (h:Hospital)
WITH h, 1.0 - (toFloat(h.available_beds) / h.capacity) AS occupancy
WHERE occupancy >= 0.8
RETURN h.name, h.capacity, h.available_beds, occupancy
ORDER BY occupancy DESC
```

## Timeline

### Evolution temporelle

```cypher
MATCH ()-[r:INFECTED_BY]->()
WITH date(r.date) AS d, count(*) AS cases
RETURN d AS date, cases
ORDER BY d
```

### Infections par variant

```cypher
MATCH (p:Patient)-[:HAS_DISEASE]->(d:Disease)
RETURN d.variant, count(p) AS cases, avg(p.age) AS avg_age
ORDER BY cases DESC
```
