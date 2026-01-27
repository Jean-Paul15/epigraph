'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { HospitalStatsCards } from '@/components/hospitals/StatsCards'
import { CapacityChart } from '@/components/hospitals/CapacityChart'
import { SaturationList } from '@/components/hospitals/SaturationList'
import { HospitalTable } from '@/components/hospitals/HospitalTable'
import { hospitalsApi } from '@/lib/api'
import type { Hospital, HospitalCapacity } from '@/types'

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [capacity, setCapacity] = useState<HospitalCapacity[]>([])
  const [saturation, setSaturation] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [hospData, capData, satData] = await Promise.all([
          hospitalsApi.getAll({ limit: '50' }),
          hospitalsApi.getCapacity(),
          hospitalsApi.getSaturation(0.7)
        ])
        setHospitals(Array.isArray(hospData.data) ? hospData.data : [])
        setCapacity(Array.isArray(capData.data) ? capData.data : [])
        setSaturation(Array.isArray(satData.data) ? satData.data : [])
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    )
  }

  const totalCapacity = capacity.reduce((acc, c) => acc + c.total_capacity, 0)
  const totalAvailable = capacity.reduce((acc, c) => acc + c.total_available, 0)
  const occupancyRate = totalCapacity > 0 
    ? ((totalCapacity - totalAvailable) / totalCapacity * 100).toFixed(1) 
    : '0'

  return (
    <div>
      <Header 
        title="Ressources Hospitalières" 
        subtitle="Gestion des capacités et transferts" 
      />
      <div className="p-6 space-y-6">
        <HospitalStatsCards
          hospitalsCount={hospitals.length}
          totalAvailable={totalAvailable}
          saturationCount={saturation.length}
          occupancyRate={occupancyRate}
        />
        <div className="grid lg:grid-cols-2 gap-6">
          <CapacityChart capacity={capacity} />
          <SaturationList saturation={saturation} />
        </div>
        <HospitalTable hospitals={hospitals} />
      </div>
    </div>
  )
}
