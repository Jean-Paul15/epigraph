'use client'

interface DataPoint {
  label: string
  value: number
}

interface AreaChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  fillColor?: string
  showGrid?: boolean
  title?: string
}

export function AreaChart({ 
  data, 
  height = 200,
  color = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  showGrid = true,
  title
}: AreaChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  
  const padding = 40
  const chartWidth = 100
  const chartHeight = height - padding * 2
  
  // Calculer les points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d.value - minValue) / range) * 100
    return { x, y, ...d }
  })
  
  // Creer le chemin SVG
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  
  const areaPath = `${linePath} L 100 100 L 0 100 Z`

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      )}
      <div className="relative" style={{ height }}>
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grille */}
          {showGrid && (
            <g className="text-gray-100">
              {[0, 25, 50, 75, 100].map(y => (
                <line 
                  key={y} 
                  x1="0" 
                  y1={y} 
                  x2="100" 
                  y2={y} 
                  stroke="#f3f4f6" 
                  strokeWidth="0.5"
                />
              ))}
            </g>
          )}
          
          {/* Zone remplie */}
          <path
            d={areaPath}
            fill={fillColor}
            className="transition-all duration-300"
          />
          
          {/* Ligne */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300"
          />
          
          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={color}
              className="transition-all duration-300"
            />
          ))}
        </svg>
        
        {/* Labels X */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
          {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
      
      {/* Valeurs min/max */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Min: {minValue.toLocaleString()}</span>
        <span>Max: {maxValue.toLocaleString()}</span>
      </div>
    </div>
  )
}
