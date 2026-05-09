# Frontend Styling Guide - Tailwind + Material Design 3

## 🎨 Quick Color Reference

### Primary Colors
```css
/* Brand (Teal) */
--color-seed: #14b8a6;              /* bg-brand, text-brand */
--color-seed-dark: #0d9488;         /* bg-brand-dark, hover states */
--color-seed-light: #2dd4bf;        /* bg-brand-light, highlights */
--color-brand-tint: #e6fffa;        /* bg-brand-tint, soft backgrounds */
```

### Semantic Colors (Text & Surfaces)
```css
--color-surface: #fffbfe;                    /* bg-surface, card backgrounds */
--color-surface-container-lowest: #f7fafa;  /* bg-surface-lowest, page background */
--color-surface-container-highest: #e7eef0; /* darker surface */
--color-on-surface: #1d1b20;                 /* text-foreground, primary text */
--color-on-surface-variant: #49454f;        /* text-foreground-muted, secondary text */
--color-outline: #79747e;                    /* border colors, dividers */
--color-outline-variant: rgba(121, 116, 126, 0.35); /* subtle borders */
--color-error: #b3261e;                      /* bg-app-error, error text */
--color-on-error: #ffffff;                   /* text on error backgrounds */
```

### Tailwind Usage
```html
<!-- Primary brand color -->
<button class="bg-brand text-white">Submit</button>      <!-- Solid brand -->
<button class="border border-brand">Outlined</button>     <!-- Brand border -->
<button class="text-brand">Link</button>                  <!-- Brand text -->

<!-- Surfaces -->
<div class="bg-surface">Card background</div>
<div class="bg-surface-lowest">Page background</div>
<div class="bg-surface-highest">Elevated surface</div>

<!-- Text colors -->
<p class="text-foreground">Primary text</p>
<p class="text-foreground-muted">Secondary/muted text</p>

<!-- Semantic -->
<div class="border border-app-outline">With outline</div>
<div class="text-app-error">Error message</div>
```

---

## 📏 Spacing System (8px Grid)

### Tailwind Spacing Classes
```css
space-app-xxs: 4px    /* p-app-xxs, m-app-xxs, gap-app-xxs */
space-app-xs: 8px
space-app-sm: 16px
space-app-md: 24px
space-app-lg: 32px
space-app-xl: 40px
space-app-xxl: 48px
```

### Common Usage Patterns
```html
<!-- Padding -->
<div class="px-app-md py-app-sm">Card with padding</div>    <!-- 24px horiz, 16px vert -->

<!-- Margin -->
<div class="mb-app-lg">Section with bottom margin</div>     <!-- 32px margin-bottom -->
<div class="mt-app-sm">Heading with top margin</div>        <!-- 16px margin-top -->

<!-- Gap (flex/grid) -->
<div class="flex gap-app-md">Items with 24px gap</div>
<div class="grid grid-cols-3 gap-app-lg">Grid with 32px gap</div>

<!-- Width/Height -->
<div class="w-app-md h-app-md">Square 24x24</div>

<!-- Space between elements -->
<div class="space-y-app-md">Children have 24px vertical gap</div>
```

---

## 🔲 Border Radius System

### Tailwind Radius Classes
```css
rounded-app-sm: 8px      /* Small buttons, inputs */
rounded-app-md: 12px     /* Medium components */
rounded-app-lg: 16px     /* Cards, dialogs */
rounded-app-xl: 20px     /* Large components */
rounded-app-xxl: 24px    /* Extra large components */
rounded-app-sheet: 24px  /* Bottom sheets */
```

### Usage Examples
```html
<!-- Button -->
<button class="rounded-app-lg px-app-md py-app-sm">
  Standard button
</button>

<!-- Card -->
<div class="rounded-app-lg border bg-surface p-app-md">
  Card container
</div>

<!-- Avatar (circular) -->
<img class="rounded-full w-12 h-12" src="avatar.jpg" />

<!-- Input -->
<input class="rounded-app-lg px-app-sm py-3" />

<!-- Bottom sheet (mobile modal) -->
<div class="rounded-t-app-sheet">
  Bottom sheet content
</div>
```

---

## ⏱️ Motion & Animation

### Timing
```css
duration-app-fast: 160ms      /* Fast interactions (hover, focus) */
duration-app-medium: 260ms    /* Standard animations (transitions) */
duration-app-slow: 380ms      /* Slow animations (entrance effects) */
```

