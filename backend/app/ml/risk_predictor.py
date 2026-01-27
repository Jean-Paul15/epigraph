"""
Modele de prediction de risque d'infection.
"""
import os
import joblib
import numpy as np
from typing import Dict, List, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder


class RiskPredictor:
    """Predicteur de risque d'infection base sur RandomForest."""
    
    def __init__(self):
        self._model: Optional[RandomForestClassifier] = None
        self._encoders: Dict[str, LabelEncoder] = {}
        self._feature_names: List[str] = [
            'age', 'gender', 'comorbidities', 
            'vaccination_status', 'location_density',
            'local_cases', 'contact_count'
        ]
    
    @property
    def is_trained(self) -> bool:
        return self._model is not None
    
    def train(self, data: List[Dict]) -> Dict[str, float]:
        """Entraine le modele sur les donnees."""
        if len(data) < 100:
            raise ValueError("Pas assez de donnees pour entrainer")
        
        # Preparation des donnees
        X, y = self._prepare_data(data)
        
        # Entrainement
        self._model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self._model.fit(X, y)
        
        # Metriques
        accuracy = self._model.score(X, y)
        importances = dict(zip(
            self._feature_names,
            self._model.feature_importances_
        ))
        
        return {
            "accuracy": accuracy,
            "feature_importances": importances
        }
    
    def predict_single(self, features: Dict) -> float:
        """Predit le risque pour un patient."""
        if not self.is_trained:
            raise ValueError("Modele non entraine")
        
        X = self._encode_features([features])
        proba = self._model.predict_proba(X)[0]
        
        # Retourne la probabilite de la classe positive
        return float(proba[1]) if len(proba) > 1 else float(proba[0])
    
    def predict_batch(self, features_list: List[Dict]) -> List[float]:
        """Predit le risque pour plusieurs patients."""
        if not self.is_trained:
            raise ValueError("Modele non entraine")
        
        X = self._encode_features(features_list)
        probas = self._model.predict_proba(X)
        
        return [float(p[1]) if len(p) > 1 else float(p[0]) for p in probas]
    
    def save(self, path: str) -> None:
        """Sauvegarde le modele."""
        joblib.dump({
            'model': self._model,
            'encoders': self._encoders
        }, path)
    
    def load(self, path: str) -> None:
        """Charge le modele."""
        if os.path.exists(path):
            data = joblib.load(path)
            self._model = data['model']
            self._encoders = data['encoders']
    
    def _prepare_data(self, data: List[Dict]) -> tuple:
        """Prepare les donnees pour l'entrainement."""
        # Initialiser les encodeurs
        self._init_encoders(data)
        
        X = self._encode_features(data)
        y = np.array([d.get('label', 0) for d in data])
        
        return X, y
    
    def _init_encoders(self, data: List[Dict]) -> None:
        """Initialise les encodeurs pour les variables categoriques."""
        categorical = ['gender', 'comorbidities', 'vaccination_status']
        
        for col in categorical:
            values = [str(d.get(col, 'unknown')) for d in data]
            self._encoders[col] = LabelEncoder()
            self._encoders[col].fit(values + ['unknown'])
    
    def _encode_features(self, data: List[Dict]) -> np.ndarray:
        """Encode les features en matrice numerique."""
        n = len(data)
        X = np.zeros((n, len(self._feature_names)))
        
        for i, d in enumerate(data):
            X[i, 0] = d.get('age', 40)
            X[i, 1] = self._safe_encode('gender', d.get('gender', 'M'))
            X[i, 2] = self._safe_encode('comorbidities', d.get('comorbidities', 'none'))
            X[i, 3] = self._safe_encode('vaccination_status', d.get('vaccination_status', 'unvaccinated'))
            X[i, 4] = d.get('location_density', 0)
            X[i, 5] = d.get('local_cases', 0)
            X[i, 6] = d.get('contact_count', 0)
        
        return X
    
    def _safe_encode(self, col: str, value: str) -> int:
        """Encode une valeur de maniere securisee."""
        if col not in self._encoders:
            return 0
        
        encoder = self._encoders[col]
        try:
            return encoder.transform([str(value)])[0]
        except ValueError:
            return encoder.transform(['unknown'])[0]
