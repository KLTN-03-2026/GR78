'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminService, ViolationReport, UserReportStatus } from '@/lib/api/admin.service'
import PageHeader from '@/components/PageHeader'

interface ReportConfig {
  key: 'orders' | 'quotes' | 'users' | 'revenue' | 'violations'
  title: string
  description: string
  color: string
  icon: React.ReactNode
  download: (params: { from?: string; to?: string }) => Promise<void>
}

const REASON_LABELS: Record<string, string> = {
  fraud: 'Gian lận / Lừa đảo',
  unreliable: 'Không đáng tin cậy',
  inappropriate: 'Hành vi không phù hợp',
  spam: 'Spam',
  harassment: 'Quấy rối',
  fake_account: 'Tài khoản giả mạo',
  other: 'Lý do khác',
}

const STATUS_LABELS: Record<UserReportStatus, string> = {
  pending: 'Chờ xử lý',
  reviewed: 'Đã xem xét',
  dismissed: 'Bác bỏ',
  action_taken: 'Đã xử lý',
}

const STATUS_COLORS: Record<UserReportStatus, string> = {
  pending: 'badge-yellow',
  reviewed: 'badge-blue',
  dismissed: 'badge-gray',
  action_taken: 'badge-green',
}

const reports: ReportConfig[] = [
  {
    key: 'orders',
    title: 'Báo cáo đơn hàng',
    description: 'Xuất tất cả đơn hàng với thông tin đầy đủ: trạng thái, khách hàng, nhà cung cấp, giá trị',
    color: 'bg-blue-50 border-blue-100',
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
    ),
    download: AdminService.downloadOrdersReport,
  },
  {
    key: 'quotes',
    title: 'Báo cáo báo giá',
    description: 'Xuất tất cả báo giá với thông tin nhà cung cấp, trạng thái và giá trị',
    color: 'bg-purple-50 border-purple-100',
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    ),
    download: AdminService.downloadQuotesReport,
  },
  {
    key: 'users',
    title: 'Báo cáo tài khoản',
    description: 'Xuất danh sách tài khoản với thông tin được phép: email, vai trò, trạng thái, điểm đánh giá',
    color: 'bg-green-50 border-green-100',
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    ),
    download: AdminService.downloadUsersReport,
  },
  {
    key: 'revenue',
    title: 'Báo cáo doanh thu',
    description: 'Xuất báo cáo doanh thu theo tháng: đơn hàng, gói dịch vụ và tổng cộng',
    color: 'bg-orange-50 border-orange-100',
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    ),
    download: AdminService.downloadRevenueReport,
  },
  {
    key: 'violations',
    title: 'Báo cáo tài khoản vi phạm',
    description: 'Xuất tất cả báo cáo vi phạm: người tố cáo, người bị tố cáo, lý do và trạng thái xử lý',
    color: 'bg-red-50 border-red-100',
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      </div>
    ),
    download: AdminService.downloadViolationsReport,
  },
]

