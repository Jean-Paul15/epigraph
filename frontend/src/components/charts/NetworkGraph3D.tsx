'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Import dynamique pour eviter les erreurs SSR
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900 rounded-lg">
      <div className="text-white">Chargement du graphe 3D...</div>
    </div>
  )
})

interface GraphNode {
  id: string
  group: number
  label?: string
  size?: number
}

interface GraphLink {
  source: string
  target: string
  value?: number
}

interface NetworkGraph3DProps {
  nodes: GraphNode[]
  links: GraphLink[]
  height?: number
  onNodeClick?: (node: GraphNode) => void
}

export function NetworkGraph3D({ 
  nodes, 
  links, 
  height = 500,
  onNodeClick 
}: NetworkGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height })

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.offsetWidth,
            height
          })
        }
      }
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [height])

  // Couleurs par groupe (clusters)
  const getNodeColor = (node: GraphNode) => {
    const colors = [
      '#3b82f6', // Bleu
      '#10b981', // Vert
      '#f59e0b', // Orange
      '#ef4444', // Rouge
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#ec4899', // Rose
      '#84cc16', // Lime
    ]
    return colors[node.group % colors.length]
  }

  const graphData = {
    nodes: nodes.map(n => ({
      ...n,
      color: getNodeColor(n),
      val: n.size || 1
    })),
    links: links.map(l => ({
      ...l,
      color: 'rgba(255, 255, 255, 0.2)'
    }))
  }

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
      <ForceGraph3D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#ffffff"
        nodeLabel={(node: any) => node.label || node.id}
        nodeColor={(node: any) => node.color}
        nodeVal={(node: any) => node.val}
        nodeResolution={16}
        linkColor={() => 'rgba(59, 130, 246, 0.4)'}
        linkWidth={0.8}
        linkOpacity={0.5}
        onNodeClick={(node: any) => onNodeClick?.(node)}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
      />
    </div>
  )
}
