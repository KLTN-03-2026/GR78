import { API_BASE, getToken } from './config'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function http<T>(
  path: string,
  options: { method?: Method; body?: unknown; params?: Record<string, string | number | boolean | undefined> } = {},
): Promise<T> {
  const { method = 'GET', body, params } = options
  const token = getToken()

  let url = `${API_BASE}${path}`
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const err = await res.json()
      msg = err.message ?? msg
    } catch {}
    throw new ApiError(res.status, msg)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function downloadCsv(path: string, params?: Record<string, string | undefined>, filename = 'report.csv'): Promise<void> {
  const token = getToken()
  let url = `${API_BASE}${path}`
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })

  if (!res.ok) throw new ApiError(res.status, `Download failed: ${res.status}`)

  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
