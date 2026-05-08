'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/app/components/AppShell'
import Header from '@/app/components/Header'
import { AuthService } from '@/lib/api/auth.service'
import { quoteService, type Quote, type QuoteWithRevisions } from '@/lib/api/quote.service'
import { orderService } from '@/lib/api/order.service'
import { PostService } from '@/lib/api/post.service'

type QuoteWithPost = {
  quote: Quote
  post: any | null
}

export default function GioHangNhanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [receivedQuotes, setReceivedQuotes] = useState<QuoteWithPost[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_chat'>('all')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [selectedRevisions, setSelectedRevisions] = useState<QuoteWithRevisions['revisions']>([])
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const formatDateTime = (isoDate?: string) => {
    if (!isoDate) return 'Không rõ thời gian'
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return 'Không rõ thời gian'
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ phản hồi'
      case 'ACCEPTED':
        return 'Đã chấp nhận'
      case 'IN_CHAT':
        return 'Đang trao đổi'
      case 'REJECTED':
        return 'Đã từ chối'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const getStatusClassName = (status: Quote['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700'
      case 'IN_CHAT':
        return 'bg-blue-100 text-blue-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const loadReceivedQuotes = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Lấy danh sách bài đăng của tôi (customer)
      const myPostsResponse: any = await PostService.getMyPosts({ limit: 100 })
      const myPosts = Array.isArray(myPostsResponse) ? myPostsResponse : myPostsResponse?.data || []

      if (myPosts.length === 0) {
        setReceivedQuotes([])
        return
      }

      // Lấy chào giá cho từng bài đăng
      const allQuotesMap = new Map<string, Quote[]>()
      
      for (const post of myPosts) {
        try {
          const quotes = await quoteService.getQuotesByPostId(post.id)
          if (quotes.length > 0) {
            allQuotesMap.set(post.id, quotes)
          }
        } catch (err) {
          console.warn(`Lỗi khi lấy chào giá cho bài ${post.id}:`, err)
        }
      }

      // Gộp tất cả chào giá
      const items: QuoteWithPost[] = []
      for (const [postId, quotes] of allQuotesMap.entries()) {
        const post = myPosts.find(p => p.id === postId)
        for (const quote of quotes) {
          items.push({ quote, post })
        }
      }

      // Sort by updated date (mới nhất đến cũ nhất)
      items.sort((a, b) =>
        new Date(b.quote.updatedAt || b.quote.createdAt).getTime() -
        new Date(a.quote.updatedAt || a.quote.createdAt).getTime()
      )

      setReceivedQuotes(items)
    } catch (err: any) {
      console.error('Lỗi tải chào giá nhận được:', err)
      setError(err?.message || 'Không thể tải chào giá')
      setReceivedQuotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewQuoteDetail = async (quoteId: string) => {
    try {
      setLoadingDetailId(quoteId)
      const detail = await quoteService.getQuoteById(quoteId)
      setSelectedQuote(detail)
      setSelectedRevisions([])
    } catch (err: any) {
      alert(err?.message || 'Không thể tải chi tiết báo giá')
    } finally {
      setLoadingDetailId(null)
    }
  }

  const handleViewQuoteRevisions = async (quoteId: string) => {
    try {
      setLoadingDetailId(quoteId)
      const detail = await quoteService.getQuoteWithRevisions(quoteId)
      setSelectedQuote(detail)
      setSelectedRevisions(detail.revisions || [])
    } catch (err: any) {
      alert(err?.message || 'Không thể tải lịch sử chào giá')
    } finally {
      setLoadingDetailId(null)
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('Tạo đơn hàng từ báo giá này?')) return

    try {
      setActionLoadingId(quoteId)
      const order = await orderService.confirmFromQuote(quoteId)
      alert(`✅ Đã tạo đơn hàng #${order.orderNumber}. Đợi thợ xác nhận!`)
      await loadReceivedQuotes()
    } catch (err: any) {
      alert(err?.message || 'Không thể tạo đơn hàng')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectQuote = async (quoteId: string) => {
    const reason = prompt('Lý do từ chối báo giá (không bắt buộc):')
    if (reason === null) return

    try {
      setActionLoadingId(quoteId)
      await quoteService.rejectQuote(quoteId, reason || undefined)
      alert('✅ Đã từ chối báo giá')
      await loadReceivedQuotes()
    } catch (err: any) {
      alert(err?.message || 'Không thể từ chối báo giá')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Kiểm tra authentication và load dữ liệu
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/dang-nhap')
      return
    }

    loadReceivedQuotes()
  }, [router])

  const filteredQuotes = receivedQuotes.filter(item => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return item.quote.status === 'PENDING'
    if (activeTab === 'in_chat') return item.quote.status === 'IN_CHAT'
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chào giá...</p>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-surface-lowest">
        <Header />
        <div className="border-b border-outline-variant/60 bg-surface shadow-app-bar">
          <div className="app-container max-w-5xl py-app-sm">
            <h1 className="text-xl font-bold text-foreground">💰 Chào giá từ thợ nhân công</h1>
          </div>
        </div>

        <div className="app-container max-w-5xl py-app-lg">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex gap-2 border-b border-slate-200 mb-4">
              {[
                { id: 'all' as const, label: '📋 Tất cả', count: receivedQuotes.length },
                { id: 'pending' as const, label: '⏳ Chờ phản hồi', count: receivedQuotes.filter(q => q.quote.status === 'PENDING').length },
                { id: 'in_chat' as const, label: '💬 Đang trao đổi', count: receivedQuotes.filter(q => q.quote.status === 'IN_CHAT').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {selectedQuote && (
            <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-teal-900">Chi tiết báo giá</h3>
                  <p className="text-sm text-teal-700 mt-1">Giá: {Number(selectedQuote.price || 0).toLocaleString('vi-VN')}₫</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedQuote(null)
                    setSelectedRevisions([])
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white text-teal-700 border border-teal-200 hover:bg-teal-100"
                >
                  Đóng
                </button>
              </div>

              <div className="bg-white rounded-lg p-3 text-sm text-slate-700 mb-4">
                {selectedQuote.description || 'Không có mô tả'}
              </div>

              {selectedRevisions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-teal-900 mb-2">Lịch sử chỉnh sửa ({selectedRevisions.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedRevisions.map((revision) => (
                      <div key={revision.id} className="bg-white rounded-lg p-3 text-sm border border-teal-100">
                        <div className="font-medium text-slate-800">{Number(revision.price || 0).toLocaleString('vi-VN')}₫</div>
                        <div className="text-slate-600 mt-1 text-xs">{revision.description || 'Không có mô tả'}</div>
                        <div className="text-xs text-slate-400 mt-1">{formatDateTime(revision.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-slate-700 mb-2">
                {activeTab === 'all' && 'Chưa có chào giá nào'}
                {activeTab === 'pending' && 'Không có chào giá chờ phản hồi'}
                {activeTab === 'in_chat' && 'Không có chào giá đang trao đổi'}
              </h2>
              <p className="text-slate-500 mb-6">Các chào giá sẽ xuất hiện ở đây khi thợ nhân công gửi.</p>
              <Link
                href="/home"
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
              >
                Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map(({ quote, post }) => {
                const postTitle = post?.title || `Bài đăng #${quote.postId.slice(0, 8)}`
                return (
                  <div key={quote.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{postTitle}</h3>
                        <p className="text-sm text-slate-500 mt-1">Từ: <span className="font-medium">{quote.providerName || 'Thợ'}</span></p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClassName(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 mb-4 line-clamp-2">{quote.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                        <div className="text-slate-500 text-xs">Giá báo giá</div>
                        <div className="text-lg font-bold text-teal-600 mt-1">
                          {Number(quote.price || 0).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                        <div className="text-slate-500 text-xs">Thời gian dự kiến</div>
                        <div className="font-medium text-slate-800 mt-1">
                          {quote.estimatedDuration ? `${quote.estimatedDuration}m` : 'N/A'}
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                        <div className="text-slate-500 text-xs">Ngày gửi</div>
                        <div className="font-medium text-slate-800 mt-1 text-xs">{formatDateTime(quote.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewQuoteDetail(quote.id)}
                        disabled={loadingDetailId === quote.id}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-sm font-medium disabled:opacity-60"
                      >
                        {loadingDetailId === quote.id ? '⏳' : '👁️'} Chi tiết
                      </button>

                      <button
                        onClick={() => handleViewQuoteRevisions(quote.id)}
                        disabled={loadingDetailId === quote.id}
                        className="px-3 py-2 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 transition text-sm font-medium disabled:opacity-60"
                      >
                        {loadingDetailId === quote.id ? '⏳' : '📋'} Lịch sử
                      </button>

                      <Link
                        href={`/posts/${quote.postId}`}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-sm font-medium"
                      >
                        📄 Xem bài
                      </Link>

                      {quote.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={actionLoadingId === quote.id}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                          >
                            {actionLoadingId === quote.id ? '⏳' : '✅'} Chấp nhận
                          </button>
                          <button
                            onClick={() => handleRejectQuote(quote.id)}
                            disabled={actionLoadingId === quote.id}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                          >
                            {actionLoadingId === quote.id ? '⏳' : '❌'} Từ chối
                          </button>
                        </>
                      )}

                      {quote.status === 'IN_CHAT' && (
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          disabled={actionLoadingId === quote.id}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                        >
                          {actionLoadingId === quote.id ? '⏳' : '✅'} Tạo đơn
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
