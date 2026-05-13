import { http } from './http'
import { setToken, removeToken } from './config'

// Backend wraps responses: { success, data: { accessToken, refreshToken?, user } }
interface BackendLoginEnvelope {
  success: boolean
  message?: string
  data: {
    accessToken: string
    refreshToken?: string
    user?: {
      id: string
      email?: string
      phone?: string
      role?: string
    }
  }
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email?: string
    phone?: string
    role: string
  }
}

export const AuthService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const envelope = await http<BackendLoginEnvelope>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    })

    const data = envelope?.data
    if (!data?.accessToken) {
      throw new Error('Phản hồi từ máy chủ không hợp lệ')
    }

    const role = data.user?.role ?? ''
    if (role !== 'admin') {
      throw new Error('Tài khoản không có quyền truy cập trang quản trị')
    }

    const res: LoginResponse = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user!.id,
        email: data.user!.email,
        phone: data.user!.phone,
        role,
      },
    }

    setToken(res.accessToken)
    localStorage.setItem('admin_user', JSON.stringify(res.user))
    return res
  },

  logout(): void {
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  getUser(): LoginResponse['user'] | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('admin_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('admin_access_token')
  },
}
