// Projections GDS pour les algorithmes de graphes
// Prerequis: Toutes les donnees importees

// ============================================================
// PROJECTION PRINCIPALE - Reseau epidemique
// ============================================================

// Supprimer si existe
CALL gds.graph.drop('epidemic-network', false) YIELD graphName;

// Creer la projection
CALL gds.graph.project(
  'epidemic-network',
  ['Patient'],
  {
    INFECTED_BY: {
      type: 'INFECTED_BY',
      orientation: 'NATURAL',
      properties: ['proximity_duration']
    }
  }
) YIELD graphName, nodeCount, relationshipCount;

// ============================================================
// PROJECTION ETENDUE - Multi-types
// ============================================================

CALL gds.graph.drop('epidemic-full', false) YIELD graphName;

CALL gds.graph.project(
  'epidemic-full',
  ['Patient', 'Location', 'Hospital', 'Event'],
  {
    INFECTED_BY: { orientation: 'NATURAL' },
    LIVES_IN: { orientation: 'NATURAL' },
    TREATED_AT: { orientation: 'NATURAL' },
    ATTENDED: { orientation: 'NATURAL' }
  }
) YIELD graphName, nodeCount, relationshipCount;

// ============================================================
// VERIFICATION
// ============================================================

CALL gds.graph.list() 
YIELD graphName, nodeCount, relationshipCount, memoryUsage
RETURN graphName, nodeCount, relationshipCount, memoryUsage;
