"""
Script d'entrainement automatique du modele ML.
Execute au demarrage pour garantir qu'un modele est disponible.
"""
import os
import time
from app.services.neo4j_service import Neo4jService
from app.ml.feature_extractor import FeatureExtractor
from app.ml.risk_predictor import RiskPredictor

def wait_for_neo4j(retries=30, delay=2):
    """Attend que Neo4j soit pret."""
    print("Attente de Neo4j pour entrainement modele...")
    service = Neo4jService()
    
    for i in range(retries):
        if service.check_connection():
            print("Connexion Neo4j etablie.")
            return service
        time.sleep(delay)
    
    raise Exception("Impossible de se connecter a Neo4j")

def train_and_save():
    """Entraine et sauvegarde le modele."""
    try:
        neo4j = wait_for_neo4j()
        
        print("Extraction des donnees d'entrainement...")
        extractor = FeatureExtractor(neo4j)
        # On recupere un echantillon suffisant pour entrainer
        data = extractor.extract_all_features(limit=5000)
        
        if len(data) < 100:
            print("Pas assez de donnees pour entrainer (min 100).")
            return
            
        print(f"Entrainement sur {len(data)} patients...")
        predictor = RiskPredictor()
        metrics = predictor.train(data)
        
        print(f"Modele entraine. Precision: {metrics['accuracy']:.2f}")
        
        # Sauvegarde dans le volume partage
        model_path = os.path.join(os.environ.get("MODELS_DIR", "/app/models"), "risk_model.pkl")
        predictor.save(model_path)
        print(f"Modele sauvegarde: {model_path}")
        
    except Exception as e:
        print(f"Erreur lors de l'entrainement: {e}")
    finally:
        if 'neo4j' in locals():
            neo4j.close()

if __name__ == "__main__":
    train_and_save()
