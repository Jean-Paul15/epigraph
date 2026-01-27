// Requetes de validation et exemples EpiGraph

// ============================================================
// STATISTIQUES GENERALES
// ============================================================

// Compter les noeuds par type
MATCH (n) 
RETURN labels(n)[0] AS Type, count(n) AS Count
ORDER BY Count DESC;

// Compter les relations par type
MATCH ()-[r]->() 
RETURN type(r) AS RelationType, count(r) AS Count
ORDER BY Count DESC;

// ============================================================
// CONTACT TRACING
// ============================================================

// Chaine de contamination depuis patient zero (3 niveaux)
MATCH path = (p:Patient {patient_id: 'P000000'})-[:INFECTED_BY*1..3]->(infected)
RETURN path
LIMIT 50;

// Super-propagateurs (5+ infections)
MATCH (spreader:Patient)-[:INFECTED_BY]->(infected:Patient)
WITH spreader, count(infected) AS infections
WHERE infections >= 5
RETURN spreader.patient_id, 
       spreader.age,
       spreader.vaccination_status,
       infections
ORDER BY infections DESC
LIMIT 10;

// ============================================================
// ALGORITHMES GDS
// ============================================================

// Louvain Community Detection
CALL gds.louvain.stream('epidemic-network')
YIELD nodeId, communityId
WITH gds.util.asNode(nodeId) AS patient, communityId
RETURN communityId, 
       count(patient) AS cluster_size
ORDER BY cluster_size DESC
LIMIT 10;

// PageRank - Patients centraux
CALL gds.pageRank.stream('epidemic-network')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS patient, score
RETURN patient.patient_id, 
       patient.age,
       score
ORDER BY score DESC 
LIMIT 20;

// ============================================================
// ANALYSES GEOGRAPHIQUES
// ============================================================

// Distribution des cas par pays
MATCH (p:Patient)-[:LIVES_IN]->(l:Location)
MATCH (p)-[:HAS_DISEASE]->(:Disease)
RETURN l.country, count(p) AS cases
ORDER BY cases DESC;

// ============================================================
// RESSOURCES HOSPITALIERES
// ============================================================

// Hopitaux par capacite disponible
MATCH (h:Hospital)
RETURN h.name, 
       h.capacity, 
       h.available_beds,
       h.equipment_level
ORDER BY h.available_beds DESC
LIMIT 10;
