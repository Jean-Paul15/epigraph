"""
Generation des locations geographiques a partir des donnees JHU.
"""
import pandas as pd
from typing import List, Dict


def generate_locations(
    df_confirmed: pd.DataFrame,
    date_columns: List[str]
) -> pd.DataFrame:
    """
    Genere les locations a partir des donnees COVID-19.
    
    Args:
        df_confirmed: DataFrame des cas confirmes JHU
        date_columns: Liste des colonnes de dates
        
    Returns:
        DataFrame des locations avec coordonnees
    """
    print("Generation des locations geographiques...")
    
    locations: List[Dict] = []
    
    for idx, row in df_confirmed.iterrows():
        location = _create_location_from_row(row, idx, date_columns)
        locations.append(location)
    
    df_locations = pd.DataFrame(locations)
    print(f"  {len(df_locations)} locations creees")
    
    return df_locations


def _create_location_from_row(
    row: pd.Series, 
    index: int,
    date_columns: List[str]
) -> Dict:
    """Cree un dictionnaire location depuis une ligne JHU."""
    country = row['Country/Region']
    province = row['Province/State']
    
    # Utiliser le pays si la province est vide
    if pd.isna(province) or province == '':
        province = country
    
    # Obtenir le total de cas (derniere colonne)
    last_date = date_columns[-1]
    total_cases = int(row[last_date]) if pd.notna(row[last_date]) else 0
    
    # Densite estimee (simplifiee)
    population_density = min(10000, max(100, total_cases // 10))
    
    return {
        'location_id': f'LOC{index:04d}',
        'country': country,
        'region': province,
        'city': province,
        'latitude': round(row['Lat'], 4),
        'longitude': round(row['Long'], 4),
        'population_density': population_density,
        'total_confirmed_cases': total_cases
    }
