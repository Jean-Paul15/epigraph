// Import des noeuds Neo4j pour EpiGraph
// Prerequis: 01_constraints.cypher execute

// ============================================================
// LOCATIONS (donnees geographiques)
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///locations.csv' AS row
CREATE (l:Location {
  location_id: row.location_id,
  country: row.country,
  region: row.region,
  city: row.city,
  latitude: toFloat(row.latitude),
  longitude: toFloat(row.longitude),
  population_density: toInteger(row.population_density),
  total_confirmed_cases: toInteger(row.total_confirmed_cases)
});

// ============================================================
// HOSPITALS
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///hospitals.csv' AS row
CREATE (h:Hospital {
  hospital_id: row.hospital_id,
  name: row.name,
  capacity: toInteger(row.capacity),
  available_beds: toInteger(row.available_beds),
  equipment_level: row.equipment_level,
  country: row.country,
  location_id: row.location_id
});

// ============================================================
// DISEASES (variants COVID-19)
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///diseases.csv' AS row
CREATE (d:Disease {
  disease_id: row.disease_id,
  name: row.name,
  variant: row.variant,
  severity: row.severity,
  transmission_rate: toFloat(row.transmission_rate),
  emergence_date: date(row.emergence_date)
});

// ============================================================
// VACCINES
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///vaccines.csv' AS row
CREATE (v:Vaccine {
  vaccine_id: row.vaccine_id,
  name: row.name,
  efficacy: toFloat(row.efficacy),
  doses_required: toInteger(row.doses_required),
  approval_date: date(row.approval_date)
});

// ============================================================
// EVENTS
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///events.csv' AS row
CREATE (e:Event {
  event_id: row.event_id,
  type: row.type,
  date: date(row.date),
  attendees_count: toInteger(row.attendees_count),
  location_id: row.location_id
});

// ============================================================
// PATIENTS (import par lots)
// ============================================================
LOAD CSV WITH HEADERS FROM 'file:///patients.csv' AS row
CALL {
  WITH row
  CREATE (p:Patient {
    patient_id: row.patient_id,
    age: toInteger(row.age),
    gender: row.gender,
    comorbidities: row.comorbidities,
    vaccination_status: row.vaccination_status,
    location_id: row.location_id
  })
} IN TRANSACTIONS OF 500 ROWS;
