import { NextRequest, NextResponse } from 'next/server'
import { getBackendApiOrigin } from '@/lib/server/backend-origin'
import { fetchBackend, isBackendFetchAbort } from '@/lib/server/fetch-backend'

const API_BASE_URL = getBackendApiOrigin()

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, any>

    console.log('🔵 Proxy Verify Email Request:', JSON.stringify(body, null, 2))

    const payload = {
      email: body.email,
      otp: body.otp,
    }

    console.log('📤 Payload:', JSON.stringify(payload, null, 2))

    const response = await fetchBackend(`${API_BASE_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    console.log('📥 Response status:', response.status)
    console.log('📥 Response data:', JSON.stringify(data, null, 2))

    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('❌ Verify Email Error:', err)

    const msg = isBackendFetchAbort(err)
      ? 'Hết thời gian chờ backend. Kiểm tra NEXT_PUBLIC_API_DOMAIN và máy chủ API.'
      : String(err)

    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: isBackendFetchAbort(err) ? 504 : 500 }
    )
  }
}
