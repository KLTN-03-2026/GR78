# Frontend Application Architecture Guide - Thợ Tốt

## 1. Overall Folder Structure & Page Organization

### Main Directory Layout
```
frontend/
├── app/                          # Next.js App Router pages & components
│   ├── components/               # Reusable UI components
│   ├── styles/                   # Global CSS and design tokens
│   ├── home/                     # Home/feed page
│   ├── posts/                    # Post-related pages (search, create, detail)
│   ├── bai-dang-cua-toi/         # My posts listing
│   ├── don-hang/                 # Orders management
│   ├── gio-hang/                 # Quotes/cart (collected quotes for my posts)
│   ├── yeu-thich/                # Saved/liked posts
│   ├── profile/                  # User profile pages
│   ├── tin-nhan/                 # Chat/messaging
│   ├── thong-bao/                # Notifications
│   ├── [auth-pages]/             # dang-nhap, dang-ky, quen-mat-khau, etc.
│   ├── layout.tsx                # Root layout with auth guard
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles + Tailwind directives
│   └── next.config.js
├── src/
│   ├── lib/
│   │   ├── api/                  # Service classes for API communication
│   │   ├── media-url.ts          # Image URL resolver
│   │   └── socket-init.ts        # Socket initialization
│   ├── hooks/                    # Custom React hooks (useInitSocket, useNotifications)
│   └── theme/                    # Theme configuration
├── public/                       # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Page Route Examples
- `/home` - Feed listing
- `/posts/search` - Search results (posts & providers)
- `/posts/create` - Create post form
- `/posts/[id]` - Post detail view
- `/bai-dang-cua-toi` - My posts listing
- `/don-hang` - My orders
- `/gio-hang` - My quotes received
- `/yeu-thich` - Saved posts
- `/profile` - My profile with tabs
- `/tin-nhan` - Chat conversations
- `/thong-bao` - Notifications

---

## 2. Search & List Components

### ✅ Existing Search Pages

#### `/posts/search/page.tsx` - Global Search Page
**Features:**
- Debounced search (updates every 300ms)
- Minimum 2-character requirement
- Real-time results showing posts and providers
- Trending suggestions UI
- Global search via `SearchService.globalSearch({ q, limit: 12 })`
- Response type: `GlobalSearchResponse` with posts and providers arrays

**UI Elements:**
- Search input with trending keywords
- Results split into Posts and Providers sections
- Links to individual posts and provider profiles

#### `/home/page.tsx` - Home Feed with Embedded Search
**Search Features:**
- Search bar in header
- Displays posts in feed
- Has category filtering (if showCategories is enabled)
- Search results appear in modal/overlay

### ✅ Existing Listing Pages

#### `/home/page.tsx` - Post Feed
**Listing Features:**
- Infinite scroll pattern with cursor-based pagination
- Status tabs: "all", "OPEN", "CLOSED"
- Category filter support
- Post cards showing:
  - Author avatar, name, verification status
  - Post title and content snippet
  - Status badge
  - Save/like button
  - Action menu (delete for own posts)

**Data Loading:**
```typescript
const loadPosts = async () => {
  const response = await PostService.getFeed({ limit: 20 })
  // Response: { data: PostResponseDto[], nextCursor?, total, hasMore }
  setPosts(response.data)
}
```

#### `/bai-dang-cua-toi/page.tsx` - My Posts Listing
**Features:**
- Filter by status: all, OPEN, CLOSED
- Shows only authenticated user's posts
- Action menu per post (edit, delete, mark as closed)
- Loading skeleton UI
- Post data loaded via: `PostService.getMyPosts({ limit: 50 })`

#### `/don-hang/page.tsx` - Orders Management
**Features:**
- Dual filter: Status (pending, in_progress, completed, cancelled, disputed) + Role (customer, provider)
- Search by order number
- Order status indicators
- Timeline/workflow visualization
- Action buttons based on status (mark done, finalize, review)
- Statistics panel (total orders, stats breakdown)

**Data Loading:**
```typescript
const stats = await orderService.getStats()
const orders = await orderService.getList({ status, role, limit, offset })
```

#### `/gio-hang/page.tsx` - Quotes Cart
**Features:**
- Lists all quotes received on user's posts
- Shows latest quote per post
- Quote status badges (PENDING, ACCEPTED, IN_CHAT, REJECTED, CANCELLED)
- Revision history dropdown per quote
- Action buttons (accept, chat, reject)
- Sorting by newest first

**Data Loading:**
```typescript
const quotes = await quoteService.getMyQuotes({ limit: 100 })
// Deduplicates by post, keeping latest per post
```

#### `/yeu-thich/page.tsx` - Saved Posts (Favorites)
**Current State:** Mock data structure in place
- Shows worker profiles (mock data with emoji avatars)
- Mock implementation ready for real API integration
- Structure: Worker profile cards with ratings, experience, specialties

#### `/profile/page.tsx` - User Profile with Tabs
**Tab Navigation:**
- View profile (read-only display)
- Edit profile (personal info)
- Contact info (phone, email)
- Display name management
- Avatar upload
- My posts sub-listing
- My quotes sub-listing
- Provider reviews (for providers)
- Change password

---

## 3. Component Naming Conventions & Reusable UI Components

### Naming Conventions

#### Prefix `App` - Reusable UI Components
- `AppButton.tsx` - Button component
- `AppField.tsx` - Input field component
- `AppTextarea.tsx` - Textarea component
- `AppShell.tsx` - Main layout wrapper
- `AppFooter.tsx` - Footer component
- `AppBrandHeader.tsx` - Header with logo
- `AppAuthShell.tsx` - Auth-specific layout
- `AppCard.tsx` (utility class) - Card styling

#### Layout & Structure Components
- `Header.tsx` - Top navigation bar with search, notifications, profile menu
- `MobileBottomNav.tsx` - 5-tab bottom navigation
- `SocketInitializer.tsx` - Socket connection initialization

#### Feature Components
- `SkeletonPost.tsx` - Loading skeleton for posts
- `SkeletonPostDetail.tsx` - Loading skeleton for post detail
- `SkeletonProfile.tsx` - Loading skeleton for profiles
- `ConversationItem.tsx` - Chat conversation list item
- `MessageList.tsx` - Message display component
- `MessageInput.tsx` - Message compose input
- `QuoteSection.tsx` - Quote display section
- `ProviderReceivedReviewsPanel.tsx` - Reviews panel
- `ChatQuoteFlow.tsx` - Chat with quote workflow
- `AuthorCard.tsx` - Author information card
- `ThoTotLogo.tsx` - Logo component

### Reusable UI Component Details

#### AppButton
```typescript
interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'tonal'  // default: 'filled'
  children: ReactNode
}

