"""
Routes API pour les hopitaux.
"""
from fastapi import APIRouter, Request, Query
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_hospitals(
    request: Request,
    country: Optional[str] = None,
    equipment_level: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200)
):
    """Liste les hopitaux avec filtres."""
    neo4j = request.app.state.neo4j
    
    conditions = []
    params = {"limit": limit}
    
    if country:
        conditions.append("h.country = $country")
        params["country"] = country
    if equipment_level:
        conditions.append("h.equipment_level = $equipment")
        params["equipment"] = equipment_level
    
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    query = f"""
    MATCH (h:Hospital)-[:LOCATED_IN]->(l:Location)
    {where_clause}
    RETURN h.hospital_id AS id,
           h.name AS name,
           h.capacity AS capacity,
           h.available_beds AS available_beds,
           h.equipment_level AS equipment_level,
           l.country AS country,
           l.city AS city,
           l.latitude AS latitude,
           l.longitude AS longitude
    ORDER BY h.available_beds DESC
    LIMIT $limit
    """
    
    return neo4j.run_query(query, params)


@router.get("/capacity")
async def get_hospital_capacity(request: Request):
    """Statistiques de capacite hospitaliere par pays."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (h:Hospital)
    RETURN h.country AS country,
           count(h) AS hospitals,
           sum(h.capacity) AS total_capacity,
           sum(h.available_beds) AS total_available,
           avg(h.available_beds * 1.0 / h.capacity) AS avg_occupancy
    ORDER BY total_capacity DESC
    """
    
    return neo4j.run_query(query)


@router.get("/saturation")
async def get_hospital_saturation(
    request: Request,
    threshold: float = Query(0.8, ge=0.0, le=1.0)
):
    """Hopitaux proches de la saturation."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (h:Hospital)-[:LOCATED_IN]->(l:Location)
    WITH h, l, 
         1.0 - (toFloat(h.available_beds) / h.capacity) AS occupancy
    WHERE occupancy >= $threshold
    RETURN h.hospital_id AS id,
           h.name AS name,
           h.capacity AS capacity,
           h.available_beds AS available_beds,
           occupancy,
           l.city AS city
    ORDER BY occupancy DESC
    """
    
    return neo4j.run_query(query, {"threshold": threshold})


@router.get("/transfers")
async def get_hospital_transfers(request: Request):
    """Reseau de transferts entre hopitaux."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (h1:Hospital)-[t:TRANSFERS_TO]->(h2:Hospital)
    RETURN h1.name AS from_hospital,
           h2.name AS to_hospital,
           t.patient_count AS transfers,
           h1.country AS country
    ORDER BY transfers DESC
    LIMIT 50
    """
    
    return neo4j.run_query(query)


@router.get("/{hospital_id}")
async def get_hospital(request: Request, hospital_id: str):
    """Details d'un hopital."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (h:Hospital {hospital_id: $id})-[:LOCATED_IN]->(l:Location)
    OPTIONAL MATCH (p:Patient)-[:TREATED_AT]->(h)
    RETURN h.hospital_id AS id,
           h.name AS name,
           h.capacity AS capacity,
           h.available_beds AS available_beds,
           h.equipment_level AS equipment_level,
           l.country AS country,
           l.city AS city,
           count(p) AS patients_treated
    """
    
    return neo4j.run_query_single(query, {"id": hospital_id})
