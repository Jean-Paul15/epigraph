'use client'

import { AlertTriangle } from 'lucide-react'

interface TopSpreadersProps {
  spreaders: any[]
}

export function TopSpreaders({ spreaders }: TopSpreadersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Super-Propagateurs
      </h3>
      <div className="space-y-3">
        {spreaders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Aucun super-propagateur détecté</p>
        ) : (
          spreaders.map((spreader, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{spreader.id}</p>
                  <p className="text-sm text-gray-500">
                    Age: {spreader.age} - {spreader.vaccination_status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-600 font-semibold text-lg">{spreader.infections}</p>
                <p className="text-xs text-gray-400">infections</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
