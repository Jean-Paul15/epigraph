# Documentation des Modeles Machine Learning

Ce document explique les modeles ML utilises dans EpiGraph.

## Vue d'ensemble

Le projet utilise deux approches complementaires :

1. **Algorithmes de graphes (GDS)** : Analyses structurelles
2. **Machine Learning classique** : Predictions de risque

## 1. Algorithmes GDS

### Louvain Community Detection

**Objectif** : Identifier les clusters epidemiques.

**Fonctionnement** :
- Optimise la modularite du graphe
- Regroupe les noeuds fortement connectes
- Detecte automatiquement le nombre de communautes

**Interpretation** :
- Grandes communautes = foyers epidemiques majeurs
- Petites communautes = clusters isoles

### PageRank

**Objectif** : Identifier les patients centraux (super-propagateurs potentiels).

**Fonctionnement** :
- Mesure l'importance d'un noeud
- Un noeud est important si d'autres noeuds importants pointent vers lui
- Score entre 0 et 1

**Interpretation** :
- Score eleve = patient central dans le reseau
- Priorite pour l'isolement et le suivi

### Betweenness Centrality

**Objectif** : Trouver les "ponts" entre communautes.

**Fonctionnement** :
- Compte le nombre de chemins passant par un noeud
- Score eleve = noeud critique pour la propagation

**Interpretation** :
- Isoler ces patients peut couper la propagation inter-clusters

## 2. Modele de Prediction de Risque

### RandomForest Classifier

**Objectif** : Predire si un patient non infecte va etre infecte.

**Features utilisees** :

| Feature | Description | Importance |
|---------|-------------|------------|
| age | Age du patient | Haute |
| comorbidities | Maladies existantes | Haute |
| vaccination_status | Statut vaccinal | Haute |
| contacts | Nombre de contacts | Moyenne |
| location_density | Densite population | Moyenne |

**Pipeline** :

1. Extraction des features depuis Neo4j
2. Encodage des variables categoriques (LabelEncoder)
3. Entrainement RandomForest (100 arbres, profondeur 10)
4. Sauvegarde du modele (joblib)

**Note** : la precision rapportee par `train_model.py` est calculee sur les donnees d'entrainement (pas de jeu de test separe). Elle ne mesure donc pas la capacite de generalisation.

### Utilisation en production

```python
# Charger le modele
model_data = joblib.load('risk_model.pkl')
model = model_data['model']
encoders = model_data['encoders']

# Predire
features = extract_features(patient_id)
risk_score = model.predict_proba([features])[0][1]
```

## 3. Niveaux de risque

| Score | Niveau | Action recommandee |
|-------|--------|-------------------|
| 0.75+ | Critique | Isolement immediat |
| 0.50-0.74 | Eleve | Suivi rapproche |
| 0.30-0.49 | Modere | Surveillance standard |
| <0.30 | Faible | Aucune action speciale |

## 4. Limitations

- Modele entraine sur donnees simulees
- Performance depend de la qualite des features
- Biais possible selon la distribution des donnees
- Ne remplace pas le jugement medical

## 5. Ameliorations possibles

- Ajouter des features temporelles (Prophet)
- Link Prediction avec GDS
- Modele de deep learning (GNN)
- Validation croisee plus rigoureuse
