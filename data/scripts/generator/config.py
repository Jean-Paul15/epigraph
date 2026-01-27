"""
Configuration complete du generateur.
Contient tous les parametres et listes de reference.
Aligne avec hybrid_epidemic_generator.py
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List

# ================================
# CONSTANTES GLOBALES (URLs)
# ================================
JHU_BASE = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/"
CONFIRMED_URL = JHU_BASE + "time_series_covid19_confirmed_global.csv"
DEATHS_URL = JHU_BASE + "time_series_covid19_deaths_global.csv"
RECOVERED_URL = JHU_BASE + "time_series_covid19_recovered_global.csv"

# ================================
# PAYS SELECTIONNES POUR LE DATASET
# ================================
SELECTED_COUNTRIES = ['France', 'Spain', 'Italy', 'Germany', 'United Kingdom']

# ================================
# HOPITAUX PAR PAYS (Dictionnaire)
# ================================
HOSPITAL_NAMES: Dict[str, List[str]] = {
    'France': [
        'CHU de Paris', 
        'Hopital de la Pitie-Salpetriere', 
        'CHU de Lyon', 
        'Hopital Cochin', 
        'CHU de Marseille'
    ],
    'Spain': [
        'Hospital Clinic', 
        'Hospital La Paz', 
        'Hospital Universitario', 
        'Hospital del Mar', 
        'Hospital Ramon y Cajal'
    ],
    'Italy': [
        'Ospedale San Raffaele', 
        'Policlinico Gemelli', 
        'Ospedale Niguarda', 
        'Ospedale San Paolo', 
        'Ospedale Maggiore'
    ],
    'Germany': [
        'Charite', 
        'Universitatsklinikum', 
        'Klinikum Munchen', 
        'Uniklinik Koln', 
        'Asklepios Klinik'
    ],
    'United Kingdom': [
        'Royal London Hospital', 
        'St Thomas Hospital', 
        'Kings College Hospital', 
        'Manchester Royal Infirmary', 
        'Birmingham Heartlands'
    ]
}

# ================================
# DISTRIBUTION D'AGE (INSEE France)
# ================================
AGE_DISTRIBUTION: Dict[str, float] = {
    '0-17': 0.22,
    '18-39': 0.28,
    '40-59': 0.26,
    '60-74': 0.15,
    '75+': 0.09
}

# ================================
# TYPES D'EQUIPEMENT HOSPITALIER
# ================================
HOSPITAL_TYPES: Dict[str, Dict] = {
    'advanced': {'beds': (500, 1200), 'icu_ratio': 0.15},
    'intermediate': {'beds': (200, 500), 'icu_ratio': 0.08},
    'basic': {'beds': (50, 200), 'icu_ratio': 0.05}
}

# ================================
# COMORBIDITES
# ================================
COMORBIDITIES: List[str] = [
    'none', 'asthma', 'diabetes', 'hypertension', 
    'obesity', 'cardiac', 'respiratory'
]

# ================================
# TYPES D'EVENEMENTS
# ================================
EVENT_TYPES: List[Dict] = [
    {'type': 'Concert', 'size': (500, 5000), 'risk': 0.8},
    {'type': 'Match Sportif', 'size': (1000, 10000), 'risk': 0.7},
    {'type': 'Conference', 'size': (100, 1000), 'risk': 0.4},
    {'type': 'Mariage', 'size': (50, 300), 'risk': 0.6},
    {'type': 'Marche', 'size': (200, 800), 'risk': 0.3}
]

# ================================
# PARAMETRES SEIR
# ================================
LATENT_PERIOD: int = 5  # jours (incubation)
INFECTIOUS_PERIOD: int = 10  # jours
BASIC_R0: float = 2.5  # Nombre de reproduction de base


# ================================
# CONFIGURATION PRINCIPALE (Classe)
# ================================
@dataclass
class GeneratorConfig:
    """Configuration principale du generateur epidemiologique."""
    
    # Parametres globaux
    seed: int = 42
    start_date: datetime = field(default_factory=lambda: datetime(2020, 3, 1))
    simulation_days: int = 60  # 60 jours de simulation
    output_dir: str = "/app/output"
    
    # Pays selectionnes
    selected_countries: List[str] = field(
        default_factory=lambda: [
            'France', 'Spain', 'Italy', 'Germany', 'United Kingdom'
        ]
    )
    
    # Parametres SEIR (equilibres pour ~35% sur 60 jours)
    transmission_rate: float = 0.50
    recovery_rate: float = 0.1
    r0_base: float = 3.5  # R0 equilibre
    latent_period: int = 5
    infectious_period: int = 10
    
    # Population
    patients_per_1000_cases: int = 10
    
    # Sante
    hospital_capacity_factor: float = 0.005
    icu_capacity_factor: float = 0.001


# Instance globale
config = GeneratorConfig()
