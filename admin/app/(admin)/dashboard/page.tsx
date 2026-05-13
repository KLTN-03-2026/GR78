'use client'

import { useEffect, useState } from 'react'
import { AdminService, OverviewStats } from '@/lib/api/admin.service'
import StatCard from '@/components/StatCard'
import PageHeader from '@/components/PageHeader'

function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    AdminService.getOverview()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Đang tải...</div>
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
  if (!stats) return null

  return (
    <div>
      <PageHeader
        title="Tổng quan hệ thống"
        description={`Cập nhật lúc ${new Date().toLocaleString('vi-VN')}`}
      />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Tổng tài khoản"
          value={stats.totalUsers.toLocaleString()}
          subtitle={`${stats.newUsersLast30Days} mới trong 30 ngày`}
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString()}
          subtitle={`${stats.ordersLast30Days} đơn trong 30 ngày`}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Doanh thu đơn hàng"
          value={fmtVnd(stats.totalRevenue)}
          subtitle="Đơn hàng hoàn thành"
          color="orange"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Doanh thu gói dịch vụ"
          value={fmtVnd(stats.totalSubscriptionRevenue)}
          subtitle={`${stats.activeSubscriptions} gói đang hoạt động`}
          color="purple"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Secondary stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Khách hàng"
          value={stats.totalCustomers.toLocaleString()}
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          title="Thợ / Nhà cung cấp"
          value={stats.totalProviders.toLocaleString()}
          subtitle={`${stats.activeProviders} đang hoạt động`}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Đơn hoàn thành"
          value={stats.completedOrders.toLocaleString()}
          subtitle={`${stats.pendingOrders} đang chờ · ${stats.cancelledOrders} đã hủy`}
          color="green"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Tổng báo giá"
          value={stats.totalQuotes.toLocaleString()}
          subtitle={`${stats.confirmedQuotes} đã xác nhận · ${stats.pendingQuotes} đang chờ`}
          color="indigo"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Summary table */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Tóm tắt đơn hàng</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {[
                { label: 'Tổng đơn', value: stats.totalOrders, color: 'text-gray-900' },
                { label: 'Đang chờ xử lý', value: stats.pendingOrders, color: 'text-yellow-600' },
                { label: 'Hoàn thành', value: stats.completedOrders, color: 'text-green-600' },
                { label: 'Đã hủy', value: stats.cancelledOrders, color: 'text-red-600' },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2 text-gray-500">{row.label}</td>
                  <td className={`py-2 text-right font-semibold ${row.color}`}>{row.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Tóm tắt tài chính</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {[
                { label: 'Doanh thu đơn hàng', value: fmtVnd(stats.totalRevenue) },
                { label: 'Doanh thu gói dịch vụ', value: fmtVnd(stats.totalSubscriptionRevenue) },
                { label: 'Tổng doanh thu', value: fmtVnd(stats.totalRevenue + stats.totalSubscriptionRevenue) },
                { label: 'Gói đang hoạt động', value: stats.activeSubscriptions.toLocaleString() },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2 text-gray-500">{row.label}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
