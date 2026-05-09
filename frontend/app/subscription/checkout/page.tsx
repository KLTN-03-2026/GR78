'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import AppShell from '@/app/components/AppShell'
import Header from '@/app/components/Header'
import { SubscriptionService, type PaymentCreationResult } from '@/lib/api/subscription.service'
import { AuthService } from '@/lib/api/auth.service'

// ─── Stripe init ──────────────────────────────────────────────────────────────

const STRIPE_PK =
  'pk_test_51S58BGFEl3lRzd6m7C86MV9sPsgOdssVvGMhhMql5KFfop8kcsIVrnD1CVxvOreojy3ay0A30GL8VAJWflfxql6300Dd6GQowT'

const stripePromise = loadStripe(STRIPE_PK)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const CYCLE_LABEL: Record<string, string> = { monthly: 'Hàng tháng', annual: 'Hàng năm' }

// ─── CardElement appearance ───────────────────────────────────────────────────

const CARD_ELEMENT_STYLE = {
  style: {
    base: {
      color: '#1d1b20',
      fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#49454f' },
    },
    invalid: { color: '#b3261e', iconColor: '#b3261e' },
  },
}

// ─── Inner payment form (must be inside <Elements>) ───────────────────────────

interface CheckoutFormProps {
  result: PaymentCreationResult
  planName: string
  billingCycle: string
}

