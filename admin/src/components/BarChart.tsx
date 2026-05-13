'use client'

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  formatValue?: (v: number) => string
  title?: string
}

export default function BarChart({ data, height = 160, formatValue = String, title }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div>
      {title && <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: d.color ?? '#3b82f6',
                }}
              />
              <div className="absolute bottom-full mb-1 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                {formatValue(d.value)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <p key={i} className="flex-1 truncate text-center text-xs text-gray-500">{d.label}</p>
        ))}
      </div>
    </div>
  )
}
