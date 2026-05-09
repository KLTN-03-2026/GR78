# Search & Listing Components - Quick Reference

## 🔍 Search Features

### 1. Global Search Page
**Location:** `/posts/search/page.tsx`

**Features:**
- Full-page search interface
- Debounced search (300ms)
- Minimum 2-character requirement
- Trending suggestions (Thợ điện, Sửa điều hòa, Sơn nhà, Thợ mộc, Vệ sinh máy lạnh)

**API Call:**
```typescript
SearchService.globalSearch({ q: searchQuery, limit: 12 })
// Returns: { query, posts[], providers[], totalPosts, totalProviders, took }
```

**Response Display:**
- Posts section with title and author
- Providers section with avatar and bio
- Results with timestamp

---

### 2. Header Search (In Navigation)
**Location:** `app/components/Header.tsx`

**Features:**
- Live search in header/top navigation
- Results shown in dropdown/modal
- Searches posts and providers
- Click result navigates to detail

**Implementation:**
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState<HeaderSearchResult[]>([])

// On input change:
debounce(() => {
  SearchService.globalSearch({ q: searchQuery })
    .then(data => setSearchResults([...data.posts, ...data.providers]))
}, 300)
```

---

### 3. Home Page Search (Feed-Level)
**Location:** `app/home/page.tsx`

**Features:**
- Search bar in home feed
- Can search within posts feed
- Shows category filter
- Shows service/trade filter

**Implementation:**
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [showSearchResults, setShowSearchResults] = useState(false)
// Results overlay on top of feed
```

---

## 📋 Listing Pages

### 1. Home Feed
**Location:** `/home/page.tsx`

**Type:** Primary list view for public posts

**Features:**
| Feature | Details |
|---------|---------|
| **Data Source** | `PostService.getFeed({ limit: 20 })` |
| **Pagination** | Cursor-based (nextCursor) |
| **Filtering** | Status tabs (all, OPEN, CLOSED) |
| **Sorting** | By creation date (default) |
| **Cards Show** | Author, title, status, actions |
| **Actions** | Save, open detail, menu (own posts) |
| **Search** | Header search integrated |
| **Loading State** | SkeletonPost components |
| **Auth** | No auth required (public feed) |

**Response Structure:**
```typescript
interface FeedResponseDto {
  data: PostResponseDto[]
  nextCursor?: string
  total: number
  hasMore: boolean
}
```

---

### 2. My Posts Listing
**Location:** `/bai-dang-cua-toi/page.tsx`

**Type:** Filtered list of authenticated user's own posts

**Features:**
| Feature | Details |
|---------|---------|
| **Data Source** | `PostService.getMyPosts({ limit: 50 })` |
| **Pagination** | Simple limit/offset |
| **Filtering** | Status: all / OPEN / CLOSED |
| **Sorting** | By creation date |
| **Cards Show** | Status, quote count, action menu |
| **Actions** | Edit, delete, mark closed, view detail |
| **Auth Required** | YES (redirects to login if not auth) |
| **Loading State** | SkeletonPost components |

**Key Code:**
```typescript
useEffect(() => {
  if (!AuthService.isAuthenticated()) {
    router.push('/dang-nhap')
    return
  }
  loadMyPosts()
}, [])

const loadMyPosts = async () => {
  const response = await PostService.getMyPosts({ limit: 50 })
  setPosts(response.data)
}
```

---

### 3. Orders Management
**Location:** `/don-hang/page.tsx`

**Type:** Filtered list of orders (as customer or provider)

**Features:**
| Feature | Details |
|---------|---------|
| **Data Source** | `orderService.getList({ status, role, limit, offset })` |
| **Pagination** | Offset-based |
| **Primary Filter** | Status: pending, in_progress, completed, cancelled, disputed |
| **Secondary Filter** | Role: customer, provider, or both |
| **Search** | By order number (local search) |
| **Stats** | Top panel showing order statistics |
| **Cards Show** | Order ID, status, dates, amounts, actions |
| **Actions** | View detail, mark done, review, finalize |
| **Auth Required** | YES |
| **Loading State** | Skeleton cards |

