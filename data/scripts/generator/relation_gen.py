"""
Generation des relations complementaires (hospitalisations, vaccinations, etc).
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Set
from .config import EVENT_TYPES, GeneratorConfig


def generate_events(
    df_locations: pd.DataFrame,
    config: GeneratorConfig
) -> pd.DataFrame:
    """Genere les evenements super-propagateurs."""
    print("Generation des evenements...")
    
    events: List[Dict] = []
    start_date = datetime(2020, 3, 1)
    
    for i in range(100):
        event_date = start_date + timedelta(
            days=np.random.randint(0, config.simulation_days)
        )
        # EVENT_TYPES est une liste de dictionnaires
        event_config = np.random.choice(EVENT_TYPES)
        event_type = event_config['type']
        min_size, max_size = event_config['size']
        
        events.append({
            'event_id': f'EVT{i:05d}',
            'type': event_type,
            'date': event_date.strftime('%Y-%m-%d'),
            'attendees_count': np.random.randint(min_size, max_size),
            'location_id': np.random.choice(
                df_locations['location_id'].values
            )
        })
    
    df = pd.DataFrame(events)
    print(f"  {len(df)} evenements crees")
    return df


def _get_attendees_count(event_type: str) -> int:
    """Retourne le nombre de participants selon le type."""
    counts = {
        'religious_gathering': (50, 500),
        'concert': (100, 2000),
        'conference': (50, 300),
        'wedding': (30, 200),
        'sports_event': (500, 5000),
        'protest': (100, 1000),
        'nightclub': (50, 400)
    }
    min_c, max_c = counts.get(event_type, (50, 200))
    return np.random.randint(min_c, max_c)


def generate_treated_at(
    infected_patients: Set[str],
    df_patients: pd.DataFrame,
    df_hospitals: pd.DataFrame,
    df_infections: pd.DataFrame
) -> pd.DataFrame:
    """Genere les hospitalisations (20% des infectes)."""
    print("Generation des hospitalisations...")
    
    treated: List[Dict] = []
    infected_list = list(infected_patients)
    num_hospitalized = int(len(infected_list) * 0.20)
    
    hospitalized = np.random.choice(
        infected_list, size=num_hospitalized, replace=False
    )
    
    for patient_id in hospitalized:
        patient = df_patients[
            df_patients['patient_id'] == patient_id
        ].iloc[0]
        
        hospitals_nearby = df_hospitals[
            df_hospitals['location_id'] == patient['location_id']
        ]
        
        if len(hospitals_nearby) > 0:
            hospital_id = hospitals_nearby.sample(1).iloc[0]['hospital_id']
            admission, discharge = _get_hospital_dates(
                patient_id, df_infections
            )
            
            treated.append({
                'patient_id': patient_id,
                'hospital_id': hospital_id,
                'admission_date': admission,
                'discharge_date': discharge
            })
    
    df = pd.DataFrame(treated)
    print(f"  {len(df)} hospitalisations")
    return df


def _get_hospital_dates(
    patient_id: str, 
    df_infections: pd.DataFrame
) -> tuple:
    """Calcule les dates d'hospitalisation."""
    start = datetime(2020, 3, 1)
    
    record = df_infections[
        df_infections['patient_from'] == patient_id
    ]
    
    if len(record) > 0:
        infection_date = datetime.strptime(
            record.iloc[0]['date'], '%Y-%m-%d'
        )
    else:
        infection_date = start
    
    admission = infection_date + timedelta(days=np.random.randint(3, 10))
    discharge = admission + timedelta(days=np.random.randint(5, 21))
    
    return admission.strftime('%Y-%m-%d'), discharge.strftime('%Y-%m-%d')
