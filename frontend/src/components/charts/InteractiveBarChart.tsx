'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

/**
 * Palette de couleurs pour les barres.
 */
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface DataItem {
  name: string
  value: number
  [key: string]: any
}

interface InteractiveBarChartProps {
  data: DataItem[]
  title?: string
  height?: number
  layout?: 'vertical' | 'horizontal'
  showGrid?: boolean
  color?: string
  gradientColors?: boolean
}

/**
 * Composant de graphique en barres interactif.
 * Supporte les orientations horizontale et verticale.
 */
export function InteractiveBarChart({
  data,
  title,
  height = 300,
  layout = 'horizontal',
  showGrid = true,
  color = '#3b82f6',
  gradientColors = false
}: InteractiveBarChartProps) {

  /**
   * Tooltip personnalise avec style moderne.
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600 font-semibold">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  if (layout === 'vertical') {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={gradientColors ? COLORS[index % COLORS.length] : color}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={gradientColors ? COLORS[index % COLORS.length] : color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
