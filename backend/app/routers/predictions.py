"""
Routes API pour les predictions ML.
"""
from fastapi import APIRouter, Request, Query, HTTPException
from typing import List
from datetime import datetime
import os

from ..ml.risk_predictor import RiskPredictor
from ..ml.feature_extractor import FeatureExtractor

router = APIRouter()

# Instance globale du predicteur
_predictor = None


def get_predictor(neo4j) -> RiskPredictor:
    """Retourne ou cree l'instance du predicteur."""
    global _predictor
    if _predictor is None:
        _predictor = RiskPredictor()
        model_path = os.path.join(os.environ.get("MODELS_DIR", "./models"), "risk_model.pkl")
        if os.path.exists(model_path):
            _predictor.load(model_path)
    return _predictor


@router.get("/model-info")
async def get_model_info():
    """Retourne les informations sur le modele ML."""
    models_dir = os.environ.get("MODELS_DIR", "./models")
    model_path = os.path.join(models_dir, "risk_model.pkl")
    last_trained_path = os.path.join(models_dir, "last_trained.txt")
    
    # Verifier si le modele existe
    model_exists = os.path.exists(model_path)
    
    # Recuperer l'heure de derniere mise a jour
    last_trained = None
    if os.path.exists(last_trained_path):
        with open(last_trained_path, "r") as f:
            last_trained = f.read().strip()
    elif model_exists:
        # Utiliser la date de modification du fichier
        mtime = os.path.getmtime(model_path)
        last_trained = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
    
    return {
        "algorithm": "RandomForest Classifier",
        "features": ["age", "comorbidites", "vaccination", "contacts"],
        "model_exists": model_exists,
        "last_trained": last_trained,
        "model_path": model_path if model_exists else None
    }


@router.get("/risk/{patient_id}")
async def predict_patient_risk(request: Request, patient_id: str):
    """Predit le risque d'infection pour un patient."""
    neo4j = request.app.state.neo4j
    
    # Extraire les features du patient
    extractor = FeatureExtractor(neo4j)
    features = extractor.extract_patient_features(patient_id)
    
    if not features:
        raise HTTPException(status_code=404, detail="Patient non trouve")
    
    predictor = get_predictor(neo4j)
    
    if not predictor.is_trained:
        # Retourner un score base sur des regles simples
        risk = _calculate_rule_based_risk(features)
    else:
        risk = predictor.predict_single(features)
    
    return {
        "patient_id": patient_id,
        "risk_score": risk,
        "risk_level": _get_risk_level(risk),
        "factors": _get_risk_factors(features)
    }


@router.get("/at-risk")
async def get_at_risk_patients(
    request: Request,
    threshold: float = Query(0.5, ge=0.0, le=1.0),
    limit: int = Query(50, ge=1, le=200),
    use_ml: bool = Query(True, description="Utiliser le modele ML si disponible")
):
    """Liste les patients a haut risque en utilisant le modele ML."""
    neo4j = request.app.state.neo4j
    predictor = get_predictor(neo4j)
    
    # Requete pour patients non infectes a risque
    query = """
    MATCH (p:Patient)
    WHERE NOT (p)-[:HAS_DISEASE]->(:Disease)
    AND (p.age > 50 OR p.comorbidities <> 'none')
    OPTIONAL MATCH (p)-[:LIVES_IN]->(l:Location)
    OPTIONAL MATCH (p)-[c:CONTACTED]->(:Patient)
    WITH p, l, count(c) AS contact_count
    RETURN p.patient_id AS patient_id,
           p.age AS age,
           p.sex AS gender,
           p.comorbidities AS comorbidities,
           p.vaccination_status AS vaccination_status,
           l.total_confirmed_cases AS local_cases,
           l.population_density AS location_density,
           contact_count
    ORDER BY p.age DESC
    LIMIT $limit
    """
    
    patients = neo4j.run_query(query, {"limit": limit * 2})
    
    # Calculer le score de risque pour chaque patient
    result = []
    
    # Utiliser le modele ML si disponible et demande
    if use_ml and predictor.is_trained:
        # Prediction par batch avec le modele RandomForest
        features_list = []
        for p in patients:
            features_list.append({
                "age": p.get("age", 40),
                "gender": p.get("gender", "M"),
                "comorbidities": p.get("comorbidities", "none"),
                "vaccination_status": p.get("vaccination_status", "unvaccinated"),
                "location_density": p.get("location_density", 1000),
                "local_cases": p.get("local_cases", 0),
                "contact_count": p.get("contact_count", 0)
            })
        
        # Prediction batch
        try:
            scores = predictor.predict_batch(features_list)
            for p, score in zip(patients, scores):
                if score >= threshold:
                    result.append({
                        **p,
                        "risk_score": score,
                        "risk_level": _get_risk_level(score),
                        "factors": _get_risk_factors(p),
                        "prediction_method": "RandomForest ML"
                    })
        except Exception as e:
            # Fallback sur les regles si erreur ML
            for p in patients:
                risk = _calculate_rule_based_risk(p)
                if risk >= threshold:
                    result.append({
                        **p,
                        "risk_score": risk,
                        "risk_level": _get_risk_level(risk),
                        "factors": _get_risk_factors(p),
                        "prediction_method": "Rule-based (ML error)"
                    })
    else:
        # Utiliser les regles simples
        for p in patients:
            risk = _calculate_rule_based_risk(p)
            if risk >= threshold:
                result.append({
                    **p,
                    "risk_score": risk,
                    "risk_level": _get_risk_level(risk),
                    "factors": _get_risk_factors(p),
                    "prediction_method": "Rule-based"
                })
    
    # Trier par score et limiter
    result = sorted(result, key=lambda x: x["risk_score"], reverse=True)[:limit]
    return result


