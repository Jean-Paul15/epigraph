/**
 * Types TypeScript pour l'application.
 */

export interface Patient {
  id: string
  age: number
  gender: 'M' | 'F'
  comorbidities: string
  vaccination_status: string
  country: string
  city: string
}

export interface PatientStats {
  total: number
  avg_age: number
  males: number
  females: number
}

export interface Infection {
  patient_from: string
  patient_to: string
  date: string
  proximity_duration: number
}

export interface SuperSpreader {
  id: string
  age: number
  vaccination_status: string
  comorbidities: string
  infections: number
}

export interface Community {
  communityId: number
  cluster_size: number
  sample_patients: string[]
}

export interface PageRankResult {
  patient_id: string
  age: number
  vaccination_status: string
  score: number
}

export interface Hospital {
  id: string
  name: string
  capacity: number
  available_beds: number
  equipment_level: string
  country: string
  city: string
  latitude: number
  longitude: number
}

export interface HospitalCapacity {
  country: string
  hospitals: number
  total_capacity: number
  total_available: number
  avg_occupancy: number
}

export interface RiskPrediction {
  patient_id: string
  risk_score: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  factors: string[]
}

export interface ForecastPoint {
  day: number
  predicted_cases: number
}

export interface InfectionByLocation {
  country: string
  city: string
  latitude: number
  longitude: number
  cases: number
}

export interface TimelinePoint {
  date: string
  cases: number
}

export interface VariantStats {
  variant: string
  cases: number
  avg_age: number
  transmission_rate: number
}
