'use client'

import { useEffect, useState } from 'react'
import { Clock, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { InteractiveAreaChart } from '@/components/charts/InteractiveAreaChart'
import { InteractivePieChart } from '@/components/charts/InteractivePieChart'
import { infectionsApi } from '@/lib/api'
import type { TimelinePoint, VariantStats } from '@/types'

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [variants, setVariants] = useState<VariantStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [timelineData, variantData] = await Promise.all([
          infectionsApi.getTimeline(),
          infectionsApi.getByVariant()
        ])
        
        // Mapper infection_date vers date pour compatibilite
        const rawTimeline = Array.isArray(timelineData.data) ? timelineData.data : []
        const mappedTimeline = rawTimeline.map((t: any) => ({
          date: t.infection_date || t.date || '',
          cases: t.cases || 0
        }))
        
        setTimeline(mappedTimeline)
        setVariants(Array.isArray(variantData.data) ? variantData.data : [])
      } catch (error) {
        console.error('Error:', error)
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
          <p className="text-gray-500">Chargement de la chronologie...</p>
        </div>
      </div>
    )
  }

  const totalCases = variants.reduce((acc, v) => acc + v.cases, 0)
  const peakDay = timeline.reduce((max, day) => 
    day.cases > max.cases ? day : max, 
    timeline[0] || { date: '', cases: 0 }
  )

  // Donnees pour le graphique area
  const areaData = timeline.slice(-30).map(t => ({
    date: t.date || '',
    value: t.cases
  }))

  // Donnees pour le pie chart
  const pieData = variants.map(v => ({
    name: v.variant,
    value: v.cases
  }))

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Evolution Temporelle" 
        subtitle="Chronologie des infections et variants" 
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            value={timeline.length}
            label="Jours de donnees"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-50"
            value={totalCases.toLocaleString()}
            label="Cas totaux"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            value={peakDay.cases}
            label="Pic journalier"
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            value={variants.length}
            label="Variants actifs"
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courbe des infections - 2/3 */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <InteractiveAreaChart 
              data={areaData} 
              title="Courbe des Infections (30 derniers jours)"
              height={300}
              color="#3b82f6"
            />
          </div>

          {/* Pie chart variants - 1/3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <InteractivePieChart 
              data={pieData}
              title="Repartition des Variants"
              height={300}
            />
          </div>
        </div>

        {/* Details des variants en cartes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Details des Variants
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {variants.map((variant, index) => {
              const percentage = totalCases > 0 
                ? ((variant.cases / totalCases) * 100).toFixed(1) 
                : '0'
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm text-gray-500 truncate">{variant.variant}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {variant.cases.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{percentage}% du total</p>
                </div>
              )
            })}
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}
