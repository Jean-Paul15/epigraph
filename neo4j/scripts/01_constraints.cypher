// Contraintes et index Neo4j pour EpiGraph
// A executer AVANT l'import des donnees

// ============================================================
// NETTOYAGE (optionnel - decommenter si besoin)
// ============================================================
// MATCH (n) DETACH DELETE n;

// ============================================================
// CONTRAINTES D'UNICITE
// ============================================================

CREATE CONSTRAINT patient_id_unique IF NOT EXISTS 
FOR (p:Patient) REQUIRE p.patient_id IS UNIQUE;

CREATE CONSTRAINT location_id_unique IF NOT EXISTS 
FOR (l:Location) REQUIRE l.location_id IS UNIQUE;

CREATE CONSTRAINT hospital_id_unique IF NOT EXISTS 
FOR (h:Hospital) REQUIRE h.hospital_id IS UNIQUE;

CREATE CONSTRAINT disease_id_unique IF NOT EXISTS 
FOR (d:Disease) REQUIRE d.disease_id IS UNIQUE;

CREATE CONSTRAINT vaccine_id_unique IF NOT EXISTS 
FOR (v:Vaccine) REQUIRE v.vaccine_id IS UNIQUE;

CREATE CONSTRAINT event_id_unique IF NOT EXISTS 
FOR (e:Event) REQUIRE e.event_id IS UNIQUE;

// ============================================================
// INDEX DE PERFORMANCE
// ============================================================

CREATE INDEX patient_age IF NOT EXISTS 
FOR (p:Patient) ON (p.age);

CREATE INDEX patient_location IF NOT EXISTS 
FOR (p:Patient) ON (p.location_id);

CREATE INDEX patient_vaccination IF NOT EXISTS 
FOR (p:Patient) ON (p.vaccination_status);

CREATE INDEX location_country IF NOT EXISTS 
FOR (l:Location) ON (l.country);

CREATE INDEX disease_variant IF NOT EXISTS 
FOR (d:Disease) ON (d.variant);

CREATE INDEX event_date IF NOT EXISTS 
FOR (e:Event) ON (e.date);

CREATE INDEX event_type IF NOT EXISTS 
FOR (e:Event) ON (e.type);

// Attendre la creation des index
CALL db.awaitIndexes(300);
