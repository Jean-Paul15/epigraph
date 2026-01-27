'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface DataItem {
  date: string
  value: number
  [key: string]: any
}

interface InteractiveAreaChartProps {
  data: DataItem[]
  title?: string
  height?: number
  color?: string
  showGrid?: boolean
  gradientId?: string
}

/**
 * Composant de graphique en aires interactif.
 * Ideal pour afficher des series temporelles.
 */
export function InteractiveAreaChart({
  data,
  title,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  gradientId = 'areaGradient'
}: InteractiveAreaChartProps) {

  /**
   * Formateur de date pour l'axe X.
   */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch {
      return dateStr
    }
  }

  /**
   * Tooltip personnalise avec informations detaillees.
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm text-blue-600 font-semibold">
            {payload[0].value.toLocaleString()} cas
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickMargin={10}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