**Key Code:**
```typescript
const [statusFilter, setStatusFilter] = useState<string>('')
const [roleFilter, setRoleFilter] = useState<'customer' | 'provider' | ''>('')

const loadOrders = async () => {
  const orders = await orderService.getList({
    status: statusFilter || undefined,
    role: roleFilter || undefined,
    limit: 20,
    offset: pageNumber * 20
  })
  setOrders(orders)
}
```

**Filter UI:**
- Status dropdown/tabs
- Role toggle (Customer / Provider)
- Order number search box
- Stats cards (total orders, pending, completed, etc.)

---

### 4. Quotes/Cart (Received Quotes)
**Location:** `/gio-hang/page.tsx`

**Type:** Shopping cart-like interface showing quotes received on user's posts

**Features:**
| Feature | Details |
|---------|---------|
| **Data Source** | `quoteService.getMyQuotes({ limit: 100 })` |
| **Data Transform** | Deduplicates by postId (keeps latest quote) |
| **Filtering** | Status badges (PENDING, ACCEPTED, IN_CHAT, REJECTED, CANCELLED) |
| **Sorting** | Newest first |
| **Cards Show** | Quote price, provider info, status, revision count |
| **Actions** | Accept quote, view revisions, chat, reject |
| **Expansible** | Click to show revision history |
| **Auth Required** | YES (must be post owner) |
| **Loading State** | Skeleton cards |

**Key Code:**
```typescript
const loadQuotes = async () => {
  const allQuotes = await quoteService.getMyQuotes({ limit: 100 })
  
  // Deduplicate: keep latest quote per post
  const latestByPost = new Map()
  for (const quote of allQuotes) {
    const existing = latestByPost.get(quote.postId)
    if (!existing || 
        new Date(quote.updatedAt) > new Date(existing.updatedAt)) {
      latestByPost.set(quote.postId, quote)
    }
  }
  
  const dedupedQuotes = Array.from(latestByPost.values())
  setQuotedPosts(dedupedQuotes)
}
```

**Quote Status Mapping:**
```typescript
'PENDING'   → 'Đang chờ phản hồi' (amber badge)
'ACCEPTED'  → 'Đã được chấp nhận' (emerald badge)
'IN_CHAT'   → 'Đang trao đổi' (cyan badge)
'REJECTED'  → 'Đã bị từ chối' (rose badge)
'CANCELLED' → 'Đã hủy' (slate badge)
```

---

### 5. Saved Posts (Favorites/Wishlist)
**Location:** `/yeu-thich/page.tsx`

**Type:** Saved/favorited posts and workers

**Status:** ⚠️ Currently using mock data

**Mock Features:**
- Worker profile cards (with emoji avatars)
- Shows: name, service, rating, reviews, jobs completed, location
- Specialties listed
- Experience and hourly rate
- Online status indicator

**Expected Real Implementation:**
- Should fetch saved posts from `savedPostService`
- Could filter by category, rating, location
- Real avatar images instead of emojis

**Current Mock Data:**
```typescript
interface Worker {
  id: string
  name: string
  avatar: string              // Currently: emoji
  service: string
  rating: number              // e.g., 4.9
  reviewCount: number
  completedJobs: number
  location: string
  phone: string
  specialties: string[]       // e.g., ['Điện dân dụng', 'Điện công nghiệp']
  experience: string          // e.g., '8 năm'
  hourlyRate: string          // e.g., '150,000 - 200,000đ/giờ'
  isVerified: boolean
  isOnline: boolean
  lastActive: string
}
```

---

### 6. User Profile with Tabs
**Location:** `/profile/page.tsx`

**Type:** Multi-tab profile page

**Tab-Based Sections:**

#### Tab 1: View Profile (Read-only)
- Display name, bio, avatar
- Location, contact info
- Rating (if provider)
- Verification status

#### Tab 2: Edit Profile
- Editable fields: bio, address
- Form validation
- Save via `ProfileService.updateProfile()`

#### Tab 3: Contact Info
- Phone number
- Email address
- Update via API

#### Tab 4: Display Name
- Change public display name
- Validation (3-32 characters typically)

#### Tab 5: Avatar Upload
- Image picker
- Preview before upload
- Upload via `ProfileService.uploadAvatar()`

