"""
Extracteur de features depuis Neo4j pour le ML.
"""
from typing import Dict, List, Optional, Any
from ..services.neo4j_service import Neo4jService


class FeatureExtractor:
    """Extrait les features des patients depuis Neo4j."""
    
    def __init__(self, neo4j: Neo4jService):
        self._neo4j = neo4j
    
    def extract_patient_features(self, patient_id: str) -> Optional[Dict]:
        """Extrait les features d'un patient specifique."""
        query = """
        MATCH (p:Patient {patient_id: $id})
        OPTIONAL MATCH (p)-[:LIVES_IN]->(l:Location)
        OPTIONAL MATCH (p)-[:INFECTED_BY]-(contact)
        RETURN p.patient_id AS patient_id,
               p.age AS age,
               p.gender AS gender,
               p.comorbidities AS comorbidities,
               p.vaccination_status AS vaccination_status,
               l.population_density AS location_density,
               l.total_confirmed_cases AS local_cases,
               count(contact) AS contact_count
        """
        return self._neo4j.run_query_single(query, {"id": patient_id})
    
    def extract_all_features(self, limit: int = 10000) -> List[Dict]:
        """Extrait les features de tous les patients."""
        query = """
        MATCH (p:Patient)
        OPTIONAL MATCH (p)-[:LIVES_IN]->(l:Location)
        OPTIONAL MATCH (p)-[:INFECTED_BY]-(contact)
        OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
        WITH p, l, count(contact) AS contacts, 
             CASE WHEN d IS NOT NULL THEN 1 ELSE 0 END AS is_infected
        RETURN p.patient_id AS patient_id,
               p.age AS age,
               p.gender AS gender,
               p.comorbidities AS comorbidities,
               p.vaccination_status AS vaccination_status,
               coalesce(l.population_density, 0) AS location_density,
               coalesce(l.total_confirmed_cases, 0) AS local_cases,
               contacts AS contact_count,
               is_infected AS label
        LIMIT $limit
        """
        return self._neo4j.run_query(query, {"limit": limit})
    
    def extract_graph_features(self, patient_id: str) -> Dict[str, Any]:
        """Extrait les features de graphe (centralite, etc)."""
        # PageRank du patient
        pagerank_query = """
        CALL gds.pageRank.stream('epidemic-network')
        YIELD nodeId, score
        WITH gds.util.asNode(nodeId) AS node, score
        WHERE node.patient_id = $id
        RETURN score AS pagerank
        """
        
        pagerank = self._neo4j.run_query_single(
            pagerank_query, {"id": patient_id}
        )
        
        # Degree centrality
        degree_query = """
        MATCH (p:Patient {patient_id: $id})-[:INFECTED_BY]-(contact)
        RETURN count(contact) AS degree
        """
        
        degree = self._neo4j.run_query_single(
            degree_query, {"id": patient_id}
        )
        
        return {
            "pagerank": pagerank.get("pagerank", 0) if pagerank else 0,
            "degree": degree.get("degree", 0) if degree else 0
        }
