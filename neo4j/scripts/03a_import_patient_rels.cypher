// Import des relations Patient -> Location/Hospital/Disease
// Partie 1/3 des relations

// LIVES_IN (Patient -> Location)
LOAD CSV WITH HEADERS FROM 'file:///patients.csv' AS row
CALL {
  WITH row
  MATCH (p:Patient {patient_id: row.patient_id})
  MATCH (l:Location {location_id: row.location_id})
  CREATE (p)-[:LIVES_IN]->(l)
} IN TRANSACTIONS OF 500 ROWS;

// INFECTED_BY (reseau de contamination)
LOAD CSV WITH HEADERS FROM 'file:///infected_by.csv' AS row
CALL {
  WITH row
  MATCH (p1:Patient {patient_id: row.patient_from})
  MATCH (p2:Patient {patient_id: row.patient_to})
  CREATE (p1)-[:INFECTED_BY {
    date: date(row.date),
    proximity_duration: toInteger(row.proximity_duration)
  }]->(p2)
} IN TRANSACTIONS OF 500 ROWS;

// TREATED_AT (Patient -> Hospital)
LOAD CSV WITH HEADERS FROM 'file:///treated_at.csv' AS row
CALL {
  WITH row
  MATCH (p:Patient {patient_id: row.patient_id})
  MATCH (h:Hospital {hospital_id: row.hospital_id})
  CREATE (p)-[:TREATED_AT {
    admission_date: date(row.admission_date),
    discharge_date: date(row.discharge_date)
  }]->(h)
} IN TRANSACTIONS OF 500 ROWS;

// HAS_DISEASE (Patient -> Disease)
LOAD CSV WITH HEADERS FROM 'file:///has_disease.csv' AS row
CALL {
  WITH row
  MATCH (p:Patient {patient_id: row.patient_id})
  MATCH (d:Disease {disease_id: row.disease_id})
  CREATE (p)-[:HAS_DISEASE {
    diagnosis_date: date(row.diagnosis_date),
    severity: row.severity
  }]->(d)
} IN TRANSACTIONS OF 500 ROWS;
