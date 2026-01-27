'use client'

import { Building2, Bed, AlertTriangle, ArrowLeftRight } from 'lucide-react'

interface StatsCardsProps {
  hospitalsCount: number
  totalAvailable: number
  saturationCount: number
  occupancyRate: string
}

export function HospitalStatsCards({
  hospitalsCount,
  totalAvailable,
  saturationCount,
  occupancyRate
}: StatsCardsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="p-2.5 bg-blue-50 rounded-xl w-fit mb-3">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{hospitalsCount}</p>
        <p className="text-sm text-gray-500 mt-1">Hôpitaux</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="p-2.5 bg-emerald-50 rounded-xl w-fit mb-3">
          <Bed className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">
          {totalAvailable.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mt-1">Lits disponibles</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="p-2.5 bg-amber-50 rounded-xl w-fit mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{saturationCount}</p>
        <p className="text-sm text-gray-500 mt-1">Proches saturation</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="p-2.5 bg-red-50 rounded-xl w-fit mb-3">
          <ArrowLeftRight className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-3xl font-semibold text-gray-900">{occupancyRate}%</p>
        <p className="text-sm text-gray-500 mt-1">Taux d'occupation</p>
      </div>
    </div>
  )
}
