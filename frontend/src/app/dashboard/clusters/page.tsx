'use client'

import { useEffect, useState } from 'react'
import { Network, Users, Search, Loader2, Eye, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { analyticsApi } from '@/lib/api'
import type { Community, PageRankResult } from '@/types'
import dynamic from 'next/dynamic'

// Import dynamique du graphe 3D (evite SSR)
const NetworkGraph3D = dynamic(
  () => import('@/components/charts/NetworkGraph3D').then(mod => mod.NetworkGraph3D),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-slate-900 rounded-xl">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }
)

interface GraphNode {
  id: string
  group: number
  label?: string
  size?: number
}

interface GraphLink {
  source: string
  target: string
}

export default function ClustersPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [pageRank, setPageRank] = useState<PageRankResult[]>([])
  const [loading, setLoading] = useState(true)
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ 
    nodes: [], 
    links: [] 
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [activeTab, setActiveTab] = useState<'graph' | 'list'>('graph')

  useEffect(() => {
    async function fetchData() {
      try {
        const [commData, prData] = await Promise.all([
          analyticsApi.getCommunities(20),
          analyticsApi.getPageRank(20)
        ])
        
        const comms = Array.isArray(commData.data) ? commData.data : []
        const pr = Array.isArray(prData.data) ? prData.data : []
        
        setCommunities(comms)
        setPageRank(pr)
        buildGraphData(comms, pr)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const buildGraphData = (comms: Community[], pr: PageRankResult[]) => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const nodeSet = new Set<string>()
    
    comms.forEach((comm, groupIndex) => {
      const patients = comm.sample_patients || []
      patients.forEach((patientId, i) => {
        if (!nodeSet.has(patientId)) {
          const prScore = pr.find(p => p.patient_id === patientId)?.score || 0.1
          nodes.push({
            id: patientId,
            group: groupIndex,
            label: `${patientId} (Cluster ${comm.communityId})`,
            size: Math.max(1, prScore * 50)
          })
          nodeSet.add(patientId)
        }
        if (i > 0 && patients[i - 1]) {
          links.push({ source: patients[i - 1], target: patientId })
        }
      })
    })
    
    pr.forEach((patient, i) => {
      if (!nodeSet.has(patient.patient_id)) {
        nodes.push({
          id: patient.patient_id,
          group: i % 8,
          label: `${patient.patient_id} (Score: ${patient.score.toFixed(2)})`,
          size: patient.score * 50
        })
        nodeSet.add(patient.patient_id)
      }
    })
    
    setGraphData({ nodes, links })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500">Chargement des clusters...</p>
        </div>
      </div>
    )
  }

  const totalInClusters = communities.reduce((acc, c) => acc + c.cluster_size, 0)

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Détection de Clusters" 
        subtitle="Algorithme Louvain - Communautés épidémiques" 
      />

      <div className="p-6 space-y-6">
        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            icon={<Network className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            value={communities.length}
            label="Clusters détectés"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            value={totalInClusters.toLocaleString()}
            label="Patients dans les clusters"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            value={Math.round(totalInClusters / communities.length || 0)}
            label="Taille moyenne"
          />
        </div>

        {/* Onglets */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'graph' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Visualisation 3D
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'list' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Liste des Clusters
          </button>
        </div>

        {activeTab === 'graph' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Réseau Épidémique 3D
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cliquez et faites glisser pour explorer
                  </p>
                </div>
              </div>
              {selectedNode && (
                <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">{selectedNode.label}</p>
                </div>
              )}
            </div>
            <NetworkGraph3D
              nodes={graphData.nodes}
              links={graphData.links}
              height={500}
              onNodeClick={(node) => setSelectedNode(node)}
            />
          </div>
        )}

        {activeTab === 'list' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ClusterList communities={communities} />
            <PageRankList pageRank={pageRank} />
          </div>
        )}
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2.5 ${iconBg} rounded-xl mb-3`}>{icon}</div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function ClusterList({ communities }: { communities: Community[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communautés (Louvain)</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {communities.map((comm, i) => (
          <div key={comm.communityId} 
               className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                   style={{ backgroundColor: `hsl(${210 + (i * 15) % 60}, 60%, 50%)` }}>
                {i + 1}
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">Cluster #{comm.communityId}</p>
                <p className="text-xs text-gray-500">{comm.sample_patients?.slice(0, 3).join(', ')}...</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{comm.cluster_size.toLocaleString()}</p>
              <p className="text-xs text-gray-400">patients</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageRankList({ pageRank }: { pageRank: PageRankResult[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PageRank - Patients Centraux</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {pageRank.map((patient, i) => (
          <div key={patient.patient_id} 
               className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-medium">
                {i + 1}
              </div>
              <div>
                <p className="text-gray-900 font-medium text-sm">{patient.patient_id}</p>
                <p className="text-xs text-gray-500">Âge: {patient.age}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-600">{patient.score.toFixed(2)}</p>
              <p className="text-xs text-gray-400">score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
