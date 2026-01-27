// Import des relations entre entites non-Patient
// Partie 3/3 des relations

// HELD_IN (Event -> Location)
LOAD CSV WITH HEADERS FROM 'file:///events.csv' AS row
MATCH (e:Event {event_id: row.event_id})
MATCH (l:Location {location_id: row.location_id})
CREATE (e)-[:HELD_IN]->(l);

// LOCATED_IN (Hospital -> Location)
LOAD CSV WITH HEADERS FROM 'file:///hospitals.csv' AS row
MATCH (h:Hospital {hospital_id: row.hospital_id})
MATCH (l:Location {location_id: row.location_id})
CREATE (h)-[:LOCATED_IN]->(l);

// CONNECTED_TO (Location <-> Location)
LOAD CSV WITH HEADERS FROM 'file:///connected_to.csv' AS row
MATCH (l1:Location {location_id: row.location_from})
MATCH (l2:Location {location_id: row.location_to})
CREATE (l1)-[:CONNECTED_TO {
  travel_volume: toInteger(row.travel_volume),
  distance: toInteger(row.distance)
}]->(l2);

// TRANSFERS_TO (Hospital -> Hospital)
LOAD CSV WITH HEADERS FROM 'file:///transfers_to.csv' AS row
MATCH (h1:Hospital {hospital_id: row.hospital_from})
MATCH (h2:Hospital {hospital_id: row.hospital_to})
CREATE (h1)-[:TRANSFERS_TO {
  patient_count: toInteger(row.patient_count)
}]->(h2);

// MUTATES_TO (Disease -> Disease)
LOAD CSV WITH HEADERS FROM 'file:///mutates_to.csv' AS row
MATCH (d1:Disease {disease_id: row.disease_from})
MATCH (d2:Disease {disease_id: row.disease_to})
CREATE (d1)-[:MUTATES_TO {
  mutation_date: date(row.mutation_date)
}]->(d2);
