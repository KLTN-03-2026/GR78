import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized - Missing token' }, { status: 401 })
    }

    const queryString = request.nextUrl.searchParams.toString()
    const response = await fetch(`${API_BASE_URL}/saved-posts${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Get saved posts proxy error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
