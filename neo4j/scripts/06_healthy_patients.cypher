// Script pour creer les patients sains (H000001-H010000)
// Execute automatiquement si ces patients n'existent pas

// Creation des patients sains avec profils de risque varies
// MERGE evite les doublons si les patients existent deja
UNWIND range(1, 10000) AS i
MERGE (p:Patient {patient_id: 'H' + apoc.text.lpad(toString(i), 6, '0')})
ON CREATE SET
  p.age = 20 + (i % 60),
  p.sex = CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
  p.blood_type = CASE i % 4 
    WHEN 0 THEN 'A+' 
    WHEN 1 THEN 'B+' 
    WHEN 2 THEN 'O+' 
    ELSE 'AB+' 
  END,
  p.vaccination_status = CASE i % 3 
    WHEN 0 THEN 'fully' 
    WHEN 1 THEN 'partially' 
    ELSE 'unvaccinated' 
  END,
  p.risk_score = CASE 
    WHEN i % 10 < 3 THEN 0.7 + (toFloat(i % 100) / 300)
    WHEN i % 10 < 6 THEN 0.4 + (toFloat(i % 100) / 300)
    ELSE 0.1 + (toFloat(i % 100) / 500)
  END,
  p.chronic_conditions = CASE i % 5
    WHEN 0 THEN ['diabetes']
    WHEN 1 THEN ['hypertension']
    WHEN 2 THEN ['diabetes', 'obesity']
    WHEN 3 THEN []
    ELSE ['asthma']
  END;
