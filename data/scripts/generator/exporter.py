"""
Export des DataFrames en fichiers CSV pour Neo4j.
"""
import os
import pandas as pd
from typing import Dict


def export_all_csv(
    dataframes: Dict[str, pd.DataFrame],
    output_dir: str
) -> None:
    """
    Exporte tous les DataFrames en CSV.
    
    Args:
        dataframes: Dictionnaire {nom_fichier: DataFrame}
        output_dir: Dossier de destination
    """
    print(f"\nExport des CSV vers {output_dir}...")
    
    os.makedirs(output_dir, exist_ok=True)
    
    for name, df in dataframes.items():
        filepath = os.path.join(output_dir, f"{name}.csv")
        df.to_csv(filepath, index=False)
        print(f"  {name}.csv ({len(df)} lignes)")
    
    print(f"\n{len(dataframes)} fichiers CSV exportes")


def generate_connected_to(df_locations: pd.DataFrame) -> pd.DataFrame:
    """Genere les connexions entre locations."""
    print("Generation des connexions geographiques...")
    
    connections = []
    
    for i, loc1 in df_locations.iterrows():
        for j, loc2 in df_locations.iterrows():
            if i >= j:
                continue
            
            distance = _calculate_distance(
                loc1['latitude'], loc1['longitude'],
                loc2['latitude'], loc2['longitude']
            )
            
            if distance < 500:
                connections.append({
                    'location_from': loc1['location_id'],
                    'location_to': loc2['location_id'],
                    'travel_volume': max(100, int(10000 / (1 + distance/50))),
                    'distance': distance
                })
    
    df = pd.DataFrame(connections)
    print(f"  {len(df)} connexions")
    return df


def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """Calcule la distance approximative en km."""
    return int(((lat2 - lat1)**2 + (lon2 - lon1)**2)**0.5 * 111)


def generate_transfers_to(df_hospitals: pd.DataFrame) -> pd.DataFrame:
    """Genere les transferts entre hopitaux."""
    import numpy as np
    print("Generation des transferts inter-hopitaux...")
    
    transfers = []
    
    for country in df_hospitals['country'].unique():
        country_hospitals = df_hospitals[
            df_hospitals['country'] == country
        ]['hospital_id'].values
        
        for hosp1 in country_hospitals:
            others = [h for h in country_hospitals if h != hosp1]
            num_transfers = min(3, len(others))
            
            if num_transfers > 0:
                targets = np.random.choice(
                    others, size=num_transfers, replace=False
                )
                for hosp2 in targets:
                    transfers.append({
                        'hospital_from': hosp1,
                        'hospital_to': hosp2,
                        'patient_count': np.random.randint(1, 30)
                    })
    
    df = pd.DataFrame(transfers)
    print(f"  {len(df)} transferts")
    return df


def generate_mutates_to(df_diseases: pd.DataFrame) -> pd.DataFrame:
    """Genere la chaine de mutations des variants."""
    print("Generation des mutations...")
    
    mutations = []
    
    for i in range(len(df_diseases) - 1):
        d1 = df_diseases.iloc[i]
        d2 = df_diseases.iloc[i + 1]
        
        mutations.append({
            'disease_from': d1['disease_id'],
            'disease_to': d2['disease_id'],
            'mutation_date': d2['emergence_date']
        })
    
    df = pd.DataFrame(mutations)
    print(f"  {len(df)} mutations")
    return df


def generate_attended(
    df_patients: pd.DataFrame,
    df_events: pd.DataFrame
) -> pd.DataFrame:
    """Genere les participations aux evenements."""
    import numpy as np
    print("Generation des participations...")
    
    records = []
    
    for _, event in df_events.iterrows():
        eligible = df_patients[
            df_patients['location_id'] == event['location_id']
        ]['patient_id'].values
        
        if len(eligible) == 0:
            continue
        
        num = min(
            event['attendees_count'],
            int(len(eligible) * np.random.uniform(0.1, 0.3))
        )
        
        if num > 0:
            attendees = np.random.choice(
                eligible, size=min(num, len(eligible)), replace=False
            )
            for patient_id in attendees:
                records.append({
                    'patient_id': patient_id,
                    'event_id': event['event_id']
                })
    
    df = pd.DataFrame(records)
    print(f"  {len(df)} participations")
    return df