### Easing Functions
```css
ease-app-emphasized: cubic-bezier(0.2, 0, 0, 1);    /* Emphasized, snappy */
ease-app-decelerate: cubic-bezier(0.3, 0, 0.67, 0); /* Decelerate, smooth exit */
```

### Usage Examples
```html
<!-- Hover elevation transition -->
<div class="transition-shadow duration-app-medium ease-app-emphasized hover:shadow-lg">
  Hover me
</div>

<!-- Page entrance animation -->
<div class="page-enter">
  Fades in on page load
</div>

<!-- Button active state -->
<button class="active:scale-[0.99] transition-transform duration-app-fast">
  Press me
</button>

<!-- Focus ring -->
<input class="focus:ring-2 focus:ring-brand duration-app-fast" />
```

---

## 🎯 Shadow System (Elevation)

### Shadow Variables
```css
--shadow-xs: 0 1px 2px rgba(29, 27, 32, 0.04);
--shadow-sm: 0 1px 3px rgba(...), 0 1px 2px rgba(...);
--shadow-md: 0 4px 12px rgba(...), 0 2px 4px rgba(...);
--shadow-lg: 0 12px 40px rgba(...), 0 4px 12px rgba(20, 184, 166, 0.06);
--shadow-float: 0 24px 48px -12px rgba(29, 27, 32, 0.12);
```

### Tailwind Shadow Classes
```css
shadow-app-card: var(--shadow-sm)       /* Cards at rest */
shadow-app-card-hover: var(--shadow-md) /* Cards on hover */
shadow-app-nav: custom nav shadow
shadow-app-bar: var(--shadow-xs)        /* App bar */
shadow-app-header: var(--shadow-sm)     /* Header */
shadow: var(--shadow-md)                /* Elevated */
shadow-float: var(--shadow-float)       /* Floating action buttons */
shadow-inner-soft: inset soft shadow    /* Inset effect */
```

### Usage Examples
```html
<!-- Card at rest -->
<div class="rounded-app-lg bg-surface shadow-app-card hover:shadow-app-card-hover">
  Card
</div>

<!-- Elevated component -->
<div class="shadow">Elevated element</div>

<!-- Navigation bar -->
<nav class="shadow-app-nav">Navigation</nav>

<!-- Floating action button -->
<button class="fixed bottom-8 right-8 shadow-float rounded-full bg-brand text-white">
  +
</button>
```

---

## 🔧 Utility Classes

### `.app-card`
Consistent card styling across the app:
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

**HTML:**
```html
<div class="app-card p-app-md">
  Card content with consistent styling
</div>
```

### `.app-container`
Responsive max-width container with adaptive padding:
```css
max-width: var(--app-content-max);  /* 1280px */
margin: 0 auto;
padding: 0 var(--space-sm);         /* 16px mobile */

@media (min-width: 640px) {
  padding: 0 var(--space-md);       /* 24px tablet */
}

@media (min-width: 1024px) {
  padding: 0 var(--space-lg);       /* 32px desktop */
}
```

**HTML:**
```html
<div class="app-container">
  Content with responsive max-width and padding
</div>
```

### `.app-main-grid`
12-column CSS Grid for complex layouts:
```html
<div class="app-main-grid">
  <div class="col-span-12 sm:col-span-6 lg:col-span-4">
    Grid item
  </div>
</div>
```

### `.hover-lift`
Elevation + scale animation on hover:
```html
<div class="hover-lift cursor-pointer">
  Hover to lift me!
</div>
```

### `.page-enter`
Fade-in entrance animation:
```html
<main class="page-enter">
  Page content fades in
</main>
```

---

## 🎨 Component Styling Patterns

### Button Component Styles
```typescript
// Base button (always applied)
'inline-flex min-h-[52px] items-center justify-center'
'rounded-app-lg px-app-md py-app-sm'
'text-base font-semibold tracking-tight'
'transition-[background-color,color,box-shadow,transform,opacity]'
'duration-app-medium ease-app-emphasized'
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
'disabled:cursor-not-allowed disabled:opacity-50'
'active:scale-[0.99]'

// Variant: filled (default)
'bg-brand text-white'
'shadow-md shadow-brand/20'
'hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25'

// Variant: outlined
'border border-outline-variant/80 bg-surface text-brand'
'shadow-sm'
'hover:border-brand/30 hover:bg-brand-tint/50 hover:shadow-md'

// Variant: tonal
'bg-brand-tint text-brand-dark'
'shadow-sm'
'hover:bg-brand/10 hover:shadow-md'
```