// Variants:
// - filled: Solid background with brand color, shadow
// - outlined: Border with transparent background
// - tonal: Soft background with brand tint
```

#### AppField
```typescript
interface AppFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string  // Shows red error message below input
}

// Features:
// - Auto-ID generation
// - Focus ring with brand color
// - Error styling (red border + message)
// - Accessibility: uses htmlFor on label
```

#### AppShell
- Main wrapper with responsive design
- Includes `MobileBottomNav` for screens < md (768px)
- Full-width on desktop, bottom-nav padding on mobile
- Background color: `bg-surface-lowest`

---

## 4. Styling Approach: Tailwind + Material Design 3

### Design Token System
Located in `app/styles/design-tokens.css` - synchronized with mobile Flutter app

#### Color Palette
```css
/* Primary Brand */
--color-seed: #14b8a6;                    /* Teal - main brand color */
--color-seed-dark: #0d9488;               /* Darker teal for hover states */
--color-seed-light: #2dd4bf;              /* Lighter teal */
--color-brand-tint: #e6fffa;              /* Soft teal tint for backgrounds */

/* Surfaces */
--color-surface: #fffbfe;                 /* Card/component surfaces */
--color-surface-container-lowest: #f7fafa; /* Lowest elevation background */
--color-surface-container-highest: #e7eef0;

/* Text/Content */
--color-on-surface: #1d1b20;              /* Primary text color */
--color-on-surface-variant: #49454f;      /* Secondary text color */
--color-outline: #79747e;                 /* Borders */
--color-outline-variant: rgba(121, 116, 126, 0.35);

