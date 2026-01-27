"""
Routes API pour les patients.
"""
from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional

router = APIRouter()


@router.get("/")
async def get_patients(
    request: Request,
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    country: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None
):
    """Liste les patients avec filtres optionnels."""
    neo4j = request.app.state.neo4j
    
    conditions = []
    params = {"limit": limit, "skip": skip}
    
    if country:
        conditions.append("l.country = $country")
        params["country"] = country
    if min_age:
        conditions.append("p.age >= $min_age")
        params["min_age"] = min_age
    if max_age:
        conditions.append("p.age <= $max_age")
        params["max_age"] = max_age
    
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    query = f"""
    MATCH (p:Patient)-[:LIVES_IN]->(l:Location)
    {where_clause}
    RETURN p.patient_id AS id,
           p.age AS age,
           p.gender AS gender,
           p.comorbidities AS comorbidities,
           p.vaccination_status AS vaccination_status,
           l.country AS country,
           l.city AS city
    ORDER BY p.patient_id
    SKIP $skip
    LIMIT $limit
    """
    
    return neo4j.run_query(query, params)


@router.get("/stats")
async def get_patient_stats(request: Request):
    """Statistiques globales des patients."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (p:Patient)
    RETURN count(p) AS total,
           avg(p.age) AS avg_age,
           count(CASE WHEN p.gender = 'M' THEN 1 END) AS males,
           count(CASE WHEN p.gender = 'F' THEN 1 END) AS females
    """
    
    return neo4j.run_query_single(query)


@router.get("/{patient_id}")
async def get_patient(request: Request, patient_id: str):
    """Recupere un patient par son ID."""
    neo4j = request.app.state.neo4j
    
    query = """
    MATCH (p:Patient {patient_id: $id})-[:LIVES_IN]->(l:Location)
    OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
    OPTIONAL MATCH (p)-[:VACCINATED_WITH]->(v:Vaccine)
    RETURN p.patient_id AS id,
           p.age AS age,
           p.gender AS gender,
           p.comorbidities AS comorbidities,
           p.vaccination_status AS vaccination_status,
           l.country AS country,
           l.city AS city,
           d.variant AS disease_variant,
           collect(DISTINCT v.name) AS vaccines
    """
    
    result = neo4j.run_query_single(query, {"id": patient_id})
    
    if not result:
        raise HTTPException(status_code=404, detail="Patient non trouve")
    
    return result


@router.get("/{patient_id}/contacts")
async def get_patient_contacts(
    request: Request, 
    patient_id: str,
    depth: int = Query(2, ge=1, le=5)
):
    """Recupere les contacts d'un patient."""
    neo4j = request.app.state.neo4j
    
    query = f"""
    MATCH path = (p:Patient {{patient_id: $id}})-[:INFECTED_BY*1..{depth}]-(contact)
    RETURN DISTINCT contact.patient_id AS contact_id,
           contact.age AS age,
           length(path) AS distance
    ORDER BY distance
    LIMIT 100
    """
    
    return neo4j.run_query(query, {"id": patient_id})
