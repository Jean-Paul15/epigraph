"""
Service de connexion Neo4j.
"""
from neo4j import GraphDatabase
from neo4j.time import Date, DateTime
from typing import List, Dict, Any, Optional
from ..config import settings


def convert_neo4j_types(value: Any) -> Any:
    """Convertit les types Neo4j en types JSON serialisables."""
    if isinstance(value, Date):
        return value.isoformat()
    if isinstance(value, DateTime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: convert_neo4j_types(v) for k, v in value.items()}
    if isinstance(value, list):
        return [convert_neo4j_types(v) for v in value]
    return value


class Neo4jService:
    """Client Neo4j avec pool de connexions."""
    
    def __init__(self):
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )
    
    def close(self):
        """Ferme la connexion."""
        if self._driver:
            self._driver.close()
    
    def run_query(
        self, 
        query: str, 
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Execute une requete Cypher."""
        with self._driver.session() as session:
            result = session.run(query, params or {})
            records = [dict(record) for record in result]
            # Conversion des types Neo4j
            return [convert_neo4j_types(r) for r in records]
    
    def run_query_single(
        self, 
        query: str, 
        params: Optional[Dict] = None
    ) -> Optional[Dict[str, Any]]:
        """Execute une requete et retourne un seul resultat."""
        results = self.run_query(query, params)
        return results[0] if results else None
    
    def get_stats(self) -> Dict[str, int]:
        """Retourne les statistiques de la base."""
        query = """
        MATCH (n) 
        RETURN labels(n)[0] AS label, count(n) AS count
        """
        results = self.run_query(query)
        return {r['label']: r['count'] for r in results}
    
    def check_connection(self) -> bool:
        """Verifie que la connexion fonctionne."""
        try:
            self.run_query("RETURN 1")
            return True
        except Exception:
            return False