/* Semantic */
--color-error: #b3261e;                   /* Error/danger state */
--color-on-error: #ffffff;
```

#### Spacing System (8px Grid)
```css
--space-xxs: 4px;
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 40px;
--space-xxl: 48px;
```

#### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-xxl: 24px;
--radius-sheet-top: 24px;
```

#### Motion/Animation
```css
--motion-fast: 160ms;
--motion-medium: 260ms;
--motion-slow: 380ms;
--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
--ease-decelerate: cubic-bezier(0.3, 0, 0.67, 0);
```

#### Shadow System
```css
--shadow-xs: 0 1px 2px rgba(29, 27, 32, 0.04);
--shadow-sm: 0 1px 3px rgba(...), 0 1px 2px rgba(...);
--shadow-md: 0 4px 12px rgba(...), 0 2px 4px rgba(...);
--shadow-lg: 0 12px 40px rgba(...), 0 4px 12px rgba(20, 184, 166, 0.06);
--shadow-float: 0 24px 48px -12px rgba(29, 27, 32, 0.12);
```

### Tailwind Configuration Extensions
```typescript
// Custom color scales
colors: {
  brand: { DEFAULT, dark, light, tint }
  surface: { DEFAULT, lowest, highest }
  foreground: 'var(--color-on-surface)'
  'foreground-muted': 'var(--color-on-surface-variant)'
  'outline-variant': 'var(--color-outline-variant)'
}

// Spacing
spacing: { 'app-xxs', 'app-xs', 'app-sm', 'app-md', 'app-lg', 'app-xl', 'app-xxl' }

// Radius
borderRadius: { 'app-sm', 'app-md', 'app-lg', 'app-xl', 'app-xxl', 'app-sheet' }

// Shadows
boxShadow: { 'app-card', 'app-card-hover', 'app-nav', 'app-bar', 'app-header' }
```

### Utility Classes

#### `.app-card`
```css
border-radius: var(--radius-lg);
border: 1px solid var(--color-outline-variant);
background-color: var(--color-surface);
box-shadow: var(--shadow-sm);
transition: box-shadow var(--motion-medium) var(--ease-emphasized);

&:hover {
  box-shadow: var(--shadow-md);
}
```

#### `.app-container`
Responsive container with max-width (1280px) and adaptive padding:
- Mobile: padding 16px
- Tablet (sm): padding 24px
- Desktop (lg): padding 32px

#### `.app-main-grid`
12-column CSS Grid with gap (24px), responsive padding

#### `.hover-lift`
Elevation + scale animation on hover

#### `.page-enter`
Fade-in entrance animation

### Component Styling Patterns

#### Button States
```typescript
// Base: min-h-[52px], rounded-app-lg, px-app-md, py-app-sm
// States: hover (shadow-lg), focus (ring-2 ring-brand), active (scale-[0.99])
// Disabled: opacity-50, cursor-not-allowed

// Variants:
filled:    'bg-brand text-white shadow-md hover:bg-brand-dark hover:shadow-lg'
outlined:  'border border-outline-variant/80 bg-surface text-brand hover:bg-brand-tint/50'
tonal:     'bg-brand-tint text-brand-dark hover:bg-brand/10'
```

#### Form Input Styling
```css
border: 1px solid var(--color-outline-variant);
rounded-app-lg;
px-app-sm py-3;

/* States */
hover: border-outline-variant
focus: border-brand ring-2 ring-brand/18
error: border-app-error ring-red-600/20
```

---

## 5. Data Fetching & Filtering

### API Service Architecture

All API services use fetch with Bearer token authentication:

```typescript
static getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}
```

### Filtering Patterns

#### Status Filtering
Used in multiple pages (orders, posts, quotes):
```typescript
const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'COMPLETED' | ...>('all')

// Apply filter:
if (filterStatus !== 'all') {
  queryParams.append('status', filterStatus)
}
const data = await fetchWithParams(queryParams)
```

#### Role Filtering (Orders)
```typescript
const [roleFilter, setRoleFilter] = useState<'customer' | 'provider' | ''>('')

// Apply filter:
if (roleFilter) {
  queryParams.append('role', roleFilter)
}
```

#### Search Query Filtering
```typescript
const [searchQuery, setSearchQuery] = useState('')

// Debounced search:
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.length >= 2) {
      SearchService.globalSearch({ q: searchQuery, limit: 12 })
    }
  }, 300)
  return () => clearTimeout(timer)
}, [searchQuery])
```

