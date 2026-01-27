"""
Routes API pour les infections.
"""
from fastapi import APIRouter, Request, Query
from typing import Optional

router = APIRouter()


@router.get("/chain/{patient_id}")
async def get_infection_chain(
    request: Request,
    patient_id: str,
    depth: int = Query(3, ge=1, le=6)
):
    """Recupere la chaine de contamination d'un patient."""
    neo4j = request.app.state.neo4j
    
    query = f"""
    MATCH path = (p:Patient {{patient_id: $id}})-[:INFECTED_BY*1..{depth}]->(infected)
    RETURN [n IN nodes(path) | {{
        id: n.patient_id,
        age: n.age,
        vaccination_status: n.vaccination_status
    }}] AS chain,
    length(path) AS depth
    LIMIT 100
    """
    
    return neo4j.run_query(query, {"id": patient_id})


@router.get("/superspreaders")
async def get_superspreaders(
    request: Request,
    min_infections: int = Query(5, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Identifie les super-propagateurs."""
    neo4j = request.app.state.neo4j
    
    # La relation INFECTED_BY va de l'infecte vers l'infecteur
    # Donc on cherche les patients qui sont la cible de nombreuses relations
    query = """
    MATCH (infected:Patient)-[:INFECTED_BY]->(spreader:Patient)
    WITH spreader, count(infected) AS infections
    WHERE infections >= $min
    RETURN spreader.patient_id AS id,
           spreader.age AS age,
           spreader.vaccination_status AS vaccination_status,
           spreader.comorbidities AS comorbidities,
           infections
    ORDER BY infections DESC
    LIMIT $limit
    """
    
    return neo4j.run_query(query, {"min": min_infections, "limit": limit})


@router.get("/timeline")
async def get_infection_timeline(
    request: Request,
    country: Optional[str] = None
):
    """Evolution temporelle des infections."""
    neo4j = request.app.state.neo4j
    
    country_filter = ""
    params = {}
    
    if country:
        country_filter = """
        MATCH (infected)-[:LIVES_IN]->(l:Location {country: $country})
        WITH r, infected, l
        """
        params["country"] = country
    
    query = f"""
    MATCH ()-[r:INFECTED_BY]->()
    {country_filter}
    WITH date(r.date) AS infection_date, count(*) AS cases
    RETURN infection_date, cases
    ORDER BY infection_date
    """
    
    return neo4j.run_query(query, params)


@router.get("/by-variant")
async def get_infections_by_variant(request: Request):
    """Repartition des infections par variant."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (p:Patient)-[:HAS_DISEASE]->(d:Disease)
    RETURN d.variant AS variant,
           count(p) AS cases,
           avg(p.age) AS avg_age,
           d.transmission_rate AS transmission_rate
    ORDER BY cases DESC
    """
    
    return neo4j.run_query(query)


@router.get("/by-location")
async def get_infections_by_location(request: Request):
    """Repartition geographique des infections."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (p:Patient)-[:LIVES_IN]->(l:Location)
    MATCH (p)-[:HAS_DISEASE]->(:Disease)
    RETURN l.country AS country,
           l.city AS city,
           l.latitude AS latitude,
           l.longitude AS longitude,
           count(p) AS cases
    ORDER BY cases DESC
    """
    
    return neo4j.run_query(query)


@router.get("/cluster-stats")
async def get_cluster_stats(request: Request):
    """Statistiques des clusters detectes par Louvain."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (p:Patient)
    WHERE p.clusterId IS NOT NULL
    WITH p.clusterId AS clusterId, COUNT(*) AS size
    RETURN COUNT(DISTINCT clusterId) AS total_clusters,
           MAX(size) AS max_cluster_size,
           AVG(size) AS avg_cluster_size,
           SUM(CASE WHEN size >= 10 THEN 1 ELSE 0 END) AS significant_clusters
    """
    
    return neo4j.run_query_single(query)