@router.get("/forecast")
async def get_infection_forecast(
    request: Request,
    days: int = Query(14, ge=7, le=30)
):
    """Prevision du nombre de cas."""
    neo4j = request.app.state.neo4j
    
    # Recuperer l'historique
    query = """
    MATCH ()-[r:INFECTED_BY]->()
    WITH date(r.date) AS d, count(*) AS cases
    RETURN d AS date, cases
    ORDER BY d
    """
    
    history = neo4j.run_query(query)
    
    if len(history) < 7:
        return {"error": "Pas assez de donnees pour la prevision"}
    
    # Prevision simple (moyenne mobile)
    recent = [h["cases"] for h in history[-7:]]
    avg = sum(recent) / len(recent)
    trend = (recent[-1] - recent[0]) / 7
    
    forecast = []
    for i in range(1, days + 1):
        predicted = max(0, avg + trend * i)
        forecast.append({
            "day": i,
            "predicted_cases": int(predicted)
        })
    
    return {
        "historical_avg": avg,
        "trend": trend,
        "forecast": forecast
    }


def _calculate_rule_based_risk(features: dict) -> float:
    """Calcule un score de risque base sur des regles."""
    score = 0.3  # Score de base
    
    # Age
    age = features.get("age", 40)
    if age > 70:
        score += 0.25
    elif age > 60:
        score += 0.15
    elif age > 50:
        score += 0.05
    
    # Comorbidites
    comorbidity = features.get("comorbidities", "none")
    if comorbidity in ["cardiac", "respiratory"]:
        score += 0.2
    elif comorbidity in ["diabetes", "hypertension"]:
        score += 0.15
    elif comorbidity != "none":
        score += 0.1
    
    # Vaccination
    vax = features.get("vaccination_status", "unvaccinated")
    if vax == "unvaccinated":
        score += 0.15
    elif vax == "partially":
        score += 0.05
    
    return min(1.0, score)


def _get_risk_level(score: float) -> str:
    """Convertit le score en niveau de risque."""
    if score >= 0.75:
        return "critical"
    elif score >= 0.5:
        return "high"
    elif score >= 0.3:
        return "moderate"
    else:
        return "low"


def _get_risk_factors(features: dict) -> List[str]:
    """Identifie les facteurs de risque principaux."""
    factors = []
    
    if features.get("age", 0) > 65:
        factors.append("Age eleve (65+)")
    
    if features.get("comorbidities", "none") != "none":
        factors.append(f"Comorbidite: {features['comorbidities']}")
    
    if features.get("vaccination_status") == "unvaccinated":
        factors.append("Non vaccine")
    
    return factors
