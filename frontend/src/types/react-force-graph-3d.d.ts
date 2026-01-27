declare module 'react-force-graph-3d' {
  import { Component } from 'react'

  export interface NodeObject {
    id: string | number
    x?: number
    y?: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
    fx?: number
    fy?: number
    fz?: number
    color?: string
    val?: number
    [key: string]: any
  }

  export interface LinkObject {
    source: string | number | NodeObject
    target: string | number | NodeObject
    color?: string
    [key: string]: any
  }

  export interface GraphData {
    nodes: NodeObject[]
    links: LinkObject[]
  }

  export interface ForceGraph3DProps {
    graphData: GraphData
    width?: number
    height?: number
    backgroundColor?: string
    nodeLabel?: string | ((node: NodeObject) => string)
    nodeColor?: string | ((node: NodeObject) => string)
    nodeVal?: number | string | ((node: NodeObject) => number)
    nodeResolution?: number
    nodeOpacity?: number
    nodeVisibility?: boolean | string | ((node: NodeObject) => boolean)
    linkLabel?: string | ((link: LinkObject) => string)
    linkColor?: string | ((link: LinkObject) => string)
    linkWidth?: number | string | ((link: LinkObject) => number)
    linkOpacity?: number
    linkVisibility?: boolean | string | ((link: LinkObject) => boolean)
    linkCurvature?: number | string | ((link: LinkObject) => number)
    onNodeClick?: (node: NodeObject, event: MouseEvent) => void
    onNodeHover?: (node: NodeObject | null, prevNode: NodeObject | null) => void
    onLinkClick?: (link: LinkObject, event: MouseEvent) => void
    onLinkHover?: (link: LinkObject | null, prevLink: LinkObject | null) => void
    onBackgroundClick?: (event: MouseEvent) => void
    enableNodeDrag?: boolean
    enableNavigationControls?: boolean
    showNavInfo?: boolean
    cooldownTicks?: number
    cooldownTime?: number
    warmupTicks?: number
    d3AlphaDecay?: number
    d3VelocityDecay?: number
    [key: string]: any
  }

  export default class ForceGraph3D extends Component<ForceGraph3DProps> {}
}
