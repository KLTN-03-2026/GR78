'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminService, AdminUser } from '@/lib/api/admin.service'
import PageHeader from '@/components/PageHeader'
import Image from 'next/image'

const ROLE_LABELS: Record<string, string> = {
  customer: 'Khách hàng',
  provider: 'Nhà cung cấp',
  admin: 'Quản trị',
}

const ROLE_COLORS: Record<string, string> = {
  customer: 'badge-blue',
  provider: 'badge-purple',
  admin: 'badge-green',
}

function Avatar({ user }: { user: AdminUser }) {
  const initials = (user.displayName ?? user.email ?? '?').slice(0, 1).toUpperCase()
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.displayName ?? ''}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
      {initials}
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const limit = 15

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await AdminService.listUsers({
        page,
        limit,
        role: roleFilter || undefined,
        search: search || undefined,
        isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      })
      setUsers(res.users)
      setTotal(res.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, activeFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleBlock = async (user: AdminUser) => {
    setActionLoading(user.id)
    try {
      const updated = user.isActive
        ? await AdminService.blockUser(user.id)
        : await AdminService.unblockUser(user.id)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <PageHeader
        title="Quản lý tài khoản"
        description={`${total.toLocaleString()} tài khoản trong hệ thống`}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo email, SĐT, tên..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="input w-auto"
        >
          <option value="">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="provider">Nhà cung cấp</option>
          <option value="admin">Quản trị</option>
        </select>

        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
          {(['all', 'active', 'blocked'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setActiveFilter(v); setPage(1) }}
              className={`px-3 py-2 text-sm transition-colors ${activeFilter === v ? 'bg-teal-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {v === 'all' ? 'Tất cả' : v === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error && <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tài khoản</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Liên hệ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Đánh giá</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ngày tạo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName ?? user.fullName ?? '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{user.email ?? '—'}</p>
                      <p className="text-xs text-gray-400">{user.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={ROLE_COLORS[user.role] ?? 'badge-gray'}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={user.isActive ? 'badge-green' : 'badge-red'}>
                          {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                        {user.isVerified && (
                          <span className="badge badge-blue">Đã xác thực</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'provider' && user.averageRating != null ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {Number(user.averageRating).toFixed(1)}
                          <span className="text-xs text-gray-400">({user.reviewCount})</span>
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlock(user)}
                          disabled={actionLoading === user.id}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                            user.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {actionLoading === user.id
                            ? '...'
                            : user.isActive
                            ? 'Khóa tài khoản'
                            : 'Mở khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total.toLocaleString()}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                ← Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${p === page ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