export default function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  // Violations section
  const [violations, setViolations] = useState<ViolationReport[]>([])
  const [violTotal, setViolTotal] = useState(0)
  const [violPage, setViolPage] = useState(1)
  const [violStatus, setViolStatus] = useState<string>('')
  const [violLoading, setViolLoading] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState<UserReportStatus>('reviewed')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const violLimit = 10

  const fetchViolations = useCallback(async () => {
    setViolLoading(true)
    try {
      const res = await AdminService.listViolationReports({
        page: violPage,
        limit: violLimit,
        status: violStatus || undefined,
      })
      setViolations(res.reports)
      setViolTotal(res.total)
    } catch {}
    finally { setViolLoading(false) }
  }, [violPage, violStatus])

  useEffect(() => { fetchViolations() }, [fetchViolations])

  const handleDownload = async (report: ReportConfig) => {
    setDownloading(report.key)
    try {
      await report.download({ from: from || undefined, to: to || undefined })
      setToast(`Đã tải xuống: ${report.title}`)
      setTimeout(() => setToast(''), 3000)
    } catch (e: any) {
      alert(`Lỗi khi tải báo cáo: ${e.message}`)
    } finally {
      setDownloading(null)
    }
  }

  const handleReview = async () => {
    if (!reviewingId) return
    setReviewLoading(true)
    try {
      const updated = await AdminService.updateViolationStatus(reviewingId, reviewStatus, reviewNotes || undefined)
      setViolations(prev => prev.map(v => v.id === reviewingId ? updated : v))
      setReviewingId(null)
      setReviewNotes('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setReviewLoading(false)
    }
  }

  const violTotalPages = Math.ceil(violTotal / violLimit)

  return (
    <div>
      <PageHeader
        title="Báo cáo hệ thống"
        description="Tải xuống báo cáo CSV và quản lý tố cáo vi phạm"
      />

      {/* Date filter */}
      <div className="mb-6 card p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Phạm vi thời gian (cho CSV)</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Từ ngày</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input w-44" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Đến ngày</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input w-44" />
          </div>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo('') }} className="btn-secondary mt-5">
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Report cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {reports.map(report => (
          <div key={report.key} className={`rounded-xl border p-5 ${report.color}`}>
            <div className="flex items-start gap-4">
              {report.icon}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                {(from || to) && (
                  <p className="mt-1 text-xs text-gray-400">
                    {from && `Từ: ${from}`}{from && to && ' · '}{to && `Đến: ${to}`}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleDownload(report)}
                disabled={downloading === report.key}
                className="btn-primary w-full justify-center"
              >
                {downloading === report.key ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tải xuống...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải xuống CSV
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Violations Management Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Tố cáo tài khoản vi phạm</h2>
            <p className="text-sm text-gray-500">{violTotal.toLocaleString()} báo cáo</p>
          </div>
          <select
            value={violStatus}
            onChange={e => { setViolStatus(e.target.value); setViolPage(1) }}
            className="input w-auto"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="reviewed">Đã xem xét</option>
            <option value="dismissed">Bác bỏ</option>
            <option value="action_taken">Đã xử lý</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Người tố cáo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Người bị tố cáo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lý do</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ngày tố cáo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {violLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>
                    ))}
                  </tr>
                ))
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Không có báo cáo nào</td>
                </tr>
              ) : violations.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{v.reporter.displayName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{v.reporter.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{v.reportedUser.displayName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{v.reportedUser.email ?? ''}</p>
                    {v.reportedUser.isActive === false && (
                      <span className="badge-red mt-0.5 inline-flex">Đã khóa</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{REASON_LABELS[v.reason] ?? v.reason}</p>
                    {v.description && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-48 truncate">{v.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[v.status]}>{STATUS_LABELS[v.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {v.status === 'pending' && (
                      <button
                        onClick={() => { setReviewingId(v.id); setReviewStatus('reviewed'); setReviewNotes('') }}
                        className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                      >
                        Xem xét
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {violTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              {(violPage - 1) * violLimit + 1}–{Math.min(violPage * violLimit, violTotal)} / {violTotal.toLocaleString()}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setViolPage(p => Math.max(1, p - 1))} disabled={violPage === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Trước</button>
              <button onClick={() => setViolPage(p => Math.min(violTotalPages, p + 1))} disabled={violPage === violTotalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Sau →</button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Xem xét báo cáo</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Kết luận xử lý</label>
                <select value={reviewStatus} onChange={e => setReviewStatus(e.target.value as UserReportStatus)} className="input">
                  <option value="reviewed">Đã xem xét (không có hành động)</option>
                  <option value="dismissed">Bác bỏ (báo cáo sai)</option>
                  <option value="action_taken">Đã xử lý (có hành động)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú nội bộ</label>
                <textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Ghi chú về quyết định xử lý..."
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setReviewingId(null)} className="btn-secondary">Hủy</button>
              <button onClick={handleReview} disabled={reviewLoading} className="btn-primary">
                {reviewLoading ? 'Đang lưu...' : 'Xác nhận xử lý'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-4">
        <div className="flex gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-teal-700">
            <p className="font-medium">Lưu ý về báo cáo tài khoản</p>
            <p className="mt-1 text-teal-600">
              Báo cáo tài khoản chỉ xuất các thông tin mà người dùng đồng ý chia sẻ: email, số điện thoại, vai trò, trạng thái hoạt động, điểm đánh giá và số lượt đánh giá. Thông tin nhạy cảm như mật khẩu không được xuất.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-green-100 bg-white px-4 py-3 shadow-lg">
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{toast}</span>
        </div>
      )}
    </div>
  )
}
