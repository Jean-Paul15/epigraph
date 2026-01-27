'use client'

import { AlertTriangle } from 'lucide-react'

interface SaturationListProps {
  saturation: any[]
}

export function SaturationList({ saturation }: SaturationListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        Hôpitaux en Tension
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {saturation.map((hospital, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 
                     rounded-lg border-l-4 border-amber-500 hover:bg-gray-100 transition-colors"
          >
            <div>
              <p className="text-gray-900 font-medium">{hospital.name}</p>
              <p className="text-sm text-gray-500">{hospital.city}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-amber-600">
                {(hospital.occupancy * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">
                {hospital.available_beds} lits libres
              </p>
            </div>
          </div>
        ))}
        {saturation.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Aucun hôpital en tension actuellement
          </p>
        )}
      </div>
    </div>
  )
}
