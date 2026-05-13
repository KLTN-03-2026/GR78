import { downloadCsv, http } from './http'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OverviewStats {
  totalUsers: number
  totalCustomers: number
  totalProviders: number
  activeProviders: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalQuotes: number
  confirmedQuotes: number
  pendingQuotes: number
  totalRevenue: number
  activeSubscriptions: number
  totalSubscriptionRevenue: number
  newUsersLast30Days: number
  ordersLast30Days: number
}

export interface OrderStatsByStatus {
  status: string
  count: number
  totalAmount: number
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  byStatus: OrderStatsByStatus[]
  dailyTrend: { date: string; count: number; revenue: number }[]
}

export interface QuoteStatsByStatus {
  status: string
  count: number
}

export interface QuoteStats {
  totalQuotes: number
  byStatus: QuoteStatsByStatus[]
  dailyTrend: { date: string; count: number }[]
}

export interface AdminUser {
  id: string
  email?: string
  phone?: string
  role: 'customer' | 'provider' | 'admin'
  isActive: boolean
  isVerified: boolean
  lastLoginAt?: string
  createdAt: string
  displayName?: string
  fullName?: string
  avatarUrl?: string
  averageRating?: number
  reviewCount?: number
}

export interface UsersListResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  billingCycle: 'monthly' | 'annual'
  price: number
  features?: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePlanDto {
  name: string
  description?: string
  billingCycle: 'monthly' | 'annual'
  price: number
  features?: string[]
  sortOrder?: number
}

export interface UpdatePlanDto {
  name?: string
  description?: string
  price?: number
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

export type UserReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
export type UserReportReason = 'fraud' | 'unreliable' | 'inappropriate' | 'spam' | 'harassment' | 'fake_account' | 'other'

export interface ViolationReport {
  id: string
  reason: UserReportReason
  description?: string
  status: UserReportStatus
  adminNotes?: string
  reviewedAt?: string
  createdAt: string
  reporter: { id: string; email?: string; displayName?: string }
  reportedUser: { id: string; email?: string; displayName?: string; isActive?: boolean }
}

export interface ViolationReportsResponse {
  reports: ViolationReport[]
  total: number
  page: number
  limit: number
}

export interface Subscription {
  id: string
  userId: string
  status: string
  planId?: string
  plan?: SubscriptionPlan
  currentPeriodStart?: string
  currentPeriodEnd?: string
  trialEndDate?: string
  autoRenew: boolean
  createdAt: string
}

export interface SubscriptionsListResponse {
  subscriptions: Subscription[]
  total: number
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const AdminService = {
  getOverview: () => http<OverviewStats>('/admin/stats/overview'),

  getOrderStats: (params?: { from?: string; to?: string; providerId?: string; customerId?: string }) =>
    http<OrderStats>('/admin/stats/orders', { params }),

  getQuoteStats: (params?: { from?: string; to?: string; providerId?: string }) =>
    http<QuoteStats>('/admin/stats/quotes', { params }),

  // ─── Users ──────────────────────────────────────────────────────────────

  listUsers: (params?: {
    page?: number
    limit?: number
    role?: string
    search?: string
    isActive?: boolean
  }) => http<UsersListResponse>('/admin/users', { params }),

  getUserById: (id: string) => http<AdminUser>(`/admin/users/${id}`),

  blockUser: (id: string) => http<AdminUser>(`/admin/users/${id}/block`, { method: 'PATCH' }),

  unblockUser: (id: string) => http<AdminUser>(`/admin/users/${id}/unblock`, { method: 'PATCH' }),

  // ─── Subscription Plans ──────────────────────────────────────────────────

  getPlans: () => http<SubscriptionPlan[]>('/admin/subscription/plans'),

  createPlan: (dto: CreatePlanDto) =>
    http<SubscriptionPlan>('/admin/subscription/plans', { method: 'POST', body: dto }),

  updatePlan: (id: string, dto: UpdatePlanDto) =>
    http<SubscriptionPlan>(`/admin/subscription/plans/${id}`, { method: 'PATCH', body: dto }),

  deactivatePlan: (id: string) =>
    http<{ success: boolean }>(`/admin/subscription/plans/${id}`, { method: 'DELETE' }),

  // ─── Subscriptions ───────────────────────────────────────────────────────

  getSubscriptions: (params?: { page?: number; limit?: number; status?: string }) =>
    http<SubscriptionsListResponse>('/admin/subscription/subscriptions', { params }),

  revokeSubscription: (id: string) =>
    http<{ success: boolean; message: string }>(`/admin/subscription/subscriptions/${id}`, { method: 'DELETE' }),

  // ─── Violations ──────────────────────────────────────────────────────────

  listViolationReports: (params?: { page?: number; limit?: number; status?: string; from?: string; to?: string }) =>
    http<ViolationReportsResponse>('/admin/violations', { params }),

  updateViolationStatus: (id: string, status: UserReportStatus, adminNotes?: string) =>
    http<ViolationReport>(`/admin/violations/${id}/status`, { method: 'PATCH', body: { status, adminNotes } }),

  downloadViolationsReport: (params?: { from?: string; to?: string }) =>
    downloadCsv('/admin/violations/download', params, `violations_${new Date().toISOString().slice(0, 10)}.csv`),

  // ─── Reports ─────────────────────────────────────────────────────────────

  downloadOrdersReport: (params?: { from?: string; to?: string }) =>
    downloadCsv('/admin/reports/orders', params, `orders_${new Date().toISOString().slice(0, 10)}.csv`),

  downloadQuotesReport: (params?: { from?: string; to?: string }) =>
    downloadCsv('/admin/reports/quotes', params, `quotes_${new Date().toISOString().slice(0, 10)}.csv`),

  downloadUsersReport: (params?: { from?: string; to?: string }) =>
    downloadCsv('/admin/reports/users', params, `users_${new Date().toISOString().slice(0, 10)}.csv`),

  downloadRevenueReport: (params?: { from?: string; to?: string }) =>
    downloadCsv('/admin/reports/revenue', params, `revenue_${new Date().toISOString().slice(0, 10)}.csv`),
}
