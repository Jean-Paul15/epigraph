"""
Point d'entree principal du generateur de donnees EpiGraph.
Orchestre la generation complete du dataset epidemiologique.
"""
import numpy as np
import random
from generator import (
    GeneratorConfig,
    fetch_covid_data,
    filter_by_countries,
    get_date_columns,
    generate_locations,
    generate_hospitals,
    generate_patients,
    generate_diseases,
    generate_vaccines,
    simulate_infection_network,
    generate_events,
    generate_treated_at,
    generate_has_disease,
    generate_vaccinated_with,
    export_all_csv,
    generate_connected_to,
    generate_transfers_to,
    generate_mutates_to,
    generate_attended
)


def main():
    """Execute la generation complete du dataset."""
    print("=" * 70)
    print("GENERATEUR EPIGRAPH - Dataset Epidemiologique Hybride")
    print("=" * 70)
    
    # Configuration
    config = GeneratorConfig()
    np.random.seed(config.seed)
    random.seed(config.seed)
    
    # Phase 1: Telechargement donnees JHU
    df_confirmed, df_deaths = fetch_covid_data()
    df_confirmed, df_deaths = filter_by_countries(
        df_confirmed, df_deaths, config.selected_countries
    )
    date_columns = get_date_columns(df_confirmed)
    
    # Phase 2: Generation des noeuds
    df_locations = generate_locations(df_confirmed, date_columns)
    df_hospitals = generate_hospitals(df_locations)
    df_patients = generate_patients(df_locations, config)
    df_diseases = generate_diseases()
    df_vaccines = generate_vaccines()
    df_events = generate_events(df_locations, config)
    
    # Phase 3: Simulation reseau SEIR
    df_infections, infected_patients = simulate_infection_network(
        df_patients, df_locations, config
    )
    
    # Phase 4: Relations complementaires
    df_treated = generate_treated_at(
        infected_patients, df_patients, df_hospitals, df_infections
    )
    df_has_disease = generate_has_disease(
        infected_patients, df_patients, df_infections
    )
    df_vaccinated = generate_vaccinated_with(df_patients)
    df_attended = generate_attended(df_patients, df_events)
    df_connected = generate_connected_to(df_locations)
    df_transfers = generate_transfers_to(df_hospitals)
    df_mutates = generate_mutates_to(df_diseases)
    
    # Phase 5: Export CSV
    dataframes = {
        'locations': df_locations,
        'hospitals': df_hospitals,
        'patients': df_patients,
        'diseases': df_diseases,
        'vaccines': df_vaccines,
        'events': df_events,
        'infected_by': df_infections,
        'treated_at': df_treated,
        'has_disease': df_has_disease,
        'vaccinated_with': df_vaccinated,
        'attended': df_attended,
        'connected_to': df_connected,
        'transfers_to': df_transfers,
        'mutates_to': df_mutates
    }
    
    export_all_csv(dataframes, config.output_dir)
    
    # Resume
    print("\n" + "=" * 70)
    print("GENERATION TERMINEE")
    print("=" * 70)
    _print_summary(dataframes, infected_patients, df_patients)


def _print_summary(dataframes: dict, infected: set, patients) -> None:
    """Affiche le resume de la generation."""
    print("\nNoeuds generes:")
    for name in ['locations', 'hospitals', 'patients', 'diseases', 'vaccines', 'events']:
        print(f"  - {name}: {len(dataframes[name]):,}")
    
    print("\nRelations generees:")
    for name in ['infected_by', 'treated_at', 'has_disease', 'vaccinated_with', 
                 'attended', 'connected_to', 'transfers_to', 'mutates_to']:
        print(f"  - {name}: {len(dataframes[name]):,}")
    
    rate = len(infected) / len(patients) * 100
    print(f"\nTaux d'attaque: {rate:.2f}%")


if __name__ == "__main__":
    main()