**CSS Classes for Copy:**
```html
<!-- Filled Button -->
<button class="inline-flex min-h-[52px] items-center justify-center rounded-app-lg px-app-md py-app-sm text-base font-semibold tracking-tight bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25 transition-all duration-app-medium ease-app-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.99]">
  Submit
</button>

<!-- Outlined Button -->
<button class="inline-flex min-h-[52px] items-center justify-center rounded-app-lg px-app-md py-app-sm border border-outline-variant/80 bg-surface text-brand shadow-sm hover:border-brand/30 hover:bg-brand-tint/50 hover:shadow-md transition-all duration-app-medium ease-app-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
  Cancel
</button>

<!-- Tonal Button -->
<button class="inline-flex min-h-[52px] items-center justify-center rounded-app-lg px-app-md py-app-sm bg-brand-tint text-brand-dark shadow-sm hover:bg-brand/10 hover:shadow-md transition-all duration-app-medium ease-app-emphasized">
  Learn More
</button>
```

### Form Input Styles
```typescript
// Base input
'w-full rounded-app-lg border border-outline-variant/80'
'bg-surface px-app-sm py-3 text-foreground'
'shadow-inner-soft placeholder:text-foreground-muted/75'
'transition-[border-color,box-shadow] duration-app-fast ease-app-emphasized'

// State: hover
'hover:border-outline-variant'

// State: focus
'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/18 focus:shadow-sm'

// State: error
'border-app-error'
'focus:border-app-error focus:ring-red-600/20'
```

**CSS Classes for Copy:**
```html
<!-- Normal Input -->
<input class="w-full rounded-app-lg border border-outline-variant/80 bg-surface px-app-sm py-3 text-foreground placeholder:text-foreground-muted/75 transition-[border-color,box-shadow] duration-app-fast ease-app-emphasized hover:border-outline-variant focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/18 focus:shadow-sm" />

<!-- Error Input -->
<input class="w-full rounded-app-lg border border-app-error bg-surface px-app-sm py-3 text-foreground focus:border-app-error focus:outline-none focus:ring-2 focus:ring-red-600/20" />
```

### Card Component Styles
```html
<div class="app-card p-app-md">
  Card with consistent styling
</div>

<!-- Or custom card -->
<div class="rounded-app-lg border border-outline-variant/80 bg-surface shadow-app-card p-app-md hover:shadow-app-card-hover transition-shadow duration-app-medium">
  Card with hover effect
</div>
```

---

## 📐 Responsive Design

### Breakpoints
```css
sm: 640px   /* Tablets -->
md: 768px   /* Key breakpoint: bottom nav threshold -->
lg: 1024px  /* Desktop -->
xl: 1280px  /* Large desktop -->
2xl: 1536px /* Extra large -->
```

### Responsive Utilities
```html
<!-- Hide on mobile, show on tablet+ -->
<div class="hidden md:block">
  Desktop only
</div>

<!-- Show on mobile, hide on tablet+ -->
<div class="md:hidden">
  Mobile only
</div>

<!-- Responsive padding -->
<div class="p-app-sm md:p-app-md lg:p-app-lg">
  Responsive padding
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-app-md">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<!-- Responsive text size -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  Responsive heading
</h1>
```

---

## 🌓 Dark Mode Support (Optional)

Currently using Material Design 3 light mode. To add dark mode support:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1c1b1f;
    --color-on-surface: #e7e0ec;
    /* ... update all colors for dark mode */
  }
}
```

---

## 🎯 Practical Styling Examples

### Example 1: Hero Section
```html
<section class="app-container py-app-xxl">
  <div class="relative">
    <!-- Background gradient (decorative) -->
    <div class="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand/25 blur-[140px] pointer-events-none" />
    
    <!-- Content -->
    <div class="relative z-10">
      <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-app-md">
        Hero Title
      </h1>
      <p class="text-lg text-foreground-muted mb-app-lg max-w-2xl">
        Hero description
      </p>
      <div class="flex gap-app-md">
        <button class="bg-brand text-white rounded-app-lg px-app-lg py-app-md font-semibold hover:bg-brand-dark">
          Primary CTA
        </button>
        <button class="border border-outline-variant text-brand rounded-app-lg px-app-lg py-app-md font-semibold hover:bg-brand-tint/50">
          Secondary CTA
        </button>
      </div>
    </div>
  </div>
