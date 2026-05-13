'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/api/auth.service'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const isAuth = AuthService.isAuthenticated()
    setAuthenticated(isAuth)
    setReady(true)
    if (!isAuth) {
      router.replace('/login')
    }
  }, [router])

  if (!ready) return null
  if (!authenticated) return null

  return <>{children}</>
}
