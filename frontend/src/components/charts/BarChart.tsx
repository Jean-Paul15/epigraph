'use client'

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  horizontal?: boolean
}

export function BarChart({ 
  data, 
  height = 200,
  showValues = true,
  horizontal = false
}: BarChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
  ]

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          const color = item.color || defaultColors[index % defaultColors.length]
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{item.label}</span>
                {showValues && (
                  <span className="text-gray-500">{item.value.toLocaleString()}</span>
                )}
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        const color = item.color || defaultColors[index % defaultColors.length]
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center" style={{ height: height - 40 }}>
              {showValues && (
                <span className="text-xs text-gray-500 mb-1">
                  {item.value.toLocaleString()}
                </span>
              )}
              <div 
                className="w-full max-w-[40px] rounded-t-lg transition-all duration-500"
                style={{ 
                  height: `${percentage}%`,
                  backgroundColor: color,
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
              />
            </div>
            <span className="text-xs text-gray-500 text-center truncate w-full">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
