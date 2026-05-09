'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import Header from '@/app/components/Header'
import { AuthService } from '@/lib/api/auth.service'
import { ProfileService, type PublicProfileResponse } from '@/lib/api/profile-new.service'
import { customRequestService } from '@/lib/api/custom-request.service'
import { resolveMediaUrl } from '@/lib/media-url'

export default function SendCustomRequestPage() {
  const router = useRouter()
  const params = useParams()
  const providerId = params.providerId as string

  const [provider, setProvider] = useState<PublicProfileResponse | null>(null)
  const [loadingProvider, setLoadingProvider] = useState(true)
  const [providerError, setProviderError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [desiredTime, setDesiredTime] = useState('')
  const [budget, setBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!AuthService.getToken()) {
      router.replace('/dang-nhap')
      return
    }
    loadProvider()
  }, [providerId])

  const loadProvider = async () => {
    try {
      setLoadingProvider(true)
      setProviderError('')
      const data = await ProfileService.getPublicProfile(providerId)
      if (data.role !== 'provider') {
        setProviderError('Người dùng này không phải là thợ/nhà cung cấp dịch vụ.')
        return
      }
      setProvider(data)
    } catch (err) {
      setProviderError(err instanceof Error ? err.message : 'Không thể tải thông tin thợ')
    } finally {
      setLoadingProvider(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề yêu cầu.')
      return
    }
    if (!description.trim()) {
      setFormError('Vui lòng nhập mô tả chi tiết công việc.')
      return
    }

    const parsedBudget = budget ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined
    if (budget && (isNaN(parsedBudget!) || parsedBudget! <= 0)) {
      setFormError('Ngân sách không hợp lệ.')
      return
    }

    try {
      setSubmitting(true)
      await customRequestService.create({
        providerId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        desiredTime: desiredTime || undefined,
        budget: parsedBudget,
      })
      router.push('/yeu-cau-rieng?sent=1')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProvider) {
    return (
      <AppShell>
        <div className="min-h-screen bg-surface-lowest flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin thợ...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (providerError || !provider) {
    return (
      <AppShell>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-red-600 mb-4">{providerError || 'Không tìm thấy thợ'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </AppShell>
    )
  }

  const providerName = provider.displayName || 'Thợ'
  const avatarUrl = resolveMediaUrl(provider.avatarUrl)

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col bg-surface-lowest">
        <Header />

        <div className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-1"
            >
              ← Quay lại
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gửi yêu cầu riêng</h1>

            {/* Provider info card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={providerName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xl font-bold">
                    {providerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{providerName}</p>
                  {provider.isVerified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-600 font-medium">Nhà cung cấp dịch vụ</p>
                {provider.bio && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{provider.bio}</p>
                )}
              </div>
              <button
                onClick={() => router.push(`/profile/${providerId}`)}
                className="flex-shrink-0 text-xs text-blue-600 hover:underline"
              >
                Xem hồ sơ
              </button>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
              <strong>Lưu ý:</strong> Yêu cầu riêng sẽ chỉ được gửi tới{' '}
              <strong>{providerName}</strong>. Thợ sẽ xem xét và phản hồi kèm báo giá trong thời gian sớm nhất.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Tiêu đề yêu cầu <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                  placeholder="Ví dụ: Cần sửa điện nước tại nhà, thay vòi nước bếp..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/255</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Mô tả chi tiết công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  placeholder="Mô tả cụ thể công việc cần làm, tình trạng hiện tại, yêu cầu đặc biệt (nếu có)..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{description.length}/2000</p>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Địa điểm thực hiện
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={255}
                  placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1, TP.HCM"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Desired time & Budget row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="desiredTime" className="block text-sm font-medium text-gray-800 mb-1.5">
                    Thời gian mong muốn
                  </label>
                  <input
                    id="desiredTime"
                    type="datetime-local"
                    value={desiredTime}
                    onChange={(e) => setDesiredTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-800 mb-1.5">
                    Ngân sách dự kiến (VNĐ)
                  </label>
                  <input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min={0}
                    step={1000}
                    placeholder="500000"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {budget && !isNaN(parseFloat(budget)) ? (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {parseFloat(budget).toLocaleString('vi-VN')} VNĐ — thợ sẽ báo giá không vượt 150% con số này
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Để trống nếu bạn chưa có ngân sách cụ thể</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
