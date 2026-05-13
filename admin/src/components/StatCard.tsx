'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo'
  trend?: { value: number; label: string }
}

const colorMap = {
  blue:   { bg: 'bg-teal-50',   icon: 'bg-teal-600',   text: 'text-teal-600' },
  green:  { bg: 'bg-emerald-50',  icon: 'bg-emerald-500',  text: 'text-emerald-600' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600' },
  purple: { bg: 'bg-violet-50', icon: 'bg-violet-500', text: 'text-violet-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-500',    text: 'text-red-600' },
  indigo: { bg: 'bg-cyan-50',   icon: 'bg-cyan-600',   text: 'text-cyan-600' },
}

export default function StatCard({ title, value, subtitle, icon, color = 'blue', trend }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-lg ${c.icon} p-2.5 text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
