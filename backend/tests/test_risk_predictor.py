"""Tests unitaires du predicteur de risque (sans connexion Neo4j)."""
import importlib.util
import pathlib
import random

import pytest

# Chargement direct du module : evite d'importer app.ml (et donc le driver Neo4j).
_PATH = pathlib.Path(__file__).resolve().parents[1] / "app" / "ml" / "risk_predictor.py"
_spec = importlib.util.spec_from_file_location("risk_predictor", _PATH)
_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)
RiskPredictor = _module.RiskPredictor


def _dataset(n=200):
    rng = random.Random(0)
    rows = []
    for _ in range(n):
        contacts = rng.randint(0, 10)
        rows.append({
            "age": rng.randint(1, 90),
            "gender": rng.choice(["M", "F"]),
            "comorbidities": rng.choice(["none", "diabetes"]),
            "vaccination_status": rng.choice(["unvaccinated", "full"]),
            "location_density": rng.random() * 1000,
            "local_cases": rng.randint(0, 5000),
            "contact_count": contacts,
            "label": 1 if contacts > 5 else 0,
        })
    return rows


def test_train_requires_minimum_samples():
    with pytest.raises(ValueError):
        RiskPredictor().train(_dataset(10))


def test_train_and_predict_in_unit_interval():
    predictor = RiskPredictor()
    metrics = predictor.train(_dataset())
    assert predictor.is_trained
    assert 0.0 <= metrics["accuracy"] <= 1.0
    score = predictor.predict_single(_dataset(1)[0])
    assert 0.0 <= score <= 1.0


def test_unknown_category_does_not_fail():
    predictor = RiskPredictor()
    predictor.train(_dataset())
    sample = _dataset(1)[0]
    sample["gender"] = "valeur-inconnue"
    assert 0.0 <= predictor.predict_single(sample) <= 1.0


def test_save_and_load_roundtrip(tmp_path):
    predictor = RiskPredictor()
    predictor.train(_dataset())
    path = str(tmp_path / "model.pkl")
    predictor.save(path)
    other = RiskPredictor()
    other.load(path)
    sample = _dataset(1)[0]
    assert other.predict_single(sample) == predictor.predict_single(sample)
