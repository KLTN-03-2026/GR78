# Frontend Components Reference Guide

## 📦 All Components by Category

### 🏗️ Layout & Shell Components

#### `AppShell.tsx`
- **Purpose:** Main layout wrapper for all pages
- **Props:** `children: ReactNode`
- **Features:**
  - Responsive container
  - Mobile bottom navigation (< md / 768px)
  - Padding adjustment for bottom nav on mobile
  - Background: `bg-surface-lowest`
- **Usage:**
  ```typescript
  export default function Page() {
    return (
      <AppShell>
        <Header />
        <main>{content}</main>
      </AppShell>
    )
  }
  ```

#### `AppBrandHeader.tsx`
- **Purpose:** Header with logo and branding
- **Usage:** On landing page and auth pages

#### `Header.tsx`
- **Purpose:** Top navigation bar with search, notifications, profile
- **Features:**
  - Logo on left
  - Search bar in center
  - Notification badge
  - Message badge
  - Profile dropdown menu
  - Responsive design (hides some elements on mobile)
- **Props:** `currentUser?: any`
- **Real-time Updates:**
  - Unread notification count from socket
  - Unread message count from socket
- **Search Integration:**
  - Live search with dropdown results
  - Navigates to results on click

#### `MobileBottomNav.tsx`
- **Purpose:** 5-tab bottom navigation for mobile
- **Routes:**
  - 🏠 Home (`/home`)
  - 🔍 Search (`/posts/search`)
  - 💬 Messages (`/tin-nhan`)
  - 🔔 Notifications (`/thong-bao`)
  - 👤 Profile (`/profile`)
- **Features:**
  - Active tab highlighting
  - Icon + label
  - Fixed to bottom
  - Only visible < 768px (md)

#### `AppFooter.tsx`
- **Purpose:** Footer section
- **Typical Content:** Links, copyright, social

---

### 🎨 Reusable UI Components (in `components/ui/`)

#### `AppButton.tsx`
- **Props:**
  ```typescript
  interface AppButtonProps {
    variant?: 'filled' | 'outlined' | 'tonal'  // default: 'filled'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    children: ReactNode
    className?: string
    onClick?: () => void
    [other HTMLButtonElement props]
  }
  ```
- **Variants:**
  - `filled`: Solid brand color with shadow
  - `outlined`: Border with transparent background
  - `tonal`: Soft teal background
- **Example:**
  ```typescript
  <AppButton variant="filled">Save</AppButton>
  <AppButton variant="outlined">Cancel</AppButton>
  <AppButton variant="tonal">Learn More</AppButton>
  ```

#### `AppField.tsx`
- **Props:**
  ```typescript
  interface AppFieldProps {
    label?: string
    error?: string
    id?: string
    name?: string
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: 'text' | 'email' | 'password' | 'number' | etc.
  }
  ```
- **Features:**
  - Auto-ID generation
  - Label display
  - Error message in red below input
  - Focus ring with brand color
  - Hover effects
  - Disabled state support
- **Example:**
  ```typescript
  <AppField
    label="Email"
    name="email"
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={emailError}
  />
  ```

#### `AppTextarea.tsx`
- **Purpose:** Multi-line text input
- **Props:** Similar to AppField
- **Features:**
  - Expandable height
  - Label support
  - Error display

---

### 🔐 Authentication Components

#### `AuthGuard.tsx`
- **Purpose:** Protect routes based on authentication
- **Location:** `app/layout.tsx` (runs on every page)
- **Function:**
  - Checks for valid token in localStorage
  - Redirects to `/dang-nhap` if not authenticated
  - Handles session persistence

#### `AuthorCard.tsx`
- **Purpose:** Display author information in post cards
- **Shows:**
  - Avatar (clickable to profile)
  - Display name
  - Verification badge
  - Bio snippet
  - Follow/contact CTA

---

### 📱 Real-time & Communication Components

#### `SocketInitializer.tsx`
- **Purpose:** Initialize WebSocket connection on app load
- **Function:**
  - Sets up Socket.io connection
  - Subscribes to events
  - Auto-reconnect logic
- **Used In:** Imported in layout

#### `MessageList.tsx`
- **Purpose:** Display messages in chat conversation
- **Features:**
  - Scrolls to latest message
  - Shows sender info
  - Timestamps
  - Read receipts (if implemented)

