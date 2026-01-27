'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Network, ArrowRight, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { infectionsApi } from '@/lib/api'
import type { SuperSpreader } from '@/types'

export default function ContactTracingPage() {
  const [patientId, setPatientId] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [superSpreaders, setSuperSpreaders] = useState<SuperSpreader[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    async function fetchSpreaders() {
      try {
        const data = await infectionsApi.getSuperSpreaders(6)
        setSuperSpreaders(Array.isArray(data.data) ? data.data : [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchSpreaders()
  }, [])

  const handleSearch = async () => {
    if (!patientId.trim()) return
    
    setLoading(true)
    try {
      const data = await infectionsApi.getChain(patientId, 3)
      setSearchResult(data.data)
    } catch (error) {
      console.error('Error:', error)
      setSearchResult(null)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Contact Tracing" 
        subtitle="Traçage des chaînes de contamination" 
      />

      <div className="p-6 space-y-6">
        {/* Recherche */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rechercher un Patient
          </h3>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ID du patient (ex: P000001)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                         text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Tracer les contacts'}
            </button>
          </div>
        </div>

        {/* Resultats de recherche */}
        {searchResult && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chaîne de Contamination - {patientId}
            </h3>
            <div className="space-y-4">
              {searchResult.map((chain: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {chain.chain?.map((node: any, nodeIndex: number) => (
                      <div key={nodeIndex} className="flex items-center gap-2">
                        <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-blue-700 font-medium">{node.id}</p>
                          <p className="text-xs text-gray-500">
                            Âge: {node.age}
                          </p>
                        </div>
                        {nodeIndex < chain.chain.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Profondeur: {chain.depth} niveaux
                  </p>
                </div>
              ))}
              {searchResult.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  Aucune chaîne de contamination trouvée pour ce patient
                </p>
              )}
            </div>
          </div>
        )}

        {/* Super Propagateurs */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Network className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Super-Propagateurs (3+ infections)
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {superSpreaders.map((spreader) => (
              <div
                key={spreader.id}
                onClick={() => setPatientId(spreader.id)}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 
                         transition-colors cursor-pointer border border-transparent
                         hover:border-blue-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl 
                                  flex items-center justify-center">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{spreader.id}</p>
                      <p className="text-xs text-gray-500">
                        Âge: {spreader.age}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-red-600">
                      {spreader.infections}
                    </p>
                    <p className="text-xs text-gray-400">infections</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                    {spreader.vaccination_status}
                  </span>
                  {spreader.comorbidities !== 'none' && (
                    <span className="px-2 py-1 bg-amber-50 rounded text-xs text-amber-700">
                      {spreader.comorbidities}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
