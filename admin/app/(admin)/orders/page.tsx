'use client'

import { useEffect, useState } from 'react'
import { AdminService, OrderStats } from '@/lib/api/admin.service'
import PageHeader from '@/components/PageHeader'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  disputed: 'Tranh chấp',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
  disputed: '#8b5cf6',
}

function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
}

export default function OrdersPage() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await AdminService.getOrderStats({
        from: from || undefined,
        to: to || undefined,
      })
      setStats(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const donutData = stats?.byStatus.map(s => ({
    label: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#94a3b8',
  })) ?? []

  const trendData = stats?.dailyTrend.map(d => ({ date: d.date, value: d.count })) ?? []
  const revenueTrendData = stats?.dailyTrend.map(d => ({ date: d.date, value: d.revenue })) ?? []

  return (
    <div>
      <PageHeader
        title="Thống kê đơn hàng"
        description="Chỉ thống kê, không xem chi tiết đơn hàng"
      />

      {/* Date filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Từ ngày</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Đến ngày</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input w-40" />
        </div>
        <button onClick={fetchStats} className="btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Lọc
        </button>
        {(from || to) && (
          <button onClick={() => { setFrom(''); setTo(''); }} className="btn-secondary">Xóa bộ lọc</button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Tổng đơn hàng</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {stats.byStatus.find(s => s.status === 'completed')?.count.toLocaleString() ?? '0'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Hoàn thành</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {stats.byStatus.find(s => s.status === 'pending')?.count.toLocaleString() ?? '0'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Đang chờ</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{fmtVnd(stats.totalRevenue)}</p>
              <p className="mt-1 text-sm text-gray-500">Doanh thu</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Phân bổ theo trạng thái</h3>
              {donutData.length > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <p className="text-sm text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Xu hướng đơn hàng theo ngày</h3>
              {trendData.length > 0 ? (
                <LineChart data={trendData} />
              ) : (
                <p className="text-sm text-gray-400">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Revenue trend */}
          {revenueTrendData.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Doanh thu theo ngày</h3>
              <LineChart
                data={revenueTrendData}
                color="#10b981"
                formatValue={v => fmtVnd(v)}
                height={140}
              />
            </div>
          )}

          {/* Status breakdown table */}
          <div className="mt-4 card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Chi tiết theo trạng thái</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượng</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Tỉ lệ</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.byStatus.map(s => (
                  <tr key={s.status}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] ?? '#94a3b8' }} />
                        {STATUS_LABELS[s.status] ?? s.status}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{s.count.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {stats.totalOrders > 0 ? ((s.count / stats.totalOrders) * 100).toFixed(1) + '%' : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">{fmtVnd(s.totalAmount)}</td>
                  </tr>
                ))}
                {stats.byStatus.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}
