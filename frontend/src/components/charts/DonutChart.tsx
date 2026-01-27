'use client'

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  strokeWidth?: number
  title?: string
}

export function DonutChart({ 
  data, 
  size = 200, 
  strokeWidth = 24,
  title 
}: DonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  let currentOffset = 0
  
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0
    const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`
    const strokeDashoffset = -currentOffset
    currentOffset += circumference * percentage
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset
    }
  })

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Fond gris */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* Centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">
            {total.toLocaleString()}
          </span>
          {title && (
            <span className="text-xs text-gray-500">{title}</span>
          )}
        </div>
      </div>
      
      {/* Legende */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-gray-600 truncate">
              {segment.label}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {(segment.percentage * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
