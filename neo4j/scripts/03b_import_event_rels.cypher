// Import des relations Patient -> Vaccine/Event
// Partie 2/3 des relations

// VACCINATED_WITH (Patient -> Vaccine)
LOAD CSV WITH HEADERS FROM 'file:///vaccinated_with.csv' AS row
CALL {
  WITH row
  MATCH (p:Patient {patient_id: row.patient_id})
  MATCH (v:Vaccine {vaccine_id: row.vaccine_id})
  CREATE (p)-[:VACCINATED_WITH {
    date: date(row.date),
    dose_number: toInteger(row.dose_number)
  }]->(v)
} IN TRANSACTIONS OF 500 ROWS;

// ATTENDED (Patient -> Event)
LOAD CSV WITH HEADERS FROM 'file:///attended.csv' AS row
CALL {
  WITH row
  MATCH (p:Patient {patient_id: row.patient_id})
  MATCH (e:Event {event_id: row.event_id})
  CREATE (p)-[:ATTENDED]->(e)
} IN TRANSACTIONS OF 500 ROWS;
