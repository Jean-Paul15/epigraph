import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorClasses = {
  primary: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
  },
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary' 
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className={change >= 0 ? "text-green-600 text-sm font-medium" : "text-red-600 text-sm font-medium"}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-gray-400 text-sm">vs semaine precedente</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