#### `MessageInput.tsx`
- **Purpose:** Compose and send messages
- **Features:**
  - Text input field
  - Send button
  - Typing indicator (optional)
  - Emoji/media support (optional)

#### `ConversationItem.tsx`
- **Purpose:** Single conversation in chat list
- **Shows:**
  - Avatar of other party
  - Last message preview
  - Timestamp
  - Unread badge
  - Click to open conversation

#### `ChatQuoteFlow.tsx`
- **Purpose:** Integrated chat + quote discussion
- **Features:**
  - Chat UI
  - Quote details panel
  - Quote revision history
  - Action buttons (accept, reject)

---

### 📝 Post & Content Components

#### `SkeletonPost.tsx`
- **Purpose:** Loading placeholder for post cards
- **Features:**
  - Pulse animation
  - Same layout as real post
  - Gray placeholder boxes
- **Usage:** Show while fetching posts

#### `SkeletonPostDetail.tsx`
- **Purpose:** Loading placeholder for post detail page
- **Features:**
  - Full-width skeleton
  - Multiple sections (header, body, comments)

#### `QuoteSection.tsx`
- **Purpose:** Display quotes received on a post
- **Shows:**
  - List of quotes for a post
  - Provider info
  - Price
  - Status
  - Action buttons

---

### 👤 Profile Components

#### `SkeletonProfile.tsx`
- **Purpose:** Loading placeholder for profile data
- **Features:**
  - Avatar skeleton
  - Bio skeleton
  - Stats skeleton

#### `ProviderReceivedReviewsPanel.tsx`
- **Purpose:** Show reviews received by a provider
- **Features:**
  - Rating summary (average + count)
  - Individual review cards
  - Reviewer avatar, name, rating, comment
  - Sort by rating/date

---

### 🏢 Business/Brand Components

#### `ThoTotLogo.tsx`
- **Purpose:** Logo component
- **Used In:**
  - Header
  - Landing page
  - Auth pages
- **Props:** `className?: string` (for sizing)

---

## 📊 Component Usage Map

### By Page

#### `/home`
- `AppShell` → `Header` → `SkeletonPost` → Post cards with `AuthorCard`

#### `/posts/search`
- `AppShell` → `Header` → Search input → Results (posts + providers)

#### `/posts/[id]` (Post Detail)
- `AppShell` → `Header` → Post content → `QuoteSection` → `AuthorCard`

#### `/bai-dang-cua-toi` (My Posts)
- `AppShell` → `Header` → Filters → `SkeletonPost` → Post cards

#### `/don-hang` (Orders)
- `AppShell` → `Header` → Filters (status, role) → Order cards → Detail modal

#### `/gio-hang` (Quotes Cart)
- `AppShell` → `Header` → Quote cards → Expandable revisions → Action buttons

#### `/yeu-thich` (Saved)
- `AppShell` → `Header` → Mock worker cards → Profile preview

#### `/profile`
- `AppShell` → `Header` → Tab navigation → `SkeletonProfile` → Tab content → `ProviderReceivedReviewsPanel`

#### `/tin-nhan` (Chat)
- `AppShell` → `Header` → Chat list (`ConversationItem`) → `ConversationDetail` → `MessageList` → `MessageInput`

#### `/thong-bao` (Notifications)
- `AppShell` → `Header` → Notification list

#### `/dang-nhap` (Login)
- `AppAuthShell` → `AppBrandHeader` → Form (`AppField` → `AppButton`)

---

## 🎨 Styling Reference for Components

### Button Styling Pattern
```typescript
// Base classes
'inline-flex min-h-[52px] items-center justify-center rounded-app-lg px-app-md py-app-sm'
'text-base font-semibold tracking-tight transition-[background-color,color,box-shadow,transform,opacity]'
'duration-app-medium ease-app-emphasized focus-visible:outline-none focus-visible:ring-2'
'focus-visible:ring-brand focus-visible:ring-offset-2'
'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]'

// Variant: filled
'bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25'

// Variant: outlined
'border border-outline-variant/80 bg-surface text-brand shadow-sm hover:border-brand/30 hover:bg-brand-tint/50 hover:shadow-md'

// Variant: tonal
'bg-brand-tint text-brand-dark shadow-sm hover:bg-brand/10 hover:shadow-md'
```

