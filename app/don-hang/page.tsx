'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import Header from '@/app/components/Header'
import { AuthService } from '@/lib/api/auth.service'
import { orderService, type Order, type OrderStats } from '@/lib/api/order.service'

// Timeline status component
const StatusTimeline = ({ status }: { status: string }) => {
  const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'PROVIDER_COMPLETED', 'COMPLETED']
  const statusIndex = statuses.indexOf(status)
  const statusLabels = ['Chờ', 'Xác nhận', 'Đang làm', 'Xong', 'Hoàn tất']
  
  return (
    <div className="flex items-center gap-2 text-xs">
      {statuses.map((s, idx) => (
        <div key={s} className="flex items-center">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
            ${idx <= statusIndex ? 'bg-teal-500' : 'bg-gray-300'}
          `}>
            ✓
          </div>
          {idx < statuses.length - 1 && (
            <div className={`w-8 h-0.5 ${idx < statusIndex ? 'bg-teal-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function DonHangPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [orderNumberQuery, setOrderNumberQuery] = useState('')
  const [searchingOrder, setSearchingOrder] = useState(false)

  useEffect(() => {
    const token = AuthService.getToken()
    if (!token) {
      router.push('/dang-nhap')
      return
    }

    fetchOrders()
    fetchStats()
  }, [router, activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('📦 [Orders Page] Fetching orders...')

      let statusFilter = ''
      if (activeTab === 'pending') statusFilter = 'PENDING,CONFIRMED,IN_PROGRESS,PROVIDER_COMPLETED'
      else if (activeTab === 'completed') statusFilter = 'COMPLETED'
      else if (activeTab === 'cancelled') statusFilter = 'CANCELLED'

      const response = await orderService.getOrders({
        status: statusFilter || undefined,
        limit: 50
      })
      console.log('✅ [Orders Page] Orders fetched from API:', response)
      setOrders(response.data)
      setError('')
    } catch (err: any) {
      console.error('❌ [Orders Page] Fatal error:', err)
      setError(err.message || 'Không thể tải đơn hàng từ API')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('📊 [Orders Page] Fetching stats...')

      const response = await orderService.getStats()
      console.log('✅ [Orders Page] Stats fetched from API:', response)
      setStats(response)
    } catch (err: any) {
      console.error('❌ [Orders Page] Error fetching stats:', err)
      setStats(null)
    }
  }

  const handleProviderComplete = async (orderId: string) => {
    if (!confirm('Bạn đã hoàn thành công việc này?')) return
    
    try {
      setDetailLoadingId(orderId)
      const result = await orderService.providerComplete(orderId)
      alert(`✅ Xác nhận hoàn thành thành công! Đơn hàng #${result.orderNumber} chờ xác nhận từ khách.`)
      await fetchOrders()
      await fetchStats()
    } catch (err: any) {
      console.error('Error completing order:', err)
      alert(err?.message || '❌ Không thể hoàn thành đơn hàng')
    } finally {
      setDetailLoadingId(null)
    }
  }

  const handleCustomerComplete = async (orderId: string) => {
    const rating = prompt('Đánh giá từ 1-5 sao:')
    if (!rating) return

    const parsedRating = parseInt(rating)
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      alert('❌ Vui lòng nhập số từ 1-5')
      return
    }

    const review = prompt('Nhận xét của bạn:')
    
    try {
      setDetailLoadingId(orderId)
      const result = await orderService.customerComplete(orderId, parsedRating, review || '')
      alert(`✅ Xác nhận hoàn thành thành công! Cảm ơn bạn đã sử dụng dịch vụ.`)
      await fetchOrders()
      await fetchStats()
    } catch (err: any) {
      console.error('Error completing order:', err)
      alert(err?.message || '❌ Không thể hoàn thành đơn hàng')
    } finally {
      setDetailLoadingId(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Lý do hủy đơn:')
    if (!reason) return
    
    try {
      setDetailLoadingId(orderId)
      const result = await orderService.cancelOrder(orderId, reason)
      alert(`✅ Đã hủy đơn hàng #${result.orderNumber} thành công.`)
      await fetchOrders()
      await fetchStats()
    } catch (err: any) {
      console.error('Error canceling order:', err)
      alert(err?.message || '❌ Không thể hủy đơn hàng')
    } finally {
      setDetailLoadingId(null)
    }
  }

  const handleSearchByOrderNumber = async () => {
    const value = orderNumberQuery.trim()
    if (!value) {
      setOrderNumberQuery('')
      await fetchOrders()
      return
    }

    try {
      setSearchingOrder(true)
      setError('')
      const order = await orderService.getOrderByNumber(value)
      if (order) {
        setOrders([order])
      } else {
        setOrders([])
        setError('❌ Không tìm thấy đơn hàng theo mã số')
      }
    } catch (err: any) {
      console.error('Error searching order by number:', err)
      setOrders([])
      setError(err?.message || '❌ Không tìm thấy đơn hàng theo mã số')
    } finally {
      setSearchingOrder(false)
    }
  }

  const handleViewOrderDetail = async (orderId: string) => {
    try {
      setDetailLoadingId(orderId)
      const detail = await orderService.getOrderById(orderId)
      setSelectedOrder(detail)
    } catch (err: any) {
      console.error('Error loading order detail:', err)
      alert(err?.message || '❌ Không thể tải chi tiết đơn hàng')
    } finally {
      setDetailLoadingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'PROVIDER_COMPLETED':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ'
      case 'CONFIRMED':
        return 'Đã xác nhận'
      case 'IN_PROGRESS':
        return 'Đang thực hiện'
      case 'PROVIDER_COMPLETED':
        return 'Thợ đã hoàn thành'
      case 'COMPLETED':
        return 'Hoàn thành'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

  // Modal Component for Order Details
  const OrderDetailModal = () => {
    if (!selectedOrder) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">📦 Chi Tiết Đơn Hàng #{selectedOrder.orderNumber}</h2>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Trạng thái</p>
                <p className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Giá tiền</p>
                <p className="text-lg font-bold text-teal-600">{(selectedOrder.price || 0).toLocaleString('vi-VN')}₫</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Khách hàng</p>
                <p className="font-medium">{selectedOrder.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Thợ nhân công</p>
                <p className="font-medium">{selectedOrder.providerName || 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Mô tả công việc</p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.description || 'N/A'}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Ngày tạo</p>
                <p>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              {selectedOrder.providerCompletedAt && (
                <div>
                  <p className="text-gray-600 font-medium">Thợ hoàn thành lúc</p>
                  <p>{new Date(selectedOrder.providerCompletedAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
              {selectedOrder.customerCompletedAt && (
                <div>
                  <p className="text-gray-600 font-medium">Khách xác nhận lúc</p>
                  <p>{new Date(selectedOrder.customerCompletedAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">Tiến độ</p>
              <StatusTimeline status={selectedOrder.status} />
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50 flex gap-2">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
        <Header />
        
        <OrderDetailModal />
        
        {/* Header Section */}
        <div className="border-b bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">📦 Quản Lý Đơn Hàng</h1>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                🔄 Làm mới
              </button>
            </div>

            {/* Stats Dashboard */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">TỔNG ĐƠN</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <p className="text-xs text-yellow-600 font-medium mb-1">ĐANG CHỜ</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">ĐANG LÀM</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.inProgress}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">HOÀN THÀNH</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-600 font-medium mb-1">ĐÃ HỦY</p>
                  <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={orderNumberQuery}
                onChange={(e) => setOrderNumberQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchByOrderNumber()}
                placeholder="🔍 Tìm theo mã đơn hàng (vd: DH123456)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleSearchByOrderNumber}
                disabled={searchingOrder}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 font-medium"
              >
                {searchingOrder ? '⏳ Tìm...' : '🔍 Tra'}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              {[
                { id: 'all' as const, label: '📋 Tất cả đơn', count: orders.length },
                { id: 'pending' as const, label: '⏳ Đang xử lý', count: orders.filter(o => ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'PROVIDER_COMPLETED'].includes(o.status)).length },
                { id: 'completed' as const, label: '✅ Hoàn thành', count: orders.filter(o => o.status === 'COMPLETED').length },
                { id: 'cancelled' as const, label: '❌ Đã hủy', count: orders.filter(o => o.status === 'CANCELLED').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
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
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-700 font-medium">❌ {error}</p>
              </div>
            )}

            {loading && orders.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có đơn hàng</h3>
                <p className="text-gray-600">Các đơn hàng của bạn sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Top Row: Order Number, Status, Price */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full font-bold text-sm">
                              #{order.orderNumber}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium max-w-md line-clamp-1">{order.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-teal-600">
                            {(order.price || 0).toLocaleString('vi-VN')}₫
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <StatusTimeline status={order.status} />
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-3 gap-3 text-sm mb-4 py-3 border-y border-gray-200">
                        <div>
                          <p className="text-gray-500 text-xs font-medium mb-1">👤 Khách</p>
                          <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium mb-1">🔧 Thợ</p>
                          <p className="font-medium text-gray-900">{order.providerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium mb-1">📍 Địa chỉ</p>
                          <p className="font-medium text-gray-900 text-xs truncate">{order.description || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrderDetail(order.id)}
                          disabled={detailLoadingId === order.id}
                          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          {detailLoadingId === order.id ? '⏳' : '👁️'} Chi tiết
                        </button>

                        {(order.status === 'CONFIRMED' || order.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleProviderComplete(order.id)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ✅ Hoàn thành
                          </button>
                        )}

                        {order.status === 'PROVIDER_COMPLETED' && (
                          <button
                            onClick={() => handleCustomerComplete(order.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ⭐ Xác nhận
                          </button>
                        )}

                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            ❌ Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
