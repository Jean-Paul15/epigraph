'use client'

import { CheckCircle, Activity, TrendingUp } from 'lucide-react'

export function StatusCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="p-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Statut Neo4j</p>
          <p className="text-gray-900 font-medium">Connecté</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Projections GDS</p>
          <p className="text-gray-900 font-medium">2 actives</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="p-2 bg-amber-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Modèle ML</p>
          <p className="text-gray-900 font-medium">RandomForest prêt</p>
        </div>
      </div>
    </div>
  )
}
