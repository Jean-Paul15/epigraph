'use client'

interface VariantsChartProps {
  variants: any[]
  totalInfected: number
}

const variantColors = [
  'bg-blue-600',
  'bg-blue-500',
  'bg-blue-400',
  'bg-gray-500',
  'bg-gray-400',
]

export function VariantsChart({ variants, totalInfected }: VariantsChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribution par Variant
      </h3>
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{variant.variant}</span>
              <span className="text-sm text-gray-500">{variant.cases?.toLocaleString()} cas</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(variant.cases / (totalInfected || 1)) * 100}%` }}
                className={`h-full rounded-full ${variantColors[index % variantColors.length]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