### Form Input Styling Pattern
```typescript
// Base
'w-full rounded-app-lg border border-outline-variant/80 bg-surface px-app-sm py-3'
'text-foreground shadow-inner-soft placeholder:text-foreground-muted/75'
'transition-[border-color,box-shadow] duration-app-fast ease-app-emphasized'

// States
'hover:border-outline-variant'
'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/18 focus:shadow-sm'
// On error:
'border-app-error focus:border-app-error focus:ring-red-600/20'
```

### Card Styling (`.app-card` utility)
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

---

## 🔄 Component Interaction Flow

```
┌──────────────┐
│  Page Load   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ AuthGuard checks     │
│ token in localStorage│
└──────┬───────────────┘
       │
       ├─ No token → Redirect to /dang-nhap
       │
       └─ Has token → Continue
              │
              ▼
         ┌──────────────┐
         │  AppShell    │
         │  + Header    │
         └──────┬───────┘
                │
                ▼
         ┌──────────────────┐
         │ Page Component   │
         │ (e.g., HomePage)│
         └──────┬───────────┘
                │
                ├─ Load data via Service
                │
                ▼
         ┌──────────────────┐
         │ Show Skeleton UI │
         │ while loading    │
         └──────┬───────────┘
                │
         API response received
                │
                ▼
         ┌──────────────────┐
         │ setState(data)   │
         │ Trigger rerender │
         └──────┬───────────┘
                │
                ▼
         ┌──────────────────┐
         │ Render list of   │
         │ cards/items      │
         └──────┬───────────┘
                │
                ▼
         ┌──────────────────────┐
         │ MobileBottomNav      │
         │ (on mobile screens)  │
         └──────────────────────┘
```

---

## 📋 Component Props Summary Table

| Component | Props | Required | Type |
|-----------|-------|----------|------|
| AppShell | children | Yes | ReactNode |
| AppButton | children, variant, disabled | children: Yes | ReactNode, 'filled'\|'outlined'\|'tonal', boolean |
| AppField | label, error, name, value, onChange | No | string, string, string, string, function |
| Header | currentUser | No | any |
| AuthGuard | - | - | - |
| MessageList | messages | Yes | Message[] |
| MessageInput | onSend | Yes | (msg: string) => void |
| ProviderReceivedReviewsPanel | reviews | Yes | Review[] |

---

## 🎯 Common Component Patterns

### Pattern 1: Form with Validation
```typescript
const [formData, setFormData] = useState({ email: '', password: '' })
const [errors, setErrors] = useState({ email: '', password: '' })

const handleSubmit = async (e) => {
  e.preventDefault()
  const newErrors = validate(formData)
  if (Object.values(newErrors).some(e => e)) {
    setErrors(newErrors)
    return
  }
  // Submit
}

return (
  <form onSubmit={handleSubmit}>
    <AppField
      label="Email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      error={errors.email}
    />
    <AppButton type="submit">Submit</AppButton>
  </form>
)
```

### Pattern 2: List with Pagination
```typescript
const [data, setData] = useState([])
const [cursor, setCursor] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadData()
}, [])

const loadData = async () => {
  setLoading(true)
  const response = await Service.getList({ limit: 20, cursor })
  setData(prev => [...prev, ...response.data])
  setCursor(response.nextCursor)
  setLoading(false)
}

const handleLoadMore = () => {
  loadData()
}

return (
  <>
    {loading && !data.length && <SkeletonComponent />}
    <div className="space-y-4">
      {data.map(item => <CardComponent key={item.id} data={item} />)}
    </div>
    {cursor && (
      <AppButton onClick={handleLoadMore}>Load More</AppButton>
    )}
  </>
)
```

### Pattern 3: Real-time Updates with Socket
```typescript
useEffect(() => {
  const handleNewMessage = (msg) => {
    setMessages(prev => [...prev, msg])
  }

  socketService.on('message', handleNewMessage)

  return () => {
    socketService.off('message', handleNewMessage)
  }
}, [])
```

---

## 🚀 Best Practices

1. **Always use AppButton/AppField** for consistency
2. **Wrap pages with AppShell** for consistent layout
3. **Check AuthService.isAuthenticated()** before private operations
4. **Use SkeletonX components** while loading
5. **Handle errors with try-catch** and show user messages
6. **Debounce search/filter inputs** to reduce API calls
7. **Use socket services** for real-time updates (chat, notifications)
8. **Responsive design:** Test on mobile and desktop
9. **Accessibility:** Use proper labels, ARIA attributes, focus states
10. **Performance:** Lazy load images, paginate large lists
