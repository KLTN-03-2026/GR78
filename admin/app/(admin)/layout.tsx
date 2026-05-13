'use client'

import AuthGuard from '@/components/AuthGuard'
import Sidebar from '@/components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full px-8 py-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