</section>
```

### Example 2: Card List
```html
<div class="app-container py-app-lg">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-app-md">
    {items.map(item => (
      <div key={item.id} class="app-card p-app-md hover:shadow-app-card-hover cursor-pointer transition-shadow">
        <img src={item.image} class="w-full rounded-app-md mb-app-md" />
        <h3 class="text-lg font-semibold text-foreground mb-app-xs">
          {item.title}
        </h3>
        <p class="text-sm text-foreground-muted mb-app-md">
          {item.description}
        </p>
        <button class="w-full bg-brand-tint text-brand rounded-app-lg py-app-sm font-semibold hover:bg-brand/10">
          Learn More
        </button>
      </div>
    ))}
  </div>
</div>
```

### Example 3: Form
```html
<form class="app-container max-w-2xl py-app-lg space-y-app-md">
  <div>
    <label class="block text-sm font-medium text-foreground mb-1.5">
      Email
    </label>
    <input
      type="email"
      class="w-full rounded-app-lg border border-outline-variant/80 bg-surface px-app-sm py-3 focus:border-brand focus:ring-2 focus:ring-brand/18"
      placeholder="your@email.com"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-foreground mb-1.5">
      Message
    </label>
    <textarea
      class="w-full rounded-app-lg border border-outline-variant/80 bg-surface px-app-sm py-3 focus:border-brand focus:ring-2 focus:ring-brand/18 min-h-32"
      placeholder="Your message..."
    />
  </div>

  <div class="flex gap-app-md pt-app-md">
    <button type="submit" class="bg-brand text-white rounded-app-lg px-app-lg py-app-sm font-semibold hover:bg-brand-dark flex-1">
      Submit
    </button>
    <button type="reset" class="border border-outline-variant rounded-app-lg px-app-lg py-app-sm font-semibold hover:bg-surface-highest">
      Reset
    </button>
  </div>
</form>
```

---

## 📝 Quick Style Copy-Paste Library

### Buttons
```html
<!-- Large primary button -->
<button class="px-app-lg py-app-md rounded-app-lg bg-brand text-white font-semibold hover:bg-brand-dark">

<!-- Medium outline button -->
<button class="px-app-md py-app-sm rounded-app-lg border border-brand text-brand font-semibold hover:bg-brand-tint/30">

<!-- Small tonal button -->
<button class="px-app-sm py-2 rounded-app-md bg-brand-tint text-brand-dark text-sm font-semibold hover:bg-brand/10">
```

### Text
```html
<!-- Primary heading -->
<h1 class="text-3xl md:text-4xl font-bold text-foreground">

<!-- Secondary heading -->
<h2 class="text-2xl md:text-3xl font-semibold text-foreground">

<!-- Body text -->
<p class="text-base text-foreground leading-relaxed">

<!-- Muted text -->
<span class="text-sm text-foreground-muted">

<!-- Error text -->
<p class="text-sm text-app-error">
```

### Containers
```html
<!-- Full-width section with padding -->
<section class="app-container py-app-lg">

<!-- Card container -->
<div class="app-card p-app-md">

<!-- Grid layout -->
<div class="app-main-grid">
```

### Spacing
```html
<!-- Margin bottom -->
<div class="mb-app-md">                   <!-- 24px -->

<!-- Padding -->
<div class="px-app-md py-app-sm">         <!-- 24px h, 16px v -->

<!-- Gap (flex) -->
<div class="flex gap-app-md">             <!-- 24px -->

<!-- Space between children -->
<div class="space-y-app-lg">              <!-- 32px vertical -->
```

---

## 🔍 Testing Styles

### Check Responsiveness
```bash
# Test at different breakpoints:
# 360px (mobile), 640px (tablet), 1024px (desktop), 1280px (large)
```

### Verify Colors
```html
<!-- Ensure sufficient contrast -->
<div class="bg-brand text-white">  <!-- Pass: High contrast -->
<div class="bg-brand-tint text-brand-dark">  <!-- Pass: Acceptable contrast -->
```

### Motion Testing
```css
/* For users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
