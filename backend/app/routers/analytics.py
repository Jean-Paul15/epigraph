"""
Routes API pour les analytics GDS.
"""
from fastapi import APIRouter, Request, Query

from ..services.gds_service import GDSService

router = APIRouter()


@router.get("/communities")
async def get_communities(
    request: Request,
    limit: int = Query(20, ge=1, le=100)
):
    """Detection de communautes avec Louvain."""
    neo4j = request.app.state.neo4j
    gds = GDSService(neo4j)
    
    return gds.run_louvain(limit)


@router.get("/pagerank")
async def get_pagerank(
    request: Request,
    limit: int = Query(20, ge=1, le=100)
):
    """Calcul du PageRank des patients."""
    neo4j = request.app.state.neo4j
    gds = GDSService(neo4j)
    
    return gds.run_pagerank(limit)


@router.get("/centrality")
async def get_centrality(
    request: Request,
    limit: int = Query(15, ge=1, le=50)
):
    """Calcul de la Betweenness Centrality."""
    neo4j = request.app.state.neo4j
    gds = GDSService(neo4j)
    
    return gds.run_betweenness(limit)


@router.get("/shortest-path")
async def get_shortest_path(
    request: Request,
    source: str = Query(..., description="ID du patient source"),
    target: str = Query(..., description="ID du patient cible")
):
    """Chemin le plus court entre deux patients."""
    neo4j = request.app.state.neo4j
    gds = GDSService(neo4j)
    
    result = gds.get_shortest_path(source, target)
    
    if not result:
        return {"message": "Aucun chemin trouve", "path": [], "hops": -1}
    
    return result


@router.get("/similarity")
async def get_node_similarity(
    request: Request,
    threshold: float = Query(0.5, ge=0.0, le=1.0)
):
    """Similarite entre noeuds pour link prediction."""
    neo4j = request.app.state.neo4j
    gds = GDSService(neo4j)
    
    return gds.get_node_similarity(threshold)


@router.get("/stats")
async def get_graph_stats(request: Request):
    """Statistiques globales du graphe."""
    neo4j = request.app.state.neo4j
    
    query = """
    CALL gds.graph.list()
    YIELD graphName, nodeCount, relationshipCount, memoryUsage
    RETURN graphName, nodeCount, relationshipCount, memoryUsage
    """
    
    return neo4j.run_query(query)
