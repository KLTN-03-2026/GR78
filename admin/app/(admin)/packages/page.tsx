'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminService, SubscriptionPlan, Subscription, CreatePlanDto, UpdatePlanDto } from '@/lib/api/admin.service'
import PageHeader from '@/components/PageHeader'

function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Hàng tháng',
  annual: 'Hàng năm',
}

const SUB_STATUS_LABELS: Record<string, string> = {
  trial: 'Dùng thử',
  active: 'Đang hoạt động',
  past_due: 'Quá hạn',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
}

const SUB_STATUS_COLORS: Record<string, string> = {
  trial: 'badge-blue',
  active: 'badge-green',
  past_due: 'badge-yellow',
  cancelled: 'badge-red',
  expired: 'badge-gray',
}

type ModalMode = 'create' | 'edit' | null
type TabMode = 'plans' | 'subscriptions'

interface PlanFormData {
  name: string
  description: string
  billingCycle: 'monthly' | 'annual'
  price: string
  features: string
  sortOrder: string
  isActive: boolean
}

const defaultForm: PlanFormData = {
  name: '',
  description: '',
  billingCycle: 'monthly',
  price: '',
  features: '',
  sortOrder: '0',
  isActive: true,
}

export default function PackagesPage() {
  const [tab, setTab] = useState<TabMode>('plans')

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanFormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null)

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subTotal, setSubTotal] = useState(0)
  const [subPage, setSubPage] = useState(1)
  const [subStatus, setSubStatus] = useState('')
  const [subLoading, setSubLoading] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [revokeLoading, setRevokeLoading] = useState(false)

  const subLimit = 15

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const data = await AdminService.getPlans()
      setPlans(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = useCallback(async () => {
    setSubLoading(true)
    try {
      const res = await AdminService.getSubscriptions({
        page: subPage,
        limit: subLimit,
        status: subStatus || undefined,
      })
      setSubscriptions(res.subscriptions)
      setSubTotal(res.total)
    } catch {} finally {
      setSubLoading(false)
    }
  }, [subPage, subStatus])

  useEffect(() => { fetchPlans() }, [])
  useEffect(() => { if (tab === 'subscriptions') fetchSubscriptions() }, [tab, fetchSubscriptions])

  const openCreate = () => {
    setForm(defaultForm)
    setEditingId(null)
    setFormError('')
    setModal('create')
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      billingCycle: plan.billingCycle,
      price: String(plan.price),
      features: (plan.features ?? []).join('\n'),
      sortOrder: String(plan.sortOrder),
      isActive: plan.isActive,
    })
    setEditingId(plan.id)
    setFormError('')
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Tên gói không được để trống'); return }
    const price = Number(form.price)
    if (!form.price || price <= 0) { setFormError('Giá phải lớn hơn 0'); return }
    if (price < 15_000) { setFormError('Giá tối thiểu phải là 15.000 ₫ (yêu cầu tối thiểu của Stripe)'); return }

    setSaving(true)
    setFormError('')
    try {
      const features = form.features.split('\n').map(s => s.trim()).filter(Boolean)
      if (modal === 'create') {
        const dto: CreatePlanDto = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          billingCycle: form.billingCycle,
          price: Number(form.price),
          features: features.length ? features : undefined,
          sortOrder: Number(form.sortOrder) || 0,
        }
        const created = await AdminService.createPlan(dto)
        setPlans(prev => [created, ...prev])
      } else if (editingId) {
        const dto: UpdatePlanDto = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price: Number(form.price),
          features: features.length ? features : undefined,
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder) || 0,
        }
        const updated = await AdminService.updatePlan(editingId, dto)
        setPlans(prev => prev.map(p => p.id === editingId ? updated : p))
      }
      setModal(null)
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await AdminService.deactivatePlan(id)
      setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setConfirmDeactivate(null)
    }
  }

  const handleRevoke = async (id: string) => {
    setRevokeLoading(true)
    try {
      await AdminService.revokeSubscription(id)
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setRevokeLoading(false)
      setConfirmRevoke(null)
    }
  }

  const subTotalPages = Math.ceil(subTotal / subLimit)

  return (
    <div>
      <PageHeader
        title="Quản lý gói dịch vụ"
        description="Gói đăng ký cho nhà cung cấp / thợ"
        actions={
          tab === 'plans' ? (
            <button onClick={openCreate} className="btn-primary">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tạo gói mới
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex rounded-lg border border-gray-200 bg-white overflow-hidden w-fit">
        {([['plans', 'Danh sách gói'], ['subscriptions', 'Đăng ký của thợ']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === key ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Plans Tab ────────────────────────────────────────────────────── */}
      {tab === 'plans' && (
        <>
          {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card h-48 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`card p-5 flex flex-col gap-3 ${!plan.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{CYCLE_LABELS[plan.billingCycle]}</p>
                    </div>
                    <span className={plan.isActive ? 'badge-green' : 'badge-gray'}>
                      {plan.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{fmtVnd(Number(plan.price))}</p>
                  {plan.description && <p className="text-sm text-gray-500">{plan.description}</p>}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => openEdit(plan)} className="btn-secondary flex-1 justify-center py-1.5 text-xs">
                      Chỉnh sửa
                    </button>
                    {plan.isActive && (
                      <button
                        onClick={() => setConfirmDeactivate(plan.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Vô hiệu hóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400">
                  Chưa có gói dịch vụ nào. Tạo gói đầu tiên!
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Subscriptions Tab ────────────────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">{subTotal.toLocaleString()} đăng ký</p>
            <select
              value={subStatus}
              onChange={e => { setSubStatus(e.target.value); setSubPage(1) }}
              className="input w-auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="trial">Dùng thử</option>
              <option value="active">Đang hoạt động</option>
              <option value="past_due">Quá hạn</option>
              <option value="cancelled">Đã hủy</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Gói</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Hết hạn</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-gray-100" /></td>
                      ))}
                    </tr>
                  ))
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">Không có đăng ký nào</td>
                  </tr>
                ) : subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-500">{sub.userId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{sub.plan?.name ?? '—'}</p>
                      {sub.plan && <p className="text-xs text-gray-400">{CYCLE_LABELS[sub.plan.billingCycle]}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={SUB_STATUS_COLORS[sub.status] ?? 'badge-gray'}>
                        {SUB_STATUS_LABELS[sub.status] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString('vi-VN')
                        : sub.trialEndDate
                        ? new Date(sub.trialEndDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sub.status !== 'cancelled' && sub.status !== 'expired' && (
                        <button
                          onClick={() => setConfirmRevoke(sub.id)}
                          className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {subTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                {(subPage - 1) * subLimit + 1}–{Math.min(subPage * subLimit, subTotal)} / {subTotal.toLocaleString()}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setSubPage(p => Math.max(1, p - 1))} disabled={subPage === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Trước</button>
                <button onClick={() => setSubPage(p => Math.min(subTotalPages, p + 1))} disabled={subPage === subTotalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Sau →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal === 'create' ? 'Tạo gói mới' : 'Chỉnh sửa gói'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {formError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên gói *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Ví dụ: Gói Cơ bản" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input resize-none" rows={2} placeholder="Mô tả ngắn về gói" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Chu kỳ *</label>
                  <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value as any }))} disabled={modal === 'edit'} className="input">
                    <option value="monthly">Hàng tháng</option>
                    <option value="annual">Hàng năm</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input" placeholder="99000" min={15000} step={1000} />
                  <p className="mt-0.5 text-xs text-gray-400">Tối thiểu 15.000 ₫</p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tính năng (mỗi dòng một tính năng)</label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className="input resize-none font-mono text-xs" rows={4} placeholder="Đăng bài không giới hạn&#10;Nhận báo giá ưu tiên&#10;..." />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự hiển thị</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="input" min={0} />
                </div>
                {modal === 'edit' && (
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded accent-teal-600" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Đang hoạt động</label>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Đang lưu...' : modal === 'create' ? 'Tạo gói' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deactivate plan */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Xác nhận vô hiệu hóa</h3>
            <p className="mt-2 text-sm text-gray-500">Gói này sẽ không còn khả dụng cho người dùng mới. Các đăng ký hiện tại không bị ảnh hưởng.</p>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setConfirmDeactivate(null)} className="btn-secondary">Hủy</button>
              <button onClick={() => handleDeactivate(confirmDeactivate)} className="btn-danger">Vô hiệu hóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm revoke subscription */}
      {confirmRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Xác nhận thu hồi gói đăng ký</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gói đăng ký này sẽ bị hủy ngay lập tức. Nhà cung cấp sẽ mất quyền truy cập các tính năng cao cấp.
            </p>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setConfirmRevoke(null)} className="btn-secondary" disabled={revokeLoading}>Hủy</button>
              <button
                onClick={() => handleRevoke(confirmRevoke)}
                disabled={revokeLoading}
                className="btn-danger"
              >
                {revokeLoading ? 'Đang xử lý...' : 'Thu hồi gói'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
