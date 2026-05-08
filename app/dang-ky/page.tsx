'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppAuthShell from '@/app/components/AppAuthShell'
import AppButton from '@/app/components/ui/AppButton'
import AppField from '@/app/components/ui/AppField'
import { AuthService, RegisterRequest } from '@/lib/api/auth.service'

export default function DangKy() {
  const router = useRouter()
  const [step, setStep] = useState<'register' | 'verify-otp'>('register')
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'WORKER' | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!accountType) {
      setError('Vui lòng chọn loại tài khoản!')
      return
    }
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên!')
      return
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email!')
      return
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại!')
      return
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu!')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    setLoading(true)

    try {
      let phoneNumber = formData.phone.trim()
      // Chuẩn hóa số điện thoại sang định dạng +84 nếu bắt đầu bằng 0
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+84' + phoneNumber.slice(1)
      }

      const registerData: RegisterRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: phoneNumber,
        password: formData.password,
        role: accountType === 'CUSTOMER' ? 'customer' : 'provider',
      }

      await AuthService.register(registerData)
      setStep('verify-otp')
      setResendCountdown(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP!')
      return
    }

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số!')
      return
    }

    setLoading(true)

    try {
      await AuthService.verifyEmail(formData.email.trim(), otp)
      alert('Email xác thực thành công! Bạn có thể đăng nhập ngay.')
      router.push('/dang-nhap')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setLoading(true)

    try {
      await AuthService.resendVerification(formData.email.trim())
      setOtp('')
      setResendCountdown(60)
      
      // Đếm ngược
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi lại OTP thất bại')
    } finally {
      setLoading(false)
    }
  }

  const chip = (active: boolean) =>
    `flex-1 rounded-app-md py-2 px-app-sm text-sm font-semibold transition-colors duration-app-fast ease-app-emphasized ${
      active ? 'bg-brand text-white shadow-sm' : 'bg-surface-highest/80 text-foreground-muted hover:bg-surface-highest'
    }`

  if (step === 'verify-otp') {
    return (
      <AppAuthShell
        title="Xác thực email"
        subtitle={`Nhập mã OTP được gửi đến ${formData.email}`}
        showBack
        backHref="/dang-ky"
      >
        {error ? (
          <div className="mb-app-sm rounded-app-md border border-red-200 bg-red-50 px-app-sm py-2 text-sm text-app-error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleVerifyOtp} className="space-y-app-sm">
          <AppField
            name="otp"
            label="Mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            required
          />

          <p className="text-xs text-foreground-muted">
            Nhập mã 6 chữ số được gửi đến email của bạn
          </p>

          <AppButton type="submit" variant="filled" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </AppButton>
        </form>

        <div className="mt-app-md text-center">
          <p className="text-xs text-foreground-muted">Chưa nhận được mã?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCountdown > 0 || loading}
            className="mt-app-xs text-sm font-semibold text-brand hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendCountdown > 0 ? `Gửi lại trong ${resendCountdown}s` : 'Gửi lại mã OTP'}
          </button>
        </div>

        <p className="mt-app-md text-center text-xs text-foreground-muted">
          Bạn trao tôi niềm tin tôi trao bạn tất cả.
        </p>
      </AppAuthShell>
    )
  }

  return (
    <AppAuthShell title="Đăng ký" subtitle="Tạo tài khoản để kết nối với Thợ Tốt" showBack backHref="/dang-nhap">
      {error ? (
        <div className="mb-app-sm rounded-app-md border border-red-200 bg-red-50 px-app-sm py-2 text-sm text-app-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mb-app-md flex gap-app-xs">
        <button type="button" onClick={() => setAccountType('CUSTOMER')} className={chip(accountType === 'CUSTOMER')}>
          Khách hàng
        </button>
        <button type="button" onClick={() => setAccountType('WORKER')} className={chip(accountType === 'WORKER')}>
          Thợ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-app-sm">
        <AppField
          name="fullName"
          label="Họ và tên"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Họ và tên"
          required
        />
        <AppField
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
          autoComplete="email"
        />
        <AppField
          name="phone"
          type="tel"
          label="Số điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Số điện thoại"
          required
          autoComplete="tel"
        />
        <AppField
          name="password"
          type="password"
          label="Mật khẩu"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Mật khẩu"
          required
          autoComplete="new-password"
        />
        <AppField
          name="confirmPassword"
          type="password"
          label="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Xác nhận mật khẩu"
          required
          autoComplete="new-password"
        />

        <AppButton type="submit" variant="filled" className="mt-app-sm w-full" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </AppButton>
      </form>

      <p className="mt-app-md text-center text-xs text-foreground-muted">
        Đã có tài khoản?{' '}
        <Link href="/dang-nhap" className="font-semibold text-brand hover:text-brand-dark">
          Đăng nhập
        </Link>
      </p>
      <p className="mt-app-xs text-center text-xs text-foreground-muted">Bạn trao tôi niềm tin tôi trao bạn tất cả.</p>
    </AppAuthShell>
  )
}
