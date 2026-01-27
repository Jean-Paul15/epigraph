'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

/**
 * Palette de couleurs pour les graphiques.
 * Style minimaliste avec des couleurs modernes.
 */
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

interface DataItem {
  name: string
  value: number
}

interface InteractivePieChartProps {
  data: DataItem[]
  title?: string
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
}

/**
 * Composant de graphique circulaire interactif.
 * Utilise Recharts pour des tooltips et animations fluides.
 */
export function InteractivePieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100
}: InteractivePieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  /**
   * Formateur personnalise pour le tooltip.
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const percentage = ((item.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.value.toLocaleString()} cas ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {/* Affichage du total au centre */}
      <div className="text-center -mt-4">
        <span className="text-2xl font-bold text-gray-900">
          {total.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 ml-2">total</span>
      </div>
    </div>
  )
}
