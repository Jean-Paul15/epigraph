"""
Generation des maladies (variants COVID-19) et vaccins reels.
"""
import pandas as pd
from typing import List, Dict


def generate_diseases() -> pd.DataFrame:
    """
    Genere les variants COVID-19 avec timeline reelle.
    
    Returns:
        DataFrame des variants
    """
    print("Generation des variants COVID-19...")
    
    diseases: List[Dict] = [
        {
            'disease_id': 'DIS0001',
            'name': 'COVID-19',
            'variant': 'Original (Wuhan)',
            'severity': 'moderate',
            'transmission_rate': 0.25,
            'emergence_date': '2019-12-01'
        },
        {
            'disease_id': 'DIS0002',
            'name': 'COVID-19',
            'variant': 'Alpha (B.1.1.7)',
            'severity': 'moderate',
            'transmission_rate': 0.40,
            'emergence_date': '2020-09-01'
        },
        {
            'disease_id': 'DIS0003',
            'name': 'COVID-19',
            'variant': 'Delta (B.1.617.2)',
            'severity': 'severe',
            'transmission_rate': 0.60,
            'emergence_date': '2020-12-01'
        },
        {
            'disease_id': 'DIS0004',
            'name': 'COVID-19',
            'variant': 'Omicron (BA.1)',
            'severity': 'mild',
            'transmission_rate': 0.85,
            'emergence_date': '2021-11-01'
        },
        {
            'disease_id': 'DIS0005',
            'name': 'COVID-19',
            'variant': 'Omicron (BA.5)',
            'severity': 'mild',
            'transmission_rate': 0.90,
            'emergence_date': '2022-04-01'
        }
    ]
    
    df = pd.DataFrame(diseases)
    print(f"  {len(df)} variants crees")
    return df


def generate_vaccines() -> pd.DataFrame:
    """
    Genere les vaccins COVID-19 reels.
    
    Returns:
        DataFrame des vaccins
    """
    print("Generation des vaccins...")
    
    vaccines: List[Dict] = [
        {
            'vaccine_id': 'VAC0001',
            'name': 'Pfizer-BioNTech (Comirnaty)',
            'efficacy': 0.95,
            'doses_required': 2,
            'approval_date': '2020-12-08'
        },
        {
            'vaccine_id': 'VAC0002',
            'name': 'Moderna (Spikevax)',
            'efficacy': 0.94,
            'doses_required': 2,
            'approval_date': '2020-12-18'
        },
        {
            'vaccine_id': 'VAC0003',
            'name': 'AstraZeneca (Vaxzevria)',
            'efficacy': 0.76,
            'doses_required': 2,
            'approval_date': '2021-01-04'
        },
        {
            'vaccine_id': 'VAC0004',
            'name': 'Johnson & Johnson',
            'efficacy': 0.67,
            'doses_required': 1,
            'approval_date': '2021-02-27'
        }
    ]
    
    df = pd.DataFrame(vaccines)
    print(f"  {len(df)} vaccins crees")
    return df
