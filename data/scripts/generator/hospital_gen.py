"""
Generation des hopitaux proportionnellement aux cas par region.
"""
import numpy as np
import pandas as pd
from typing import List, Dict
from .config import HOSPITAL_NAMES


def generate_hospitals(df_locations: pd.DataFrame) -> pd.DataFrame:
    """
    Genere les hopitaux bases sur les locations.
    
    Args:
        df_locations: DataFrame des locations
        
    Returns:
        DataFrame des hopitaux
    """
    print("Generation des hopitaux...")
    
    hospitals: List[Dict] = []
    hospital_counter = 0
    
    for _, loc in df_locations.iterrows():
        num_hospitals = _calculate_hospital_count(loc['total_confirmed_cases'])
        country = loc['country']
        
        for i in range(num_hospitals):
            hospital = _create_hospital(
                hospital_counter, country, loc, i, num_hospitals
            )
            hospitals.append(hospital)
            hospital_counter += 1
    
    df_hospitals = pd.DataFrame(hospitals)
    print(f"  {len(df_hospitals)} hopitaux crees")
    
    return df_hospitals


def _calculate_hospital_count(total_cases: int) -> int:
    """Calcule le nombre d'hopitaux selon les cas."""
    return max(1, min(5, total_cases // 2000))


def _create_hospital(
    counter: int, 
    country: str, 
    loc: pd.Series, 
    index: int,
    total: int
) -> Dict:
    """Cree un dictionnaire hopital."""
    hospital_pool = HOSPITAL_NAMES.get(country, ['General Hospital'])
    hospital_name = hospital_pool[index % len(hospital_pool)]
    
    if total > 1:
        hospital_name = f"{hospital_name} - Site {index + 1}"
    
    # Capacite proportionnelle aux cas
    base_capacity = 100 + (loc['total_confirmed_cases'] // 100)
    capacity = min(1000, base_capacity + np.random.randint(-50, 100))
    available_beds = max(10, int(capacity * np.random.uniform(0.1, 0.4)))
    
    equipment = np.random.choice(
        ['basic', 'intermediate', 'advanced'], 
        p=[0.2, 0.5, 0.3]
    )
    
    return {
        'hospital_id': f'HOSP{counter:04d}',
        'name': hospital_name,
        'capacity': capacity,
        'available_beds': available_beds,
        'equipment_level': equipment,
        'location_id': loc['location_id'],
        'country': country
    }
