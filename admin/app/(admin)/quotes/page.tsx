'use client'

import { useEffect, useState } from 'react'
import { AdminService, QuoteStats } from '@/lib/api/admin.service'
import PageHeader from '@/components/PageHeader'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
  accepted_for_chat: 'Chấp nhận để chat',
  revising: 'Đang đàm phán',
  order_requested: 'Yêu cầu đặt đơn',
  confirmed: 'Đã xác nhận',
  expired: 'Hết hạn',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  rejected: '#ef4444',
  cancelled: '#94a3b8',
  accepted_for_chat: '#06b6d4',
  revising: '#8b5cf6',
  order_requested: '#f97316',
  confirmed: '#10b981',
  expired: '#9ca3af',
}

export default function QuotesPage() {
  const [stats, setStats] = useState<QuoteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await AdminService.getQuoteStats({
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

  const confirmedCount = stats?.byStatus.find(s => s.status === 'confirmed')?.count ?? 0
  const pendingCount = stats?.byStatus.find(s => s.status === 'pending')?.count ?? 0
  const cancelledCount = stats?.byStatus.find(s => s.status === 'cancelled')?.count ?? 0
  const conversionRate = stats && stats.totalQuotes > 0
    ? ((confirmedCount / stats.totalQuotes) * 100).toFixed(1)
    : '0'

  return (
    <div>
      <PageHeader
        title="Thống kê báo giá"
        description="Chỉ thống kê, không xem chi tiết báo giá"
      />

      {/* Filters */}
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
              <p className="text-3xl font-bold text-gray-900">{stats.totalQuotes.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Tổng báo giá</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{confirmedCount.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Đã xác nhận</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{pendingCount.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Đang chờ</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{conversionRate}%</p>
              <p className="mt-1 text-sm text-gray-500">Tỉ lệ chuyển đổi</p>
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
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Xu hướng báo giá theo ngày</h3>
              {trendData.length > 0 ? (
                <LineChart data={trendData} color="#8b5cf6" />
              ) : (
                <p className="text-sm text-gray-400">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Status table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Chi tiết theo trạng thái</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượng</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Tỉ lệ</th>
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
                      {stats.totalQuotes > 0 ? ((s.count / stats.totalQuotes) * 100).toFixed(1) + '%' : '—'}
                    </td>
                  </tr>
                ))}
                {stats.byStatus.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400">Không có dữ liệu</td>
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