### Pagination Pattern

#### Cursor-Based (Posts Feed)
```typescript
// Request with cursor
const response = await PostService.getFeed({ 
  limit: 20, 
  cursor: nextCursor 
})

// Response structure
interface FeedResponseDto {
  data: PostResponseDto[]
  nextCursor?: string  // For next page
  total: number
  hasMore: boolean
}

// Load more: pass nextCursor to next request
```

#### Offset-Based (Search, Orders)
```typescript
const response = await SearchService.searchProviders({
  displayName?: string
  province?: string
  tradeSlugs?: string[]
  sortBy?: 'displayName' | 'createdAt'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number  // Page offset
})

// Response
interface SearchProvidersResponse {
  data: SearchProviderItem[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
  took: number  // Query time in ms
}
```

---

## 6. API Calling Patterns & Hooks

### Service Classes (in `src/lib/api/`)

#### PostService
```typescript
class PostService {
  // Get feed (public posts)
  static getFeed(params?: { limit?: number; cursor?: string }): Promise<FeedResponseDto>
  
  // Get my posts (authenticated user's posts)
  static getMyPosts(params?: { limit?: number }): Promise<any>
  
  // Get single post
  static getPostById(id: string): Promise<PostResponseDto>
  
  // Create post
  static createPost(data: CreatePostDto): Promise<any>
  
  // Update post
  static updatePost(id: string, data: UpdatePostDto): Promise<any>
  
  // Delete post
  static deletePost(id: string): Promise<DeletePostResponseDto>
}
```

#### SearchService
```typescript
class SearchService {
  // Search providers by name, province, trades
  static searchProviders(params: {
    displayName?: string
    province?: string
    tradeSlugs?: string[]
    sortBy?: 'displayName' | 'createdAt'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }): Promise<SearchProvidersResponse>
  
  // Global search (posts + providers)
  static globalSearch(params: { q: string; limit?: number }): Promise<GlobalSearchResponse>
}
```

#### OrderService
```typescript
class OrderService {
  static getStats(): Promise<OrderStats>
  static getList(params: { status?: string; role?: string; limit?: number; offset?: number }): Promise<Order[]>
  static getById(id: string): Promise<Order>
  static updateStatus(id: string, status: string): Promise<void>
  // ... more methods
}
```

#### QuoteService
```typescript
class QuoteService {
  static getMyQuotes(params?: { limit?: number }): Promise<Quote[]>
  static getQuoteDetails(id: string): Promise<QuoteWithRevisions>
  // ... quote management methods
}
```

### API Wrapper Pattern

Auto-fallback to mock data on network failure:
```typescript
export class ApiWrapper {
  static async wrappedCall<T>(
    name: string,
    realCall: () => Promise<T>,
    mockCall: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await realCall()
      return result
    } catch (error) {
      if (shouldUseMock(error)) {
        console.warn(`Fallback to MOCK: ${name}`)
        return await mockCall()
      }
      throw error
    }
  }
}
```

### Custom Hooks

#### `useInitSocket()` (hooks/useInitSocket.ts)
- Initializes WebSocket connection on mount
- Subscribes to real-time events
- Auto-cleanup on unmount

#### `useNotifications()` (hooks/useNotifications.ts)
- Handles notification updates
- Manages unread count
- Socket event listeners for new notifications

### Usage Example
```typescript
'use client'

import { useState, useEffect } from 'react'
import { PostService } from '@/lib/api/post.service'

export default function Component() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const response = await PostService.getFeed({ limit: 20 })
        setPosts(response.data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  if (loading) return <SkeletonPost />
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

---

## 7. Layout & Navigation Structure

### Root Layout (`app/layout.tsx`)
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={roboto.variable}>
      <body>
        <AuthGuard />
        {children}
      </body>
    </html>
  )
}
```

### AppShell (`app/components/AppShell.tsx`)
Wraps pages with:
- Bottom navigation bar (mobile < md / 768px)
- Responsive padding/spacing

### Navigation Routes

