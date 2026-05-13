'use client'

interface LineChartProps {
  data: { date: string; value: number }[]
  height?: number
  color?: string
  formatValue?: (v: number) => string
}

export default function LineChart({ data, height = 120, color = '#3b82f6', formatValue = String }: LineChartProps) {
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm text-gray-400">Không có dữ liệu</div>

  const w = 400
  const h = height
  const pad = { top: 10, right: 10, bottom: 24, left: 40 }
  const innerW = w - pad.left - pad.right
  const innerH = h - pad.top - pad.bottom

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const minVal = 0

  const px = (i: number) => pad.left + (i / (data.length - 1 || 1)) * innerW
  const py = (v: number) => pad.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH

  const points = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ')
  const area = `M${pad.left},${pad.top + innerH} ` +
    data.map((d, i) => `L${px(i)},${py(d.value)}`).join(' ') +
    ` L${pad.left + innerW},${pad.top + innerH} Z`

  const labelStep = Math.max(1, Math.floor(data.length / 6))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height}>
      {/* area fill */}
      <path d={area} fill={color} opacity={0.12} />
      {/* line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* dots */}
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.value)} r={3} fill={color}>
          <title>{`${d.date}: ${formatValue(d.value)}`}</title>
        </circle>
      ))}
      {/* x labels */}
      {data.filter((_, i) => i % labelStep === 0).map((d, _, arr) => {
        const idx = data.indexOf(d)
        return (
          <text key={idx} x={px(idx)} y={h - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {d.date.slice(5)}
          </text>
        )
      })}
      {/* y axis top label */}
      <text x={pad.left - 4} y={pad.top + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
        {formatValue(maxVal)}
      </text>
    </svg>
  )
}
