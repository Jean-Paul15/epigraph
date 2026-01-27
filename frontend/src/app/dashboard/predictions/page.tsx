'use client'

import { useEffect, useState } from 'react'
import { Brain, AlertTriangle, TrendingUp, Shield, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BarChart } from '@/components/charts/BarChart'
import { predictionsApi } from '@/lib/api'
import type { RiskPrediction, ForecastPoint } from '@/types'

interface ModelInfo {
  algorithm: string
  features: string[]
  model_exists: boolean
  last_trained: string | null
}

export default function PredictionsPage() {
  const [atRisk, setAtRisk] = useState<RiskPrediction[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [riskData, forecastData, modelData] = await Promise.all([
          predictionsApi.getAtRiskPatients(0.5, 20),
          predictionsApi.getForecast(14),
          predictionsApi.getModelInfo()
        ])
        
        setAtRisk(Array.isArray(riskData.data) ? riskData.data : [])
        const forecastResult = forecastData.data as { forecast?: ForecastPoint[] } | null
        setForecast(Array.isArray(forecastResult?.forecast) ? forecastResult.forecast : [])
        setModelInfo(modelData.data as ModelInfo | null)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">Chargement des prédictions...</p>
        </div>
      </div>
    )
  }

  const criticalCount = atRisk.filter(p => p.risk_level === 'critical').length
  const highCount = atRisk.filter(p => p.risk_level === 'high').length

  // Donnees pour le graphique de prevision
  const forecastData = forecast.map(p => ({
    label: `J+${p.day}`,
    value: p.predicted_cases,
    color: '#3b82f6'
  }))

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Prédictions ML" 
        subtitle="Modèle RandomForest - Évaluation des risques" 
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            icon={<Brain className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            value={atRisk.length}
            label="Patients à risque"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-50"
            value={criticalCount}
            label="Risque critique"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            value={highCount}
            label="Risque élevé"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            value={forecast[forecast.length - 1]?.predicted_cases || 0}
            label="Cas prévus J+14"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Graphique Prevision */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Prévision 14 jours
            </h3>
            {forecastData.length > 0 ? (
              <BarChart data={forecastData} height={250} />
            ) : (
              <p className="text-gray-400 text-center py-8">
                Pas assez de données pour la prévision
              </p>
            )}
          </div>

          {/* Liste des patients a risque */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Patients à Risque
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {atRisk.map((patient, index) => (
                <div
                  key={patient.patient_id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.risk_level)}`}>
                      {patient.risk_level?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{patient.patient_id}</p>
                      <p className="text-sm text-gray-500">
                        {patient.factors?.join(', ') || 'Aucun facteur spécifique'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {((patient.risk_score || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400">probabilité</p>
                  </div>
                </div>
              ))}
              {atRisk.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  Aucun patient à risque élevé détecté
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Infos Modele ML */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations sur le Modele
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm mb-1">Algorithme</p>
              <p className="text-gray-900 font-medium">
                {modelInfo?.algorithm || 'RandomForest Classifier'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm mb-1">Features utilisees</p>
              <p className="text-gray-900 font-medium">
                {modelInfo?.features?.join(', ') || 'age, comorbidites, vaccination, contacts'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm mb-1">Derniere mise a jour</p>
              <p className="text-gray-900 font-medium">
                {modelInfo?.last_trained || 'Non entraine'}
              </p>
              {modelInfo?.model_exists && (
                <p className="text-xs text-emerald-600 mt-1">Modele actif</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, iconBg, value, label }: {
  icon: React.ReactNode
  iconBg: string
  value: string | number
  label: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className={`inline-flex p-2.5 ${iconBg} rounded-xl mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
