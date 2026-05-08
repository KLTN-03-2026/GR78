import { NextRequest, NextResponse } from 'next/server'
import { getPublicApiBaseV1 } from '@/lib/server/public-api-base'

const API_BASE_URL = getPublicApiBaseV1()

// GET /api/chat/conversations/[id]/messages - Lấy tin nhắn của conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    console.log('🔔 [Get Messages] Calling backend API...', id)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout

    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${id}/messages`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

    // Parse response
    let data
    try {
      const text = await response.text()
      clearTimeout(timeoutId)
      console.log('🔔 [Get Messages] Raw response text:', text.substring(0, 500))
      data = JSON.parse(text)
    } catch (parseError) {
      clearTimeout(timeoutId)
      console.error('❌ [Get Messages] JSON parse error:', parseError)
      throw new Error('Failed to parse response as JSON')
    }
    
    console.log('🔔 [Get Messages] Response:', data)

    if (!response.ok) {
      console.error('❌ [Get Messages] Error:', data)
      return NextResponse.json(
        { message: data.message || 'Failed to get messages' },
        { status: response.status }
      )
    }

    // ⚠️ FIX: Handle various response formats from backend
    let finalData = data
    
    // Nếu backend trả về { data: [...] }
    if (data && !Array.isArray(data) && data.data && Array.isArray(data.data)) {
      console.log('🔄 [Get Messages] Converting { data: [...] } to array')
      finalData = data.data
    }
    // Nếu backend trả về { messages: [...] }
    else if (data && !Array.isArray(data) && data.messages && Array.isArray(data.messages)) {
      console.log('🔄 [Get Messages] Converting { messages: [...] } to array')
      finalData = data.messages
    }
    // Nếu là array hoặc empty array
    else if (Array.isArray(data)) {
      console.log('✅ [Get Messages] Backend trả về array trực tiếp')
      finalData = data
    }
    // Nếu là object nhưng không có key data/messages
    else if (data && typeof data === 'object' && !Array.isArray(data)) {
      console.warn('⚠️ [Get Messages] Backend trả về object không xác định, trả về empty array')
      finalData = []
    }

    console.log('✅ [Get Messages] Success! Count:', Array.isArray(finalData) ? finalData.length : 0)
    return NextResponse.json(finalData, { status: 200 })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('❌ [Get Messages] Fetch error:', fetchError)
      
      // Handle timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('❌ [Get Messages] Request timeout after 10 seconds')
        return NextResponse.json(
          { message: 'Request timeout - backend server is not responding' },
          { status: 504 }
        )
      }
      
      throw fetchError
    }
  } catch (error) {
    console.error('❌ [Get Messages] Error fetching messages:', error)
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations/[id]/messages - Gửi tin nhắn
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      )
    }

    console.log('🔔 [Send Message] Calling backend API...', id)

    const response = await fetch(`${API_BASE_URL}/chat/conversations/${id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ 
        content: content.trim(),
        type: 'text'  // Backend yêu cầu field type: text, image, file, system
      })
    })

    const data = await response.json()

    console.log('🔔 [Send Message] Response:', data)

    if (!response.ok) {
      console.error('❌ [Send Message] Error:', data)
      return NextResponse.json(
        { message: data.message || 'Failed to send message' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
