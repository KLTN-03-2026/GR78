'use client'

interface Slice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: Slice[]
  size?: number
  thickness?: number
}

export default function DonutChart({ data, size = 120, thickness = 22 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const slices = data.map(d => {
    const pct = total > 0 ? d.value / total : 0
    const dash = pct * circumference
    const gap = circumference - dash
    const startOffset = circumference - offset
    offset += dash
    return { ...d, dash, gap, startOffset }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={thickness} stroke="#e5e7eb" />
        ) : (
          slices.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              strokeWidth={thickness}
              stroke={s.color}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.startOffset}
            />
          ))
        )}
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600 truncate max-w-[120px]">{d.label}</span>
            <span className="font-semibold text-gray-900 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
