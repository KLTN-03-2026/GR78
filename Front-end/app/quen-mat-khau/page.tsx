'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThoTotLogo from '../components/ThoTotLogo'

export default function QuenMatKhau() {
  const [step, setStep] = useState<'send-code' | 'verify-code' | 'reset-password'>('send-code')
  const [contactType, setContactType] = useState<'email' | 'phone'>('email')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý gửi mã xác thực
    console.log('Sending code to:', contactType === 'email' ? formData.email : formData.phone)
    setStep('verify-code')
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý xác thực mã
    console.log('Verifying code:', formData.verificationCode)
    setStep('reset-password')
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý đặt lại mật khẩu
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!')
      return
    }
    console.log('Password reset successful')
    // Chuyển hướng đến trang đăng nhập
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Phần đầu trang */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ThoTotLogo className="w-56 md:w-64" />
          </div>
          <p className="text-gray-600 text-sm">Kết nối khách hàng và thợ chuyên nghiệp</p>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Quên mật khẩu</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {step === 'send-code' && 'Nhập thông tin để nhận mã xác thực'}
          {step === 'verify-code' && 'Nhập mã xác thực đã gửi đến bạn'}
          {step === 'reset-password' && 'Tạo mật khẩu mới'}
        </p>

        {/* Bước 1: Gửi mã */}
        {step === 'send-code' && (
          <>
            {/* Chuyển đổi loại liên hệ */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition duration-200 ${
                  contactType === 'email'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition duration-200 ${
                  contactType === 'phone'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Số điện thoại
              </button>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4">
              {contactType === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập số điện thoại của bạn"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 mt-6"
              >
                Gửi mã xác thực
              </button>
            </form>
          </>
        )}

        {/* Bước 2: Xác thực mã */}
        {step === 'verify-code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã xác thực
              </label>
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mã xác thực đã được gửi đến{' '}
                <span className="font-semibold">
                  {contactType === 'email' ? formData.email : formData.phone}
                </span>
              </p>
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => setStep('send-code')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={handleSendCode}
                className="text-blue-500 hover:text-blue-600"
              >
                Gửi lại mã
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 mt-6"
            >
              Xác thực
            </button>
          </form>
        )}

        {/* Bước 3: Đặt lại mật khẩu */}
        {step === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">Yêu cầu mật khẩu:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tối thiểu 8 ký tự</li>
                <li>Bao gồm chữ hoa và chữ thường</li>
                <li>Có ít nhất 1 số</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 mt-6"
            >
              Đặt lại mật khẩu
            </button>
          </form>
        )}

        {/* Chân trang */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Nhớ mật khẩu?{' '}
          <Link href="/dang-nhap" className="text-blue-500 hover:text-blue-600 font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