#### Tab 6: My Posts Sub-Listing
- Similar to `/bai-dang-cua-toi`
- Shows only in profile context
- Inline loading/pagination

#### Tab 7: My Quotes Sub-Listing
- Quotes user has submitted to other posts
- Status filter
- Link to quoted posts

#### Tab 8: Provider Reviews (For Providers)
- Component: `ProviderReceivedReviewsPanel`
- Shows reviews user has received
- Rating summary
- Individual review cards

#### Tab 9: Change Password
- Current password input
- New password input
- Confirm password input
- Form validation

**Implementation:**
```typescript
type ProfileContentTab = 
  | 'view'
  | 'edit'
  | 'contact'
  | 'display-name'
  | 'avatar'
  | 'my-posts'
  | 'my-quotes'
  | 'provider-reviews'
  | 'change-password'

const [activeTab, setActiveTab] = useState<ProfileContentTab>('view')
```

---

## 🎨 Reusable Components in Lists

### SkeletonPost
Loading placeholder while fetching posts
- Pulse animation
- Gray placeholder boxes
- Same dimensions as actual PostCard

### SkeletonPostDetail
Loading placeholder for detail pages

### SkeletonProfile
Loading placeholder for profile data

### PostCard (Implicit Pattern)
Used in all post listings:
```typescript
// Common structure across list pages
<div className="app-card">
  {/* Author info */}
  {/* Post content */}
  {/* Status badge */}
  {/* Action buttons */}
</div>
```

### Status Badge Components
```typescript
// Dynamic styling based on status
const statusColors = {
  'OPEN': 'bg-emerald-100 text-emerald-700',
  'CLOSED': 'bg-slate-100 text-slate-700',
  'PENDING': 'bg-amber-100 text-amber-700',
  'ACCEPTED': 'bg-emerald-100 text-emerald-700',
  'COMPLETED': 'bg-blue-100 text-blue-700',
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Filter/Search Component             │
│ (useState, setFilters)              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ useEffect + API Service Call        │
│ (PostService.getFeed, etc.)         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Fetch/Loading State                 │
│ Show: SkeletonPost / Loading UI     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Response Data                       │
│ (FeedResponseDto, SearchResponse)   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ setState(data)                      │
│ Trigger re-render                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Render List                         │
│ Map data → Card components          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ UI Display                          │
│ PostCards, StatusBadges, Actions    │
└─────────────────────────────────────┘
```

---

## Summary Table

| Page | Route | List Type | Filter | Search | Pagination | Auth |
|------|-------|-----------|--------|--------|------------|------|
| Home Feed | `/home` | Posts | Status tabs | Yes | Cursor | No |
| My Posts | `/bai-dang-cua-toi` | Own posts | Status | No | Offset | Yes |
| Orders | `/don-hang` | Orders | Status + role | Number | Offset | Yes |
| Quotes/Cart | `/gio-hang` | Quotes received | Status | No | Single load | Yes |
| Saved Posts | `/yeu-thich` | Mock workers | - | - | - | Maybe |
| Profile Tabs | `/profile` | Multiple | By tab | - | In-tab | Yes |
| Global Search | `/posts/search` | Posts + providers | - | Full search | Limit | No |

---

## 🚀 Implementation Checklist for New Search/List Features

- [ ] Create `/app/[page-name]/page.tsx` with 'use client'
- [ ] Wrap with `<AppShell>` and `<Header>`
- [ ] Add filter state: `const [filter, setFilter] = useState()`
- [ ] Add loading state: `const [loading, setLoading] = useState(true)`
- [ ] Add error state: `const [error, setError] = useState('')`
- [ ] Add data state: `const [data, setData] = useState([])`
- [ ] Create useEffect for initial load with auth check
- [ ] Call appropriate service: `ServiceClass.method()`
- [ ] Handle error with try-catch and user message
- [ ] Show loading UI while fetching (Skeleton or spinner)
- [ ] Render list of cards in Map function
- [ ] Add filter UI (dropdowns/inputs) before list
- [ ] Add search debounce if needed
- [ ] Style with Tailwind + design tokens
- [ ] Test on mobile and desktop
- [ ] Add pagination/load-more if needed
