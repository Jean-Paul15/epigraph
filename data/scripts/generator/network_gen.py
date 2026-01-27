"""
Simulation du reseau de contacts avec modele SEIR epidemiologique.
Version optimisee pour 30% de taux d'attaque.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Set, Tuple
from .config import GeneratorConfig


def simulate_infection_network(
    df_patients: pd.DataFrame,
    df_locations: pd.DataFrame,
    config: GeneratorConfig
) -> Tuple[pd.DataFrame, Set[str]]:
    """
    Simule la propagation epidemique avec le modele SEIR (version optimisee).
    
    Returns:
        Tuple (DataFrame infections, Set patients infectes)
    """
    print("Simulation du reseau de contacts (Modele SEIR)...")
    
    # Pre-indexer les patients par location (optimisation)
    patients_by_loc: Dict[str, List[str]] = {}
    patient_loc_map: Dict[str, str] = {}
    patient_data_cache: Dict[str, Dict] = {}
    
    for _, row in df_patients.iterrows():
        pid = row['patient_id']
        loc = row['location_id']
        patient_loc_map[pid] = loc
        patient_data_cache[pid] = {
            'age': row['age'],
            'vaccination_status': row['vaccination_status']
        }
        if loc not in patients_by_loc:
            patients_by_loc[loc] = []
        patients_by_loc[loc].append(pid)
    
    # Initialisation des ensembles
    all_patients = set(df_patients['patient_id'].values)
    infected_patients: Set[str] = set()
    susceptible_by_loc: Dict[str, Set[str]] = {
        loc: set(pids) for loc, pids in patients_by_loc.items()
    }
    infections: List[Dict] = []
    
    # Patients zero (10 foyers pour demarrage equilibre)
    initial_infected = _select_multiple_patient_zero(
        df_patients, df_locations, num_foyers=10
    )
    for pid in initial_infected:
        infected_patients.add(pid)
        loc = patient_loc_map[pid]
        susceptible_by_loc[loc].discard(pid)
    
    # Simulation
    start_date = datetime(2020, 3, 1)
    newly_infected = list(initial_infected)
    
    for day in range(config.simulation_days):
        current_date = start_date + timedelta(days=day)
        next_wave = []
        
        for infector in newly_infected:
            infector_loc = patient_loc_map[infector]
            susceptible_local = susceptible_by_loc.get(infector_loc, set())
            
            if not susceptible_local:
                continue
            
            num_contacts = max(0, int(np.random.poisson(config.r0_base)))
            if num_contacts == 0:
                continue
            
            # Selection des contacts
            susc_list = list(susceptible_local)
            num_actual = min(num_contacts, len(susc_list))
            contacts = np.random.choice(susc_list, size=num_actual, replace=False)
            
            for contact_id in contacts:
                if _infection_occurs_fast(patient_data_cache[contact_id]):
                    duration = int(np.clip(
                        np.random.lognormal(3.5, 1.0), 5, 240
                    ))
                    infections.append({
                        'patient_from': contact_id,
                        'patient_to': infector,
                        'date': current_date.strftime('%Y-%m-%d'),
                        'proximity_duration': duration
                    })
                    next_wave.append(contact_id)
                    infected_patients.add(contact_id)
                    susceptible_by_loc[infector_loc].discard(contact_id)
        
        newly_infected = next_wave
        
        if day % 30 == 0:
            print(f"  Jour {day}: {len(infected_patients)} infectes")
        
        if not newly_infected:
            print(f"  Epidemie terminee jour {day}")
            break
    
    if not infections:
        df_infections = pd.DataFrame(
            columns=['patient_from', 'patient_to', 'date', 'proximity_duration']
        )
    else:
        df_infections = pd.DataFrame(infections)

    rate = len(infected_patients) / len(df_patients) * 100
    print(f"  {len(df_infections)} infections, taux: {rate:.2f}%")
    
    return df_infections, infected_patients


def _select_multiple_patient_zero(
    df_patients: pd.DataFrame,
    df_locations: pd.DataFrame,
    num_foyers: int = 10
) -> List[str]:
    """
    Selectionne plusieurs patients zero dans differentes locations.
    Permet de demarrer l'epidemie dans plusieurs foyers simultanement.
    """
    # Trier les locations par nombre de cas (les plus touchees d'abord)
    sorted_locs = df_locations.nlargest(num_foyers, 'total_confirmed_cases')
    
    patient_zeros = []
    for _, loc in sorted_locs.iterrows():
        patients_in_loc = df_patients[
            df_patients['location_id'] == loc['location_id']
        ]
        if len(patients_in_loc) > 0:
            patient_zeros.append(patients_in_loc.iloc[0]['patient_id'])
    
    return patient_zeros


def _select_patient_zero(
    df_patients: pd.DataFrame, 
    df_locations: pd.DataFrame
) -> str:
    """Selectionne le patient zero dans la zone la plus touchee."""
    hotspot = df_locations.loc[
        df_locations['total_confirmed_cases'].idxmax()
    ]
    patients_hotspot = df_patients[
        df_patients['location_id'] == hotspot['location_id']
    ]
    return patients_hotspot.iloc[0]['patient_id']


def _process_infector(
    infector: str,
    df_patients: pd.DataFrame,
    susceptible: Set[str],
    date: datetime,
    r0: float,
    infections: List[Dict]
) -> List[str]:
    """Traite les infections causees par un patient."""
    new_infected = []
    num_contacts = max(0, int(np.random.poisson(r0)))
    
    if num_contacts == 0 or not susceptible:
        return new_infected
    
    infector_data = df_patients[
        df_patients['patient_id'] == infector
    ].iloc[0]
    infector_loc = infector_data['location_id']
    
    # Contacts uniquement dans la meme zone (optimise)
    same_loc = df_patients[
        (df_patients['location_id'] == infector_loc) &
        (df_patients['patient_id'].isin(susceptible))
    ]['patient_id'].values
    
    if len(same_loc) == 0:
        return new_infected
    
    contacts = np.random.choice(
        same_loc,
        size=min(num_contacts, len(same_loc)),
        replace=False
    )
    
    if len(contacts) == 0:
        return new_infected
    
    for contact_id in contacts:
        contact = df_patients[
            df_patients['patient_id'] == contact_id
        ].iloc[0]
        
        if _infection_occurs(contact):
            duration = int(np.clip(
                np.random.lognormal(3.5, 1.0), 5, 240
            ))
            infections.append({
                'patient_from': contact_id,
                'patient_to': infector,
                'date': date.strftime('%Y-%m-%d'),
                'proximity_duration': duration
            })
            new_infected.append(contact_id)
    
    return new_infected


def _infection_occurs_fast(contact_data: Dict) -> bool:
    """
    Determine si l'infection se produit (version optimisee).
    Utilise un dictionnaire au lieu d'une Series pandas.
    """
    # Probabilite ajustee pour ~35-40% sur 60 jours
    prob = 0.39
    
    # Facteur age
    age = contact_data['age']
    if age > 65:
        prob *= 1.3
    elif age > 40:
        prob *= 1.1
    
    # Facteur vaccination
    vax_status = contact_data['vaccination_status']
    if vax_status in ['fully', 'boosted']:
        prob *= 0.5
    elif vax_status == 'partially':
        prob *= 0.7
    
    return np.random.random() < min(0.95, prob)


def _infection_occurs(contact: pd.Series) -> bool:
    """Determine si l'infection se produit."""
    # Probabilite calibree pour ~30% taux d'attaque
    prob = 0.55
    
    # Facteur age
    if contact['age'] > 65:
        prob *= 1.3
    elif contact['age'] > 40:
        prob *= 1.1
    
    # Facteur vaccination (moins protecteur au debut de pandemie)
    if contact['vaccination_status'] in ['fully', 'boosted']:
        prob *= 0.5
    elif contact['vaccination_status'] == 'partially':
        prob *= 0.7
    
    return np.random.random() < min(0.95, prob)
