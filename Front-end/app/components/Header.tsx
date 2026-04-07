'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/api/auth.service'
import { notificationService } from '@/lib/api/notification.service'
import { chatService } from '@/lib/api/chat.service'
import ThoTotLogo from '@/app/components/ThoTotLogo'

interface HeaderProps {
    currentUser?: any
}

export default function Header({ currentUser: initialUser }: HeaderProps) {
    const [currentUser, setCurrentUser] = useState<any>(initialUser)
    const [avatarError, setAvatarError] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showMessageMenu, setShowMessageMenu] = useState(false)
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
    const [unreadMessageCount, setUnreadMessageCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const accountType = String(currentUser?.accountType || currentUser?.role || '').toUpperCase()
    const isWorker = accountType === 'WORKER' || accountType === 'PROVIDER'

    const quickAccessPath = isWorker ? '/gio-hang' : '/bai-dang-cua-toi'
    const schedulePath = '/don-hang'

    const navButtonClass = (targetPath: string) => {
        const isActive = pathname === targetPath
        return `p-2.5 rounded-xl transition ${isActive
            ? 'text-cyan-700 bg-cyan-100 ring-1 ring-cyan-200'
            : 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
            }`
    }

    const normalizeImageUrl = (rawUrl?: string | null) => {
        if (!rawUrl) return ''
        const cleanUrl = rawUrl.trim()
        if (!cleanUrl) return ''

        if (/^https?:\/\//i.test(cleanUrl) || cleanUrl.startsWith('data:')) {
            return cleanUrl
        }

        const apiDomain = (process.env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1\/?$/, '')
        if (!apiDomain) return cleanUrl

        if (cleanUrl.startsWith('/')) {
            return `${apiDomain}${cleanUrl}`
        }

        return `${apiDomain}/${cleanUrl}`
    }

    const mapUserWithAvatar = (rawUser: any) => {
        if (!rawUser) return null
        const resolvedAvatar = normalizeImageUrl(rawUser.avatarUrl || rawUser.avatar)
        return {
            ...rawUser,
            avatar: resolvedAvatar,
            avatarUrl: resolvedAvatar,
        }
    }

    // Load user info if not provided
    useEffect(() => {
        if (!currentUser) {
            const loadUser = async () => {
                try {
                    const token = AuthService.getToken()
                    if (!token) return

                    const response = await fetch('/api/profile/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setAvatarError(false)
                        setCurrentUser(mapUserWithAvatar(data.data || data))
                    }
                } catch (error) {
                    console.error('Failed to load user:', error)
                }
            }
            loadUser()
        }
    }, [currentUser])

    useEffect(() => {
        if (initialUser) {
            setAvatarError(false)
            setCurrentUser(mapUserWithAvatar(initialUser))
        }
    }, [initialUser])

    // Load unread counts
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const notifCount = await notificationService.getUnreadCount()
                setUnreadNotificationCount(notifCount)

                const msgCount = await chatService.getUnreadCount()
                setUnreadMessageCount(msgCount.unreadCount || 0)
            } catch (error) {
                console.error('Failed to load counts:', error)
            }
        }

        loadCounts()
        const interval = setInterval(loadCounts, 30000)
        return () => clearInterval(interval)
    }, [])

    // Handle search
    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setShowSearchResults(false)
            setSearchResults([])
            return
        }

        try {
            setSearchLoading(true)
            setShowSearchResults(true)
            const results = await fetch(`/api/profile/search?keyword=${encodeURIComponent(query)}`)
            const data = await results.json()
            setSearchResults(data.data || [])
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.search-container')) {
                setShowSearchResults(false)
            }
            if (!target.closest('.message-menu')) {
                setShowMessageMenu(false)
            }
            if (!target.closest('.profile-menu')) {
                setShowProfileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="sticky top-0 z-40 px-4 py-2 border-b border-cyan-200/80 bg-gradient-to-r from-cyan-50/90 via-sky-50/85 to-cyan-100/75 backdrop-blur-xl shadow-[0_8px_24px_rgba(14,165,183,0.12)]">
            <div className="flex items-center gap-3">
                {/* Left: Logo and Search Container */}
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => router.push('/home')}
                            className="hover:opacity-80 transition"
                        >
                            <ThoTotLogo className="w-20" />
                        </button>
                    </div>

                    {/* Search Container */}
                    <div className="relative search-container w-96">
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Tìm kiếm thợ, dịch vụ..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-cyan-100 rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 transition"
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 border border-cyan-100 rounded-xl shadow-xl shadow-cyan-900/10 max-h-96 overflow-y-auto z-50 backdrop-blur-sm">
                                {searchLoading ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                                        <p className="mt-2">Đang tìm kiếm...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {searchResults.map((profile) => (
                                            <button
                                                key={profile.id}
                                                onClick={() => {
                                                    router.push(`/profile?userId=${profile.id}`)
                                                    setShowSearchResults(false)
                                                    setSearchQuery('')
                                                }}
                                                className="w-full p-3 hover:bg-cyan-50/60 flex items-center space-x-3 text-left transition"
                                            >
                                                <div className="flex-shrink-0">
                                                    {profile.avatar ? (
                                                        <img
                                                            src={profile.avatar}
                                                            alt={profile.displayName || profile.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                                            {(profile.displayName || profile.fullName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {profile.displayName || profile.fullName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {profile.role === 'provider' ? 'Nhà cung cấp' : 'Khách hàng'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Không tìm thấy kết quả
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Navigation Icons */}
                <div className="flex items-center justify-center gap-8 flex-1">
                    {/* Home */}
                    <Link
                        href="/home"
                        className={navButtonClass('/home')}
                        title="Trang chủ"
                        aria-label="Trang chủ"
                    >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                    </Link>

                    {/* Quick Access */}
                    <Link
                        href={quickAccessPath}
                        className={navButtonClass(quickAccessPath)}
                        title={isWorker ? 'Chào giá của tôi' : 'Bài đăng của tôi'}
                        aria-label={isWorker ? 'Chào giá của tôi' : 'Bài đăng của tôi'}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </Link>

                    {/* Orders & Schedule */}
                    <Link
                        href={schedulePath}
                        className={navButtonClass(schedulePath)}
                        title="Đơn hàng"
                        aria-label="Đơn hàng"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </Link>
                </div>

                {/* Right: Header Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Notifications */}
                    <Link
                        href="/thong-bao"
                        className="relative p-2.5 text-slate-600 hover:bg-cyan-50 rounded-xl transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadNotificationCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full shadow-sm">
                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                            </span>
                        )}
                    </Link>

                    {/* Messages */}
                    <div className="relative message-menu">
                        <button
                            onClick={() => setShowMessageMenu(!showMessageMenu)}
                            className="relative p-2.5 text-slate-600 hover:bg-cyan-50 rounded-xl transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadMessageCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-rose-500 to-orange-400 rounded-full shadow-sm">
                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                </span>
                            )}
                        </button>
                        {showMessageMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white/95 rounded-xl shadow-xl shadow-cyan-900/10 border border-cyan-100 p-2 z-50 backdrop-blur-sm">
                                <Link href="/tin-nhan" className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 rounded-lg transition" onClick={() => setShowMessageMenu(false)}>
                                    Xem tin nhắn
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Profile Menu */}
                    <div className="relative profile-menu">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-1.5 hover:bg-cyan-50 rounded-xl transition"
                        >
                            {(currentUser?.avatarUrl || currentUser?.avatar) && !avatarError ? (
                                <img
                                    src={currentUser.avatarUrl || currentUser.avatar}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {(currentUser?.displayName || currentUser?.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <svg className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white/95 rounded-xl shadow-xl shadow-cyan-900/10 border border-cyan-100 py-2 z-50 backdrop-blur-sm">
                                <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 transition" onClick={() => setShowProfileMenu(false)}>
                                    👤 Trang cá nhân
                                </Link>
                                <Link href="/bai-dang-cua-toi" className="block px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 transition" onClick={() => setShowProfileMenu(false)}>
                                    📝 Bài đăng của tôi
                                </Link>
                                <Link href="/da-luu" className="block px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50 transition" onClick={() => setShowProfileMenu(false)}>
                                    💾 Đã lưu
                                </Link>
                                <hr className="my-2" />
                                <button
                                    onClick={async () => {
                                        await AuthService.logout()
                                        router.push('/dang-nhap')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                                >
                                    🚪 Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
