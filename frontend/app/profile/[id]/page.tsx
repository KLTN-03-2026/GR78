'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/app/components/AppShell'
import { ProfileService, PublicProfileResponse } from '@/lib/api/profile-new.service'
import { PostService } from '@/lib/api/post.service'
import { resolveMediaUrl } from '@/lib/media-url'
import { AuthService } from '@/lib/api/auth.service'
import { reportService, UserReportReason, REPORT_REASON_LABELS } from '@/lib/api/report.service'

function ReportModal({
    displayName,
    onClose,
    onSubmit,
}: {
    displayName: string
    onClose: () => void
    onSubmit: (reason: UserReportReason, description: string) => Promise<void>
}) {
    const [reason, setReason] = useState<UserReportReason>(UserReportReason.FRAUD)
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')
        setSubmitting(true)
        try {
            await onSubmit(reason, description)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Báo cáo tài khoản</h2>
                        <p className="text-sm text-gray-500">Báo cáo <strong>{displayName}</strong></p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
                        <p className="font-medium mb-1">⚠️ Lưu ý trước khi báo cáo</p>
                        <p>Báo cáo sai sự thật có thể ảnh hưởng đến tài khoản của bạn. Chỉ báo cáo khi bạn có bằng chứng xác thực.</p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Lý do báo cáo *</label>
                        <div className="space-y-2">
                            {Object.values(UserReportReason).map(r => (
                                <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${reason === r ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={() => setReason(r)}
                                        className="accent-red-500"
                                    />
                                    <span className="text-sm text-gray-800">{REPORT_REASON_LABELS[r]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Mô tả chi tiết <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="Mô tả hành vi vi phạm, cung cấp bằng chứng nếu có..."
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-400 text-right">{description.length}/1000</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting && (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function PublicProfile() {
    const router = useRouter()
    const params = useParams()
    const userId = params.id as string

    const [profile, setProfile] = useState<PublicProfileResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userPosts, setUserPosts] = useState<any[]>([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'about' | 'posts'>('about')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportSuccess, setReportSuccess] = useState(false)

    useEffect(() => {
        setIsLoggedIn(Boolean(AuthService.getToken()))
    }, [])

    useEffect(() => {
        if (userId) {
            loadPublicProfile()
        }
    }, [userId])

    const loadPublicProfile = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await ProfileService.getPublicProfile(userId)
            setProfile(data)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể tải hồ sơ'
            console.error('Error loading profile:', err)
            if (errorMsg.includes('Invalid UUID')) {
                setError('❌ Định dạng ID người dùng không hợp lệ')
            } else if (errorMsg.includes('notfound') || errorMsg.includes('inactive')) {
                setError('❌ Không tìm thấy người dùng hoặc tài khoản đã ngừng hoạt động')
            } else {
                setError(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    const loadUserPosts = async () => {
        try {
            setPostsLoading(true)
            const response = await PostService.getFeed({ limit: 50 })
            setUserPosts(response.data || [])
        } catch (err) {
            console.error('Error loading posts:', err)
        } finally {
            setPostsLoading(false)
        }
    }

    const handleReport = async (reason: UserReportReason, description: string) => {
        await reportService.reportUser(userId, reason, description || undefined)
        setShowReportModal(false)
        setReportSuccess(true)
        setTimeout(() => setReportSuccess(false), 5000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải hồ sơ...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-sm max-w-md w-full text-center">
                    <p className="text-red-600 mb-4">{error || 'Không tìm thấy người dùng'}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-brand text-white px-6 py-2 rounded hover:opacity-90"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <AppShell>
            <div className="flex min-h-screen flex-col bg-surface-lowest">
                <div className="flex-1">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="text-brand hover:opacity-80 mb-4 flex items-center gap-1 text-sm font-medium"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại
                        </button>

                        {/* Report success toast */}
                        {reportSuccess && (
                            <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-800 font-medium">Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét trong thời gian sớm nhất.</p>
                            </div>
                        )}

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-app-card p-8 mb-6">
                            <div className="flex flex-col items-center text-center mb-8">
                                {/* Avatar */}
                                {resolveMediaUrl(profile.avatarUrl) ? (
                                    <img
                                        src={resolveMediaUrl(profile.avatarUrl)}
                                        alt="Ảnh đại diện"
                                        className="w-28 h-28 rounded-full object-cover border-4 border-brand mb-5 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-4xl font-bold mb-5 shadow-lg">
                                        {(profile.displayName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Display Name with Verification Badge */}
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h2 className="text-3xl font-bold text-gray-900">{profile.displayName || 'Người dùng'}</h2>
                                    {profile.isVerified && (
                                        <span className="flex items-center gap-1 bg-brand/10 text-brand-dark px-3 py-1 rounded-full text-xs font-semibold">
                                            ✅ Đã xác thực
                                        </span>
                                    )}
                                </div>

                                {/* Role Badge */}
                                {profile.role && (
                                    <div className={`px-4 py-1.5 rounded-full font-semibold text-sm mb-4 ${
                                        profile.role === 'provider'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-brand/10 text-brand-dark'
                                    }`}>
                                        {profile.role === 'provider' ? '🔧 Nhà cung cấp dịch vụ' : '👤 Khách hàng'}
                                    </div>
                                )}

                                {/* Bio */}
                                {profile.bio && (
                                    <p className="text-gray-600 text-base max-w-2xl mb-3">{profile.bio}</p>
                                )}

                                {/* Member Since */}
                                {profile.memberSince && (
                                    <p className="text-sm text-gray-400">
                                        Thành viên từ {new Date(profile.memberSince).toLocaleDateString('vi-VN', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>
                                )}
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                <div className="bg-brand/5 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">ID người dùng</p>
                                    <p className="text-gray-800 font-mono text-sm break-all">{profile.id}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Trạng thái tài khoản</p>
                                    <p className="text-green-700 font-semibold text-sm">🟢 Đang hoạt động</p>
                                </div>
                                {profile.role && (
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                                        <p className="text-gray-800 font-semibold text-sm">
                                            {profile.role === 'provider' ? 'Nhà cung cấp dịch vụ' : 'Khách hàng'}
                                        </p>
                                    </div>
                                )}
                                <div className={`${profile.isVerified ? 'bg-brand/5' : 'bg-gray-50'} rounded-xl p-4`}>
                                    <p className="text-xs text-gray-500 mb-1">Trạng thái xác thực</p>
                                    <p className="text-gray-800 font-semibold text-sm">
                                        {profile.isVerified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
                                    </p>
                                </div>
                            </div>

                            {/* Report Button — only shown to logged-in users viewing someone else's profile */}
                            {isLoggedIn && (
                                <div className="mt-5 pt-5 border-t flex justify-end">
                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                        </svg>
                                        Báo cáo tài khoản
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl shadow-app-card mb-5">
                            <div className="flex border-b">
                                {[
                                    { key: 'about', label: '📋 Giới thiệu' },
                                    { key: 'posts', label: '📝 Bài đăng' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key as any)
                                            if (tab.key === 'posts' && userPosts.length === 0) {
                                                loadUserPosts()
                                            }
                                        }}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                                            activeTab === tab.key
                                                ? 'text-brand-dark border-b-2 border-brand'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-2xl shadow-app-card p-6">
                            {/* About Tab */}
                            {activeTab === 'about' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hồ sơ</h3>
                                        <div className="space-y-4">
                                            {profile.displayName && (
                                                <div className="flex gap-4">
                                                    <span className="font-semibold text-gray-500 min-w-32 text-sm">Tên hiển thị:</span>
                                                    <span className="text-gray-800 text-sm">{profile.displayName}</span>
                                                </div>
                                            )}
                                            {profile.role && (
                                                <div className="flex gap-4">
                                                    <span className="font-semibold text-gray-500 min-w-32 text-sm">Vai trò:</span>
                                                    <span className="text-gray-800 text-sm">
                                                        {profile.role === 'provider' ? 'Nhà cung cấp dịch vụ' : 'Khách hàng'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                <span className="font-semibold text-gray-500 min-w-32 text-sm">Xác thực:</span>
                                                <span className={`text-sm ${profile.isVerified ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                                                    {profile.isVerified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
                                                </span>
                                            </div>
                                            {profile.memberSince && (
                                                <div className="flex gap-4">
                                                    <span className="font-semibold text-gray-500 min-w-32 text-sm">Tham gia từ:</span>
                                                    <span className="text-gray-800 text-sm">
                                                        {new Date(profile.memberSince).toLocaleDateString('vi-VN', {
                                                            year: 'numeric', month: 'long', day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {profile.bio && (
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Giới thiệu</h3>
                                            <p className="text-gray-700 leading-relaxed text-sm">{profile.bio}</p>
                                        </div>
                                    )}

                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết tài khoản</h3>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1">ID người dùng</p>
                                            <p className="text-gray-800 font-mono text-sm break-all">{profile.id}</p>
                                        </div>
                                    </div>

                                    {profile.role === 'provider' && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                                            <h4 className="font-semibold text-purple-900 mb-2">🔧 Nhà cung cấp dịch vụ</h4>
                                            <p className="text-sm text-purple-800 mb-3">
                                                Người dùng này cung cấp dịch vụ chuyên nghiệp. Gửi yêu cầu riêng để được báo giá nhanh chóng.
                                            </p>
                                            <button
                                                onClick={() =>
                                                    isLoggedIn
                                                        ? router.push(`/yeu-cau-rieng/gui/${profile.id}`)
                                                        : router.push(`/dang-nhap?redirect=/yeu-cau-rieng/gui/${profile.id}`)
                                                }
                                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                                            >
                                                ✉️ Gửi yêu cầu riêng tới thợ này
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Posts Tab */}
                            {activeTab === 'posts' && (
                                <div className="space-y-4">
                                    {postsLoading && (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-2"></div>
                                            <p className="text-gray-500 text-sm">Đang tải bài đăng...</p>
                                        </div>
                                    )}
                                    {!postsLoading && userPosts.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400 text-sm">Chưa có bài đăng nào</p>
                                        </div>
                                    )}
                                    {userPosts.length > 0 && (
                                        <div className="space-y-4">
                                            {userPosts.map(post => (
                                                <div
                                                    key={post.id}
                                                    onClick={() => router.push(`/posts/${post.id}`)}
                                                    className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-white"
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-800 mb-2">{post.title}</h4>
                                                            <p className="text-gray-500 text-sm mb-3">{post.description?.substring(0, 150)}...</p>
                                                            <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
                                                                {post.location && <span>📍 {post.location}</span>}
                                                                {post.budget && <span>💰 {post.budget.toLocaleString('vi-VN')} VND</span>}
                                                                <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                                            post.status === 'open' ? 'bg-green-100 text-green-700'
                                                            : post.status === 'closed' ? 'bg-red-100 text-red-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {post.status === 'open' ? '✅ Đang mở' : post.status === 'closed' ? '❌ Đã đóng' : post.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Contact Section */}
                        <div className="mt-6 mb-8 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 to-cyan-50 p-6 text-center">
                            <h3 className="font-semibold text-gray-900 mb-3">Bạn quan tâm đến dịch vụ của người dùng này?</h3>
                            {profile.role === 'provider' ? (
                                <>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Gửi yêu cầu trực tiếp tới <strong>{profile.displayName || 'thợ này'}</strong> — họ sẽ xem xét và phản hồi kèm báo giá.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        {isLoggedIn ? (
                                            <button
                                                onClick={() => router.push(`/yeu-cau-rieng/gui/${profile.id}`)}
                                                className="bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 font-semibold text-sm transition-opacity"
                                            >
                                                ✉️ Gửi yêu cầu riêng
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/dang-nhap?redirect=/yeu-cau-rieng/gui/${profile.id}`)}
                                                className="bg-brand text-white px-6 py-2.5 rounded-xl hover:opacity-90 font-semibold text-sm transition-opacity"
                                            >
                                                ✉️ Đăng nhập để gửi yêu cầu
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push('/posts/create')}
                                            className="border border-brand text-brand-dark px-6 py-2.5 rounded-xl hover:bg-brand/5 font-semibold text-sm transition-colors"
                                        >
                                            📝 Đăng yêu cầu công khai
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-600 text-sm mb-4">Bạn có thể xem bài đăng và liên hệ trực tiếp.</p>
                                    <button
                                        onClick={() => router.push('/posts/create')}
                                        className="bg-brand text-white px-6 py-2 rounded-xl hover:opacity-90 font-semibold text-sm"
                                    >
                                        📝 Tạo yêu cầu dịch vụ
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    displayName={profile.displayName || 'người dùng này'}
                    onClose={() => setShowReportModal(false)}
                    onSubmit={handleReport}
                />
            )}
        </AppShell>
    )
}
