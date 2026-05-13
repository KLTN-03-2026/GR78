import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thợ Tốt — Quản trị',
  description: 'Hệ thống quản trị nền tảng Thợ Tốt',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
