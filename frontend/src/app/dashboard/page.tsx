'use client'

import { useEffect, useState } from 'react'
import { Users, Activity, Building2, TrendingUp, Network } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/cards/MetricCard'
import { InteractivePieChart } from '@/components/charts/InteractivePieChart'
import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart'
import { patientsApi, infectionsApi } from '@/lib/api'

interface DashboardStats {
  totalPatients: number
  totalInfected: number
  totalHospitals: number
  communities: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<any[]>([])
  const [topSpreaders, setTopSpreaders] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientStats, spreaders, clusterStats, variantData] = 
          await Promise.all([
            patientsApi.getStats(),
            infectionsApi.getSuperSpreaders(5),
            infectionsApi.getClusterStats(),
            infectionsApi.getByVariant()
          ])

        const infected = Array.isArray(variantData.data)
          ? variantData.data.reduce((acc: number, v: any) => acc + v.cases, 0)
          : 0

        const patientTotal = (patientStats.data as { total?: number } | null)?.total || 0
        const clusterData = clusterStats.data as { significant_clusters?: number } | null

        setStats({
          totalPatients: patientTotal,
          totalInfected: infected,
          totalHospitals: 200,
          communities: clusterData?.significant_clusters || 0
        })
        setVariants(Array.isArray(variantData.data) ? variantData.data : [])
        setTopSpreaders(Array.isArray(spreaders.data) ? spreaders.data.slice(0, 10) : [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          <p className="text-gray-500">Chargement des donnees...</p>
        </div>
      </div>
    )
  }

  // Donnees pour le pie chart des variants
  const variantChartData = variants.map(v => ({
    name: v.variant,
    value: v.cases
  }))

  // Donnees pour le bar chart des spreaders
  const spreaderChartData = topSpreaders.map(s => ({
    name: s.id?.substring(0, 8) || 'N/A',
    value: s.infections || 0
  }))

  return (
    <div className="bg-white min-h-screen">
      <Header title="Tableau de Bord" subtitle="Vue d'ensemble de l'epidemie" />
      
      <div className="p-6 space-y-6">
        {/* Metriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Patients Total"
            value={stats?.totalPatients?.toLocaleString() || '0'}
            icon={Users}
            color="primary"
          />
          <MetricCard
            title="Patients Infectes"
            value={stats?.totalInfected?.toLocaleString() || '0'}
            icon={Activity}
            color="danger"
          />
          <MetricCard
            title="Hopitaux"
            value={stats?.totalHospitals || '0'}
            icon={Building2}
            color="success"
          />
          <MetricCard
            title="Clusters Detectes"
            value={stats?.communities || '0'}
            icon={Network}
            color="warning"
          />
        </div>

        {/* Section Graphiques Variants */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <InteractivePieChart 
              data={variantChartData}
              title="Distribution par Variant"
              height={320}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <InteractiveBarChart 
              data={variantChartData}
              title="Cas par Variant"
              height={320}
              layout="vertical"
              gradientColors
            />
          </div>
        </div>

        {/* Section Super-Propagateurs */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <InteractiveBarChart 
            data={spreaderChartData}
            title="Top 10 Super-Propagateurs"
            height={300}
            color="#ef4444"
          />
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatusCard 
            icon={<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            label="Statut Neo4j"
            value="Connecte"
            color="emerald"
          />
          <StatusCard 
            icon={<Network className="w-4 h-4 text-blue-600" />}
            label="Projections GDS"
            value="2 actives"
            color="blue"
          />
          <StatusCard 
            icon={<TrendingUp className="w-4 h-4 text-amber-600" />}
            label="Modele ML"
            value="RandomForest pret"
            color="amber"
          />
        </div>
      </div>
    </div>
  )
}

function StatusCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'emerald' | 'blue' | 'amber'
}) {
  const bgColor = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50'
  }[color]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2.5 ${bgColor} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  )
}
