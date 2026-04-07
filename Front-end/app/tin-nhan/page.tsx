'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import { chatService, type Conversation, type Message } from '@/lib/api/chat.service'
import { ProfileService } from '@/lib/api/profile.service'
import { quoteService } from '@/lib/api/quote.service'
import { AuthService } from '@/lib/api/auth.service'
import { chatSocketService } from '@/lib/api/chat-socket.service'
import ChatQuoteFlow from '@/app/components/ChatQuoteFlow'
import ConversationItem from '@/app/components/ConversationItem'

interface User {
  id: string
  fullName?: string
  displayName?: string
  avatar?: string
  role?: string
  accountType?: string
}

interface Quote {
  id: string
  price: number
  description: string
  providerId: string
  status: string
}

const getNormalizedRole = (user?: User | null) =>
  (user?.role || user?.accountType || '').toString().toUpperCase()

const isCustomerRole = (user?: User | null) => getNormalizedRole(user) === 'CUSTOMER'

const isProviderRole = (user?: User | null) => {
  const role = getNormalizedRole(user)
  return role === 'PROVIDER' || role === 'WORKER'
}

export default function TinNhanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [quoteData, setQuoteData] = useState<Quote | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [sendingMessage, setSendingMessage] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [usersCache, setUsersCache] = useState<{ [key: string]: User }>({})  // Cache for user info

  // Giả sử userId - trong production lấy từ auth context
  const currentUserId = 'user1'

  // Load conversations và kết nối socket
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/dang-nhap')
      return
    }

    // Load current user's profile
    const loadCurrentUser = async () => {
      try {
        console.log('👤 Loading current user profile...')
        const profile = await ProfileService.getMyProfile()
        console.log('✅ Current user loaded:', profile)
        setCurrentUser({
          id: profile.id,
          fullName: profile.fullName || undefined,
          displayName: profile.displayName || undefined,
          avatar: profile.avatar || undefined,
          role: profile.accountType
        })
      } catch (error) {
        console.error('❌ Error loading current user:', error)
        // Set fallback current user
        setCurrentUser({
          id: 'unknown',
          fullName: 'Me',
          displayName: 'Me',
          role: 'CUSTOMER'
        })
      }
    }

    loadCurrentUser()
    loadConversations()
    loadUnreadCount()

    // Kết nối chat socket
    chatSocketService.connect()

    // Lắng nghe tin nhắn mới
    const unsubscribeNewMessage = chatSocketService.on('new_message', (data: { conversationId: string; message: Message }) => {
      console.log('💬 Tin nhắn mới:', data)

      // Nếu đang xem conversation này, thêm message vào list
      if (selectedConversation?.id === data.conversationId) {
        setMessages(prev => [...prev, data.message])
        // Đánh dấu đã đọc ngay
        chatSocketService.markAsRead(data.conversationId)
      }

      // Cập nhật conversation list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === data.conversationId) {
            return {
              ...conv,
              lastMessagePreview: data.message.content || 'File đính kèm',
              lastMessageAt: data.message.createdAt,
              customerUnreadCount: selectedConversation?.id === data.conversationId && isCustomerRole(currentUser) ? 0 : conv.customerUnreadCount,
              providerUnreadCount: selectedConversation?.id === data.conversationId && isProviderRole(currentUser) ? 0 : conv.providerUnreadCount
            }
          }
          return conv
        })
        // Sắp xếp lại theo thời gian message mới nhất
        return updated.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
          return timeB - timeA
        })
      })

      // Hiển thị browser notification nếu không đang xem conversation đó
      if (selectedConversation?.id !== data.conversationId && Notification.permission === 'granted') {
        new Notification('Tin nhắn mới', {
          body: data.message.content || 'Bạn có tin nhắn mới',
          icon: '/logo.png'
        })
      }

      // Reload unread count
      loadUnreadCount()
    })

    // Lắng nghe khi messages được đánh dấu đã đọc
    const unsubscribeMessagesRead = chatSocketService.on('messages_read', (data: { conversationId: string; readBy: string }) => {
      console.log('✅ Messages đã đọc:', data)

      // Cập nhật UI để hiển thị checkmark
      if (selectedConversation?.id === data.conversationId) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: true,
          readAt: new Date()
        })))
      }
    })

    // Lắng nghe user typing
    const unsubscribeTyping = chatSocketService.on('user_typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      console.log('⌨️ User typing:', data)
      // TODO: Hiển thị "đang nhập..." trong UI
    })

    // Lắng nghe unread count update
    const unsubscribeUnreadUpdated = chatSocketService.on('unread_updated', (data: { conversationId: string; increment: number }) => {
      console.log('🔢 Unread updated:', data)
      loadUnreadCount()
    })

    // Lắng nghe kết nối thành công
    const unsubscribeConnected = chatSocketService.on('connected', (data: { userId: string; unreadCount: number }) => {
      console.log('🔔 Chat connected:', data)
      setUnreadCount(data.unreadCount)
    })

    // Yêu cầu quyền browser notification
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Browser notification permission:', permission)
      })
    }

    // Cleanup
    return () => {
      unsubscribeNewMessage()
      unsubscribeMessagesRead()
      unsubscribeTyping()
      unsubscribeUnreadUpdated()
      unsubscribeConnected()
      chatSocketService.disconnect()
    }
  }, [])

  // Load messages khi chọn conversation
  useEffect(() => {
    if (!selectedConversation) {
      return
    }

    if (!currentUser) {
      console.log('⏳ Waiting for currentUser to load...')
      return
    }

    console.log('📨 Setting up conversation:', selectedConversation.id)
    loadMessages(selectedConversation.id)
    markAsRead(selectedConversation.id)

    // Determine otherUser ID based on current user role
    const isCustomer = isCustomerRole(currentUser)
    const otherUserId = isCustomer ? selectedConversation.providerId : selectedConversation.customerId

    console.log('👤 Loading other user profile:', otherUserId)
    // Load other user's profile
    loadOtherUserProfile(otherUserId)

    // Join conversation room để nhận messages real-time
    chatSocketService.joinConversation(selectedConversation.id)

    // Cleanup: Leave room khi chuyển conversation
    return () => {
      chatSocketService.leaveConversation(selectedConversation.id)
    }
  }, [selectedConversation, currentUser])

  // Load user profiles for all conversations whenever conversations or currentUser changes
  useEffect(() => {
    if (conversations.length > 0 && currentUser) {
      loadUserProfilesForConversations(conversations)
    }
  }, [conversations, currentUser])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await chatService.getConversations()

      // ⚠️ FIX: Include ALL conversations including closed ones
      // Sort: active first, then by last message time
      const sortedData = data.sort((a, b) => {
        // Active conversations first
        if (a.isClosed !== b.isClosed) {
          return a.isClosed ? 1 : -1
        }
        // Then by last message time
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return timeB - timeA
      })

      setConversations(sortedData)

      // ⚠️ Warn if previously selected conversation was closed
      if (selectedConversation && selectedConversation.id) {
        const currentConv = sortedData.find(c => c.id === selectedConversation.id)
        if (currentConv && currentConv.isClosed && !selectedConversation.isClosed) {
          console.warn('⚠️ Selected conversation was auto-closed by server')
          // Optionally show a warning to user
        }
      }

      // 🔥 Kiểm tra xem có query param conversation không
      // Nếu có, tự động chọn conversation đó
      const conversationIdFromUrl = searchParams.get('conversation')
      if (conversationIdFromUrl && sortedData.length > 0) {
        let targetConversation = sortedData.find(c => c.id === conversationIdFromUrl)

        // Fallback: gọi API chi tiết nếu conversation chưa nằm trong danh sách hiện tại
        if (!targetConversation) {
          try {
            targetConversation = await chatService.getConversationById(conversationIdFromUrl)
            setConversations(prev => {
              if (prev.some(c => c.id === targetConversation!.id)) return prev
              return [targetConversation!, ...prev]
            })
          } catch (error) {
            console.error('❌ Cannot load conversation by id:', conversationIdFromUrl, error)
          }
        }

        if (targetConversation) {
          console.log('💬 Auto-selecting conversation from URL:', conversationIdFromUrl)
          if (targetConversation.isClosed) {
            console.warn('⚠️ Target conversation is closed:', conversationIdFromUrl)
          }
          setSelectedConversation(targetConversation)

          // Xóa query param khỏi URL (optional - để URL sạch hơn)
          window.history.replaceState({}, '', '/tin-nhan')
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      alert('Không thể tải danh sách cuộc trò chuyện')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true)
      console.log('📨 Loading messages for conversation:', conversationId)
      const data = await chatService.getMessages(conversationId)
      console.log('✅ Messages loaded:', Array.isArray(data) ? data.length : 0, 'messages')
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error loading messages:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const data = await chatService.getUnreadCount()
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error loading unread count:', error)
      setUnreadCount(0)
    }
  }

  const loadOtherUserProfile = async (userId: string) => {
    try {
      console.log('👤 Loading other user profile:', userId)
      const user = await ProfileService.getUserProfile(userId)
      console.log('✅ Other user loaded:', user)
      setOtherUser({
        id: user.id,
        fullName: user.fullName || undefined,
        displayName: user.displayName || undefined,
        avatar: user.avatar || undefined,
        role: user.accountType
      })
    } catch (error) {
      console.error('❌ Error loading other user profile:', error)
      // Set fallback user with just the ID
      setOtherUser({
        id: userId,
        fullName: 'User',
        displayName: 'User'
      })
    }
  }

  // Load user profiles for all conversations
  const loadUserProfilesForConversations = async (convs: Conversation[]) => {
    if (!currentUser) return

    const isCustomer = isCustomerRole(currentUser)
    const userIdsToLoad = new Set<string>()

    // Collect all unique user IDs that need to be loaded
    convs.forEach(conv => {
      const otherUserId = isCustomer ? conv.providerId : conv.customerId
      if (otherUserId && !usersCache[otherUserId]) {
        userIdsToLoad.add(otherUserId)
      }
    })

    // Load profiles for all users that aren't cached
    if (userIdsToLoad.size > 0) {
      console.log('👥 Loading profiles for users:', Array.from(userIdsToLoad))
      try {
        const loadedUsers: { [key: string]: User } = {}

        // Load each user profile
        for (const userId of Array.from(userIdsToLoad)) {
          try {
            const user = await ProfileService.getUserProfile(userId)
            console.log('✅ Loaded user:', userId, user)
            loadedUsers[userId] = {
              id: user.id,
              fullName: user.fullName || undefined,
              displayName: user.displayName || undefined,
              avatar: user.avatar || undefined,
              role: user.accountType
            }
            console.log('📸 User avatar:', userId, user.avatar)
          } catch (error) {
            console.error('❌ Error loading user profile:', userId, error)
            loadedUsers[userId] = {
              id: userId,
              fullName: 'User',
              displayName: 'User'
            }
          }
        }

        // Update cache with all loaded users
        setUsersCache(prev => ({
          ...prev,
          ...loadedUsers
        }))
        console.log('💾 Updated cache:', loadedUsers)
      } catch (error) {
        console.error('❌ Error loading user profiles:', error)
      }
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      // Gửi qua WebSocket để real-time
      if (chatSocketService.isConnected()) {
        await chatSocketService.markAsRead(conversationId)
      } else {
        await chatService.markAsRead(conversationId)
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              customerUnreadCount: isCustomerRole(currentUser) ? 0 : conv.customerUnreadCount,
              providerUnreadCount: isProviderRole(currentUser) ? 0 : conv.providerUnreadCount
            }
          }
          return conv
        })
      )
      loadUnreadCount()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      setSendingMessage(true)

      // Gửi qua WebSocket để có real-time response
      const response = await chatSocketService.sendMessage(selectedConversation.id, {
        type: 'text',
        content
      })

      if (response.success && response.message) {
        // Message đã được thêm vào qua event 'new_message', không cần thêm ở đây
        console.log('✅ Message sent successfully:', response.message)
      } else {
        throw new Error(response.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Không thể gửi tin nhắn')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return

    try {
      await chatService.deleteConversation(conversationId)
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      alert('Không thể xóa cuộc trò chuyện')
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedConversation) return
    if (!confirm('Bạn có chắc muốn đóng cuộc trò chuyện này?')) return

    try {
      await chatService.closeConversation(selectedConversation.id)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, isClosed: true } : conv
        )
      )
      setSelectedConversation((prev: Conversation | null) => (prev ? { ...prev, isClosed: true } : null))
      alert('Đã đóng cuộc trò chuyện')
    } catch (error) {
      console.error('Error closing conversation:', error)
      alert('Không thể đóng cuộc trò chuyện')
    }
  }

  // ⚠️ FIX: Add function to reopen closed conversations
  const handleReopenConversation = async () => {
    if (!selectedConversation) return
    if (!confirm('Bạn có chắc muốn mở lại cuộc trò chuyện này?')) return

    try {
      // Call reopenConversation if available, otherwise just update local state
      // (You'll need to add this endpoint to your backend)
      // await chatService.reopenConversation(selectedConversation.id)

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, isClosed: false } : conv
        )
      )
      setSelectedConversation((prev: Conversation | null) => (prev ? { ...prev, isClosed: false } : null))
      alert('Đã mở lại cuộc trò chuyện')
    } catch (error) {
      console.error('Error reopening conversation:', error)
      alert('Không thể mở lại cuộc trò chuyện')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations()
      return
    }

    try {
      const results = await chatService.searchMessages({ query: searchQuery })
      console.log('Search results:', results)
      alert(`Tìm thấy ${results.length} kết quả`)
    } catch (error) {
      console.error('Error searching:', error)
      alert('Không thể tìm kiếm')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header currentUser={currentUser} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-96 bg-white border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push('/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quay lại trang chủ"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center justify-between flex-1">
                <h1 className="text-2xl font-bold">Tin nhắn</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} chưa đọc
                  </span>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm tin nhắn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                // Determine other user info based on current user role
                const isCustomer = isCustomerRole(currentUser)
                const otherUserId = isCustomer
                  ? conversation.providerId
                  : conversation.customerId

                const unreadCount = currentUser?.id === conversation.customerId
                  ? conversation.customerUnreadCount
                  : currentUser?.id === conversation.providerId
                    ? conversation.providerUnreadCount
                    : isCustomer
                      ? conversation.customerUnreadCount
                      : conversation.providerUnreadCount

                const cachedUser = usersCache[otherUserId]
                const otherUserName = cachedUser ? (cachedUser.displayName || cachedUser.fullName || 'User') : 'Loading...'
                const otherUserAvatar = cachedUser?.avatar

                return (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    otherUserName={otherUserName}
                    otherUserAvatar={otherUserAvatar}
                    unreadCount={unreadCount}
                    isActive={selectedConversation?.id === conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    onDelete={() => handleDeleteConversation(conversation.id)}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                    {otherUser?.avatar ? (
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.displayName || otherUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {(otherUser?.displayName || otherUser?.fullName || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{otherUser?.displayName || otherUser?.fullName || 'User'}</h2>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <svg className={`w-3 h-3 ${selectedConversation.isActive ? 'fill-green-500' : 'fill-gray-400'}`} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      {selectedConversation.isActive ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedConversation.isClosed ? (
                    <button
                      onClick={handleReopenConversation}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      title="Mở lại cuộc trò chuyện"
                    >
                      🔓 Mở lại
                    </button>
                  ) : (
                    <button
                      onClick={handleCloseConversation}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Đóng cuộc trò chuyện"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Use ChatQuoteFlow for quote-enabled messaging */}
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Đang tải tin nhắn...</p>
                  </div>
                </div>
              ) : currentUser && otherUser ? (
                <ChatQuoteFlow
                  conversationId={selectedConversation.id}
                  quoteId={selectedConversation.quoteId}
                  currentUser={{
                    id: currentUser?.id || '',
                    fullName: currentUser?.fullName,
                    displayName: currentUser?.displayName || currentUser?.fullName,
                    avatar: currentUser?.avatar
                  }}
                  otherUser={{
                    id: otherUser?.id || '',
                    fullName: otherUser?.fullName || otherUser?.displayName,
                    displayName: otherUser?.displayName || otherUser?.fullName,
                    avatar: otherUser?.avatar
                  }}
                  currentUserRole={isProviderRole(currentUser) ? 'PROVIDER' : 'CUSTOMER'}
                  isClosed={selectedConversation.isClosed}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Đang tải thông tin cuộc trò chuyện...</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
