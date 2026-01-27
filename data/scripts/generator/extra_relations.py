"""
Generation des relations supplementaires et export CSV.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Set


def generate_has_disease(
    infected_patients: Set[str],
    df_patients: pd.DataFrame,
    df_infections: pd.DataFrame
) -> pd.DataFrame:
    """Genere les diagnostics de maladie."""
    print("Generation des diagnostics...")
    
    records = []
    start = datetime(2020, 3, 1)
    
    for patient_id in infected_patients:
        date_str = start.strftime('%Y-%m-%d')
        
        # Trouver la date d'infection si possible
        if 'patient_from' in df_infections.columns and not df_infections.empty:
            infection = df_infections[
                df_infections['patient_from'] == patient_id
            ]
            if len(infection) > 0:
                date_str = infection.iloc[0]['date']
        
        disease_id = _get_disease_by_date(date_str)
        patient = df_patients[
            df_patients['patient_id'] == patient_id
        ].iloc[0]
        
        records.append({
            'patient_id': patient_id,
            'disease_id': disease_id,
            'diagnosis_date': date_str,
            'severity': _get_severity(patient)
        })
    
    df = pd.DataFrame(records)
    print(f"  {len(df)} diagnostics")
    return df


def _get_disease_by_date(date_str: str) -> str:
    """Retourne le variant selon la date."""
    date = datetime.strptime(date_str, '%Y-%m-%d')
    
    if date < datetime(2020, 9, 1):
        return 'DIS0001'  # Original
    elif date < datetime(2020, 12, 1):
        return 'DIS0002'  # Alpha
    elif date < datetime(2021, 11, 1):
        return 'DIS0003'  # Delta
    else:
        return np.random.choice(['DIS0004', 'DIS0005'])  # Omicron


def _get_severity(patient: pd.Series) -> str:
    """Determine la severite selon le profil patient."""
    high_risk = patient['age'] > 70 or patient['comorbidities'] in [
        'cardiac', 'respiratory'
    ]
    
    if high_risk:
        return np.random.choice(['moderate', 'severe'], p=[0.4, 0.6])
    elif patient['age'] > 50:
        return np.random.choice(
            ['mild', 'moderate', 'severe'], p=[0.3, 0.5, 0.2]
        )
    else:
        return np.random.choice(['mild', 'moderate'], p=[0.7, 0.3])


def generate_vaccinated_with(df_patients: pd.DataFrame) -> pd.DataFrame:
    """Genere les vaccinations."""
    print("Generation des vaccinations...")
    
    records = []
    vax_start = datetime(2020, 12, 15)
    
    vaccinated = df_patients[
        df_patients['vaccination_status'].isin([
            'partially', 'fully', 'boosted'
        ])
    ]
    
    for _, patient in vaccinated.iterrows():
        num_doses = _get_num_doses(patient['vaccination_status'])
        vaccine_id = np.random.choice([
            'VAC0001', 'VAC0002', 'VAC0003', 'VAC0004'
        ])
        
        for dose in range(1, num_doses + 1):
            vax_date = vax_start + timedelta(
                days=np.random.randint(0, 400) + (dose - 1) * 30
            )
            records.append({
                'patient_id': patient['patient_id'],
                'vaccine_id': vaccine_id,
                'date': vax_date.strftime('%Y-%m-%d'),
                'dose_number': dose
            })
    
    df = pd.DataFrame(records)
    print(f"  {len(df)} vaccinations")
    return df


def _get_num_doses(status: str) -> int:
    """Retourne le nombre de doses selon le statut."""
    return {'partially': 1, 'fully': 2, 'boosted': 3}.get(status, 0)
