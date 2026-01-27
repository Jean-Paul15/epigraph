"""
Service GDS pour les algorithmes de graphes.
"""
from typing import List, Dict, Any
from .neo4j_service import Neo4jService


class GDSService:
    """Service pour les algorithmes Graph Data Science."""
    
    def __init__(self, neo4j: Neo4jService):
        self._neo4j = neo4j
        self._ensure_projection_exists()
    
    def _ensure_projection_exists(self) -> None:
        """Cree la projection GDS si elle n'existe pas."""
        check_query = """
        CALL gds.graph.exists('epidemic-network') YIELD exists
        RETURN exists
        """
        result = self._neo4j.run_query_single(check_query)
        
        if not result or not result.get('exists', False):
            create_query = """
            CALL gds.graph.project(
                'epidemic-network',
                'Patient',
                'INFECTED_BY'
            ) YIELD graphName
            RETURN graphName
            """
            try:
                self._neo4j.run_query(create_query)
            except Exception:
                pass  # La projection existe peut-etre deja
    
    def run_louvain(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Execute l'algorithme Louvain pour la detection de communautes."""
        self._ensure_projection_exists()
        query = """
        CALL gds.louvain.stream('epidemic-network')
        YIELD nodeId, communityId
        WITH communityId, collect(gds.util.asNode(nodeId)) AS patients
        RETURN communityId,
               size(patients) AS cluster_size,
               [p IN patients[0..5] | p.patient_id] AS sample_patients
        ORDER BY cluster_size DESC
        LIMIT $limit
        """
        return self._neo4j.run_query(query, {"limit": limit})
    
    def run_pagerank(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Execute PageRank pour identifier les patients centraux."""
        self._ensure_projection_exists()
        query = """
        CALL gds.pageRank.stream('epidemic-network')
        YIELD nodeId, score
        WITH gds.util.asNode(nodeId) AS patient, score
        RETURN patient.patient_id AS patient_id,
               patient.age AS age,
               patient.vaccination_status AS vaccination_status,
               score
        ORDER BY score DESC
        LIMIT $limit
        """
        return self._neo4j.run_query(query, {"limit": limit})
    
    def run_betweenness(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Execute Betweenness Centrality pour les points de blocage."""
        self._ensure_projection_exists()
        query = """
        CALL gds.betweenness.stream('epidemic-network')
        YIELD nodeId, score
        WITH gds.util.asNode(nodeId) AS patient, score
        WHERE score > 0
        RETURN patient.patient_id AS patient_id,
               patient.age AS age,
               score
        ORDER BY score DESC
        LIMIT $limit
        """
        return self._neo4j.run_query(query, {"limit": limit})
    
    def get_shortest_path(
        self, 
        source_id: str, 
        target_id: str
    ) -> Dict[str, Any]:
        """Trouve le chemin le plus court entre deux patients."""
        query = """
        MATCH (source:Patient {patient_id: $source}),
              (target:Patient {patient_id: $target}),
              path = shortestPath((source)-[:INFECTED_BY*]-(target))
        RETURN [n IN nodes(path) | n.patient_id] AS path,
               length(path) AS hops
        """
        return self._neo4j.run_query_single(
            query, 
            {"source": source_id, "target": target_id}
        )
    
    def get_node_similarity(self, threshold: float = 0.5) -> List[Dict]:
        """Calcule la similarite entre noeuds pour link prediction."""
        query = """
        CALL gds.nodeSimilarity.stream('epidemic-network', {
            similarityCutoff: $threshold
        })
        YIELD node1, node2, similarity
        WITH gds.util.asNode(node1) AS p1,
             gds.util.asNode(node2) AS p2,
             similarity
        WHERE NOT (p1)-[:INFECTED_BY]-(p2)
        RETURN p1.patient_id AS patient1,
               p2.patient_id AS patient2,
               similarity
        ORDER BY similarity DESC
        LIMIT 50
        """
        return self._neo4j.run_query(query, {"threshold": threshold})
