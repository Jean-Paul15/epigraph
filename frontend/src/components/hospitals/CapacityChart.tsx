'use client'

import type { HospitalCapacity } from '@/types'

interface CapacityChartProps {
  capacity: HospitalCapacity[]
}

export function CapacityChart({ capacity }: CapacityChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Capacité par Pays
      </h3>
      <div className="space-y-4">
        {capacity.map((country, index) => {
          const occupancyPercent = ((country.total_capacity - country.total_available) / country.total_capacity) * 100
          const barColor = country.avg_occupancy < 0.5 
            ? 'bg-emerald-500' 
            : country.avg_occupancy < 0.8 
              ? 'bg-amber-500' 
              : 'bg-red-500'
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-medium">{country.country}</span>
                <span className="text-gray-500">
                  {country.total_available} / {country.total_capacity} lits
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{country.hospitals} hôpitaux</span>
                <span>{((1 - country.avg_occupancy) * 100).toFixed(0)}% libre</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
