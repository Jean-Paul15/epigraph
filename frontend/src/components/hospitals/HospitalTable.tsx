'use client'

import type { Hospital } from '@/types'

interface HospitalTableProps {
  hospitals: Hospital[]
}

export function HospitalTable({ hospitals }: HospitalTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Liste des Hôpitaux
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 text-gray-500 font-medium text-sm">Nom</th>
              <th className="pb-3 text-gray-500 font-medium text-sm">Ville</th>
              <th className="pb-3 text-gray-500 font-medium text-sm">Capacité</th>
              <th className="pb-3 text-gray-500 font-medium text-sm">Disponible</th>
              <th className="pb-3 text-gray-500 font-medium text-sm">Équipement</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.slice(0, 10).map((hospital, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-gray-900 font-medium">{hospital.name}</td>
                <td className="py-3 text-gray-500">{hospital.city}</td>
                <td className="py-3 text-gray-500">{hospital.capacity}</td>
                <td className="py-3">
                  <span className={
                    hospital.available_beds < 20 
                      ? 'text-red-600 font-medium' 
                      : hospital.available_beds < 50 
                        ? 'text-amber-600 font-medium' 
                        : 'text-emerald-600 font-medium'
                  }>
                    {hospital.available_beds}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    hospital.equipment_level === 'advanced' 
                      ? 'bg-blue-50 text-blue-700'
                      : hospital.equipment_level === 'intermediate'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {hospital.equipment_level === 'advanced' ? 'Avancé' 
                      : hospital.equipment_level === 'intermediate' ? 'Intermédiaire' 
                      : 'Basique'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