#### Main Navigation (MobileBottomNav - 5 tabs)
```typescript
[
  { href: '/home', label: 'Trang chủ', icon: HomeIcon },
  { href: '/posts/search', label: 'Tìm kiếm', icon: SearchIcon },
  { href: '/tin-nhan', label: 'Tin nhắn', icon: MessageIcon },
  { href: '/thong-bao', label: 'Thông báo', icon: BellIcon },
  { href: '/profile', label: 'Cá nhân', icon: UserIcon },
]
```

#### Header Navigation
- Logo/home link
- Search bar
- Notification badge
- Message badge
- Profile menu (dropdown)

### Responsive Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

**Key breakpoint:** 768px (md)
- Below: Bottom tab navigation visible
- Above: Bottom nav hidden, full desktop layout

---

## 8. Posts/Jobs Display System

### Post Card Component
Displayed in feed with:
- **Author section:**
  - Avatar (circular, with error fallback)
  - Display name + verification badge
  - Location
  - Created timestamp

- **Content section:**
  - Post title (bold, truncated if long)
  - Description/body (text, truncated)
  - Category/trade tag
  - Status badge (OPEN, CLOSED)
  - Images gallery (if present)

- **Interaction section:**
  - Save/favorite button (toggles)
  - View/open button (link to detail)
  - More menu (3-dot) for own posts (edit, delete, mark closed)

### Post Detail Page
`app/posts/[id]/page.tsx`
- Full post content
- Author profile card with CTA (chat, view profile)
- Quotes received section (if user is post owner)
- Related posts/recommendations

### Post Creation Flow
`app/posts/create/page.tsx`
- Form with title, description
- Category/trade selection
- Image upload
- Status selection (OPEN/CLOSED)
- Submit creates post via `PostService.createPost()`

### Post Data Structure
```typescript
interface PostResponseDto {
  id: string
  authorId: string
  title: string
  content: string
  category: string
  status: 'OPEN' | 'CLOSED'
  images?: string[]
  createdAt: string
  updatedAt: string
  author: {
    id: string
    displayName: string
    avatarUrl: string
    isVerified: boolean
  }
}
```

### Order Data Structure (Related to Posts)
```typescript
interface Order {
  id: string
  quoteId: string
  postId?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  customerUserId: string
  providerUserId: string
  quote: Quote
  createdAt: string
  updatedAt: string
  providerCompletedAt?: string
  customerCompletedAt?: string
}
```

### Quote Data Structure
```typescript
interface Quote {
  id: string
  postId: string
  providerId: string
  price: number
  description: string
  status: 'PENDING' | 'ACCEPTED' | 'IN_CHAT' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}
```

---

## Summary of Key Patterns

| Aspect | Pattern | Example |
|--------|---------|---------|
| **Styling** | Tailwind CSS + design tokens | `bg-brand text-foreground rounded-app-lg` |
| **Components** | Functional with hooks | `const [state, setState] = useState()` |
| **Data Fetching** | Service classes + fetch API | `PostService.getFeed()` |
| **Auth** | localStorage token + header | `Authorization: Bearer {token}` |
| **Pagination** | Cursor-based (posts) / Offset-based (search) | `{ cursor, limit: 20 }` |
| **Filtering** | useState + queryParams | `filterStatus, roleFilter` |
| **Search** | Debounced input + API call | 300ms delay, 2-char minimum |
| **Real-time** | Socket.io for chat & notifications | SocketInitializer, socket services |
| **Loading** | Skeleton components + isLoading flag | `SkeletonPost` during fetch |
| **Error Handling** | Try-catch + user messages | Console logs + UI alerts |
| **Navigation** | Next.js routing + Link component | `href="/posts/[id]"` |

---

## Development Tips

1. **Use `'use client'`** directive for interactive pages (hooks, events)
2. **Token expires?** Check localStorage `access_token` and redirect to login
3. **Add new page?** Create folder in `app/` with `page.tsx` inside
4. **Create service?** Add class in `src/lib/api/` following PostService pattern
5. **New component?** Reuse AppButton/AppField if possible, otherwise add to `components/ui/`
6. **Styling?** Use Tailwind utilities + design tokens, avoid inline CSS
7. **Real-time updates?** Use socket services for chat, notifications, orders
8. **Search/filtering?** Add input → debounce → API call → setState → render
