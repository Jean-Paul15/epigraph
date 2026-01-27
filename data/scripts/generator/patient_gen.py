"""
Generation des patients avec distribution demographique realiste.
"""
import numpy as np
import pandas as pd
from typing import List, Dict
from .config import AGE_DISTRIBUTION, GeneratorConfig


def generate_patients(
    df_locations: pd.DataFrame,
    config: GeneratorConfig
) -> pd.DataFrame:
    """
    Genere les patients bases sur les cas reels par region.
    
    Args:
        df_locations: DataFrame des locations
        config: Configuration du generateur
        
    Returns:
        DataFrame des patients
    """
    print("Generation des patients...")
    
    patients: List[Dict] = []
    patient_counter = 0
    
    for _, loc in df_locations.iterrows():
        num_patients = _calculate_patient_count(
            loc['total_confirmed_cases'],
            config.patients_per_1000_cases
        )
        
        for _ in range(num_patients):
            patient = _create_patient(patient_counter, loc['location_id'])
            patients.append(patient)
            patient_counter += 1
    
    df_patients = pd.DataFrame(patients)
    print(f"  {len(df_patients)} patients generes")
    
    return df_patients


def _calculate_patient_count(total_cases: int, scale: int) -> int:
    """Calcule le nombre de patients a generer."""
    return max(50, min(5000, int(total_cases * scale / 1000)))


def _create_patient(counter: int, location_id: str) -> Dict:
    """Cree un dictionnaire patient avec attributs realistes."""
    age = _generate_age()
    
    return {
        'patient_id': f'P{counter:06d}',
        'age': age,
        'gender': np.random.choice(['M', 'F']),
        'comorbidities': _get_comorbidity(age),
        'vaccination_status': _get_vaccination_status(age),
        'location_id': location_id
    }


def _generate_age() -> int:
    """Genere un age selon la distribution demographique."""
    categories = list(AGE_DISTRIBUTION.keys())
    probabilities = list(AGE_DISTRIBUTION.values())
    category = np.random.choice(categories, p=probabilities)
    
    age_ranges = {
        '0-17': (0, 18),
        '18-39': (18, 40),
        '40-59': (40, 60),
        '60-74': (60, 75),
        '75+': (75, 95)
    }
    min_age, max_age = age_ranges[category]
    return np.random.randint(min_age, max_age)


def _get_comorbidity(age: int) -> str:
    """Attribue une comorbidite selon l'age."""
    if age < 40:
        return np.random.choice(
            ['none', 'asthma', 'obesity'], 
            p=[0.8, 0.1, 0.1]
        )
    elif age < 60:
        return np.random.choice(
            ['none', 'diabetes', 'hypertension', 'obesity'],
            p=[0.5, 0.2, 0.2, 0.1]
        )
    else:
        return np.random.choice(
            ['none', 'diabetes', 'hypertension', 'cardiac', 'respiratory'],
            p=[0.3, 0.25, 0.25, 0.1, 0.1]
        )


def _get_vaccination_status(age: int) -> str:
    """
    Determine le statut vaccinal selon l'age.
    Modelise le debut de la pandemie (mars 2020) donc majorite non-vaccines.
    """
    # Au debut de la pandemie: pas de vaccins disponibles
    # Seulement 20% vaccines (simulation tardive pour certains)
    if age >= 65:
        probs = [0.70, 0.10, 0.12, 0.08]
    elif age >= 40:
        probs = [0.75, 0.10, 0.10, 0.05]
    else:
        probs = [0.85, 0.08, 0.05, 0.02]
    
    return np.random.choice(
        ['unvaccinated', 'partially', 'fully', 'boosted'],
        p=probs
    )