function CheckoutForm({ result, planName, billingCycle }: CheckoutFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const [cardComplete, setCardComplete] = useState(false)
  const [paying, setPaying] = useState(false)
  const [stripeError, setStripeError] = useState('')
  const [succeeded, setSucceeded] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!cardComplete) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setPaying(true)
    setStripeError('')

    const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      setStripeError(error.message ?? 'Thanh toán thất bại. Vui lòng thử lại.')
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      setSucceeded(true)
      // Short delay so user sees the success state, then redirect
      setTimeout(() => {
        router.push('/subscription?payment=success')
      }, 2200)
    } else {
      setStripeError('Thanh toán chưa hoàn tất. Vui lòng thử lại.')
      setPaying(false)
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center py-app-xl text-center">
        <div className="mb-app-sm flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground">Thanh toán thành công!</h2>
        <p className="mt-1 text-sm text-foreground-muted">Đang chuyển về trang quản lý gói...</p>
        <div className="mt-app-sm h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-app-md" noValidate>
      {/* Order summary */}
      <div className="rounded-app-xl border border-outline-variant/60 bg-surface">
        <div className="border-b border-outline-variant/40 px-app-md py-app-sm">
          <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
            Tóm tắt đơn hàng
          </p>
        </div>
        <div className="space-y-2 px-app-md py-app-sm">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Gói đăng ký</span>
            <span className="font-medium text-foreground">{planName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Chu kỳ</span>
            <span className="font-medium text-foreground">{CYCLE_LABEL[billingCycle] ?? billingCycle}</span>
          </div>
          {result.discountAmount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Giá gốc</span>
                <span className="font-medium text-foreground line-through">{formatPrice(result.amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Giảm giá</span>
                <span className="font-semibold">− {formatPrice(result.discountAmount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-outline-variant/40 pt-2">
            <span className="font-bold text-foreground">Tổng thanh toán</span>
            <span className="text-xl font-bold text-brand">{formatPrice(result.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Card input */}
      <div className="rounded-app-xl border border-outline-variant/60 bg-surface">
        <div className="border-b border-outline-variant/40 px-app-md py-app-sm">
          <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
            Thông tin thẻ
          </p>
        </div>
        <div className="px-app-md py-app-md">
          <div
            className={`rounded-app-lg border px-app-sm py-3 transition-[border-color] ${
              stripeError
                ? 'border-app-error/70 bg-red-50/30'
                : cardComplete
                ? 'border-brand/50 bg-brand-tint/10'
                : 'border-outline-variant/80 bg-surface-lowest'
            }`}
          >
            <CardElement
              options={CARD_ELEMENT_STYLE}
              onChange={(e) => {
                setCardComplete(e.complete)
                if (e.error) setStripeError(e.error.message ?? '')
                else setStripeError('')
              }}
            />
          </div>

          {stripeError && (
            <p className="mt-2 text-sm text-app-error" role="alert">{stripeError}</p>
          )}

          {/* Test mode hint */}
          <p className="mt-app-sm text-center text-xs text-foreground-muted">
            Thẻ thử nghiệm:{' '}
            <span className="font-mono font-semibold text-foreground">4242 4242 4242 4242</span>
            {' '}· MM/YY bất kỳ · CVC bất kỳ
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || !cardComplete || paying}
        className="w-full rounded-app-lg bg-brand py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {paying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Đang xử lý...
          </span>
        ) : (
          `Thanh toán ${formatPrice(result.finalAmount)}`
        )}
      </button>

      {/* Security note */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-foreground-muted">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Được bảo mật bởi{' '}
        <span className="font-semibold text-[#635bff]">Stripe</span>
      </p>
    </form>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const planId = searchParams.get('planId')
  const discountCode = searchParams.get('discountCode') || undefined

  const [result, setResult] = useState<PaymentCreationResult | null>(null)
  const [planName, setPlanName] = useState('')
  const [billingCycle, setBillingCycle] = useState('')
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState('')
  const [hasPending, setHasPending] = useState(false)
  const [cancelingPending, setCancelingPending] = useState(false)

  const initPayment = useCallback(async () => {
    if (!planId) return

    setLoading(true)
    setInitError('')
    setHasPending(false)

    try {
      // Fetch plan info for display (use plans list)
      const [plans, paymentResult] = await Promise.all([
        SubscriptionService.getPlans(),
        SubscriptionService.subscribe(planId, discountCode),
      ])

      const plan = plans.find((p) => p.id === planId)
      setPlanName(plan?.name ?? 'Gói đăng ký')
      setBillingCycle(plan?.billingCycle ?? '')
      setResult(paymentResult)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể khởi tạo thanh toán'
      // Backend throws "pending payment exists" with 409
      if (msg.toLowerCase().includes('pending') || msg.includes('409') || msg.includes('Conflict')) {
        setHasPending(true)
      } else {
        setInitError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [planId, discountCode])

  useEffect(() => {
    if (!AuthService.getAccessToken()) {
      router.push('/dang-nhap')
      return
    }
    if (!planId) {
      router.push('/subscription')
      return
    }
    void initPayment()
  }, [planId, router, initPayment])

  const handleCancelPending = async () => {
    setCancelingPending(true)
    try {
      await SubscriptionService.cancelPendingPayment()
      setHasPending(false)
      await initPayment()
    } catch (e) {
      setInitError(e instanceof Error ? e.message : 'Không thể hủy thanh toán cũ')
    } finally {
      setCancelingPending(false)
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-surface-lowest">
        <Header />

        <main className="app-container max-w-lg py-app-md">
          {/* Back */}
          <Link
            href="/subscription"
            className="mb-app-md inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-brand"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại gói đăng ký
          </Link>

          <h1 className="mb-app-md text-xl font-bold text-foreground">Thanh toán</h1>

          {/* Pending payment conflict */}
          {hasPending && !loading && (
            <div className="rounded-app-xl border border-amber-300 bg-amber-50 p-app-md">
              <p className="font-semibold text-amber-800">
                ⚠️ Bạn đang có thanh toán chưa hoàn tất
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Hủy thanh toán cũ để tiếp tục với gói đã chọn.
              </p>
              <div className="mt-app-sm flex gap-app-sm">
                <Link
                  href="/subscription"
                  className="rounded-app-lg border border-amber-400 bg-white px-app-md py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
                >
                  Quay lại
                </Link>
                <button
                  type="button"
                  onClick={handleCancelPending}
                  disabled={cancelingPending}
                  className="rounded-app-lg bg-amber-600 px-app-md py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {cancelingPending ? 'Đang hủy...' : 'Hủy và tạo lại'}
                </button>
              </div>
            </div>
          )}

          {/* Init error */}
          {initError && !hasPending && (
            <div className="rounded-app-xl border border-app-error/30 bg-red-50 p-app-md">
              <p className="font-semibold text-app-error">Không thể khởi tạo thanh toán</p>
              <p className="mt-1 text-sm text-app-error/80">{initError}</p>
              <div className="mt-app-sm flex gap-app-sm">
                <Link
                  href="/subscription"
                  className="rounded-app-lg border border-outline-variant/60 bg-white px-app-md py-2 text-sm text-foreground hover:bg-surface"
                >
                  Quay lại
                </Link>
                <button
                  type="button"
                  onClick={() => void initPayment()}
                  className="rounded-app-lg bg-brand px-app-md py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-app-md">
              <div className="h-40 animate-pulse rounded-app-xl bg-surface-highest" />
              <div className="h-28 animate-pulse rounded-app-xl bg-surface-highest" />
              <div className="h-14 animate-pulse rounded-app-lg bg-surface-highest" />
            </div>
          )}

          {/* Stripe Elements + form */}
          {!loading && result && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                result={result}
                planName={planName}
                billingCycle={billingCycle}
              />
            </Elements>
          )}
        </main>
      </div>
    </AppShell>
  )
}
