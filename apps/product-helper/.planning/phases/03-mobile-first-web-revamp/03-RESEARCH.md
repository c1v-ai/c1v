# Phase 3: Mobile-First & Web Revamp - Research

**Researched:** 2026-01-19
**Domain:** Mobile-first responsive design, PWA implementation, dark mode theming
**Confidence:** HIGH

## Summary

This phase requires implementing three major features: light/dark mode with system preference detection, PWA capabilities for installability and offline support, and a mobile-first navigation overhaul. The research covers the standard stack for each concern, integration patterns with the existing Next.js 15 + Tailwind CSS v4 codebase, and critical pitfalls to avoid.

The codebase already has foundational dark mode CSS variables defined in `theme.css` and `globals.css`, but lacks the runtime theme switching mechanism. The project uses Turbopack for development (`next dev --turbopack`), which introduces compatibility constraints for PWA tooling. Mobile navigation is currently desktop-centric with a hidden nav at smaller breakpoints.

**Primary recommendation:** Use next-themes for theme switching (compatible with existing CSS variables), implement PWA via Next.js native manifest + manual service worker (Turbopack-safe), and adopt a bottom navigation pattern for mobile using Motion for React gestures.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | 0.4.x | Theme management with system preference | De facto standard for Next.js dark mode, prevents flash, SSR-safe |
| Motion (framer-motion) | 11.x | Touch gestures, animations | Industry standard for React gestures and micro-interactions |
| web-push | 3.x | VAPID push notifications | Server-side push notification delivery |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @serwist/next | 9.x | Service worker generation | Only if Turbopack is disabled; full offline-first PWA |
| next-pwa-pack | 1.x | Zero-config PWA | Alternative for basic PWA with Turbopack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Manual implementation | More control but more code, flash prevention is complex |
| @serwist/next | Manual service worker | Less magic, Turbopack compatible, more boilerplate |
| Motion | react-use-gesture | Lighter weight but less polish, fewer examples |

**Installation:**
```bash
npm install next-themes framer-motion web-push
```

## Architecture Patterns

### Recommended Project Structure
```
app/
  layout.tsx                  # ThemeProvider wrapper
  manifest.ts                 # PWA manifest (Next.js native)
  sw-register.ts             # Service worker registration client component
components/
  theme/
    theme-provider.tsx       # next-themes wrapper (client component)
    mode-toggle.tsx          # Theme switch UI component
  navigation/
    bottom-nav.tsx           # Mobile bottom navigation
    mobile-menu.tsx          # Hamburger menu drawer
    nav-item.tsx             # Shared navigation item
  layout/
    safe-area-provider.tsx   # iOS safe area handling
public/
  sw.js                      # Service worker (manual or generated)
  icons/                     # PWA icons (192x192, 512x512)
lib/
  hooks/
    use-media-query.ts       # Responsive breakpoint detection
    use-safe-area.ts         # Safe area inset hook
```

### Pattern 1: Theme Provider Setup
**What:** Client-only ThemeProvider wrapping the app with SSR-safe hydration
**When to use:** Root layout for all pages requiring theme support
**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
// components/theme/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from "@/components/theme/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 2: Tailwind CSS v4 Dark Mode with Class Selector
**What:** Configure Tailwind v4 to use `.dark` class selector instead of media query
**When to use:** When using next-themes with attribute="class"
**Example:**
```css
/* Source: https://tailwindcss.com/docs/dark-mode */
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### Pattern 3: PWA Manifest with Next.js Native API
**What:** Type-safe manifest generation via app/manifest.ts
**When to use:** All PWAs - built into Next.js, no extra dependencies
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Product Helper',
    short_name: 'PrdHelper',
    description: 'AI-Powered PRD Generation',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0A5C4E',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

### Pattern 4: Manual Service Worker for Turbopack Compatibility
**What:** Hand-written service worker registered via client component
**When to use:** When using Turbopack (default in Next.js 15 dev)
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        // Add critical assets
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// components/sw-register.tsx
'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
  }, [])
  return null
}
```

### Pattern 5: Bottom Navigation for Mobile
**What:** Fixed bottom nav visible on mobile, hidden on desktop
**When to use:** Mobile-first apps with 3-5 primary destinations
**Example:**
```typescript
// components/navigation/bottom-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/projects', icon: Home, label: 'Home' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/settings', icon: User, label: 'Account' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

### Pattern 6: iOS Safe Area Handling
**What:** Viewport meta and CSS env() for notch/home indicator
**When to use:** All PWAs targeting iOS home screen installation
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/env
// app/layout.tsx viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Critical for iOS safe areas
}

// In metadata
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Product Helper',
  },
}
```

```css
/* CSS for safe area handling */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

html {
  min-height: calc(100% + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

### Pattern 7: Touch Gestures with Motion
**What:** Swipe gestures for drawer/sheet interactions
**When to use:** Mobile navigation drawers, swipeable cards
**Example:**
```typescript
// Source: https://motion.dev/docs/react-gestures
import { motion } from 'framer-motion'

function SwipeableDrawer({ isOpen, onClose, children }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -100) onClose()
      }}
      style={{ touchAction: 'pan-y' }} // Critical for touch devices
    >
      {children}
    </motion.div>
  )
}
```

### Anti-Patterns to Avoid
- **Rendering theme-dependent UI before hydration:** `useTheme()` returns undefined on server. Always check `mounted` state before showing theme-specific content.
- **Using `sm:` for mobile styles:** Tailwind is mobile-first. Unprefixed utilities are for mobile, breakpoint prefixes are for larger screens.
- **Multiple viewport meta tags:** Causes conflicts on iOS. Use single Next.js viewport export.
- **Missing touch-action CSS:** Pan/drag gestures fail on touch devices without `touch-action: none` or appropriate value.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme flash prevention | Custom inline script | next-themes | Handles localStorage, media queries, script injection, hydration |
| System preference detection | matchMedia listeners | next-themes enableSystem | Handles cross-tab sync, preference changes, SSR |
| Service worker caching | Raw cache API | Workbox strategies (via Serwist) | Tested caching strategies, cache invalidation, versioning |
| Bottom nav safe areas | Manual padding calc | CSS env() + Tailwind | Browser handles notch detection, future-proof |
| Touch gesture physics | Manual drag calculation | Motion drag | Momentum, constraints, velocity-based animations |
| PWA manifest | JSON file | app/manifest.ts | Type-safe, dynamic values, co-located with app |

**Key insight:** Theme switching and PWA installation have subtle edge cases (flash, hydration, iOS quirks) that established libraries have solved over years of iteration.

## Common Pitfalls

### Pitfall 1: Theme Hydration Mismatch
**What goes wrong:** React hydration error when server renders different theme than client
**Why it happens:** Server can't read localStorage; renders default theme while client has saved preference
**How to avoid:**
1. Add `suppressHydrationWarning` to `<html>` tag
2. Don't render theme-dependent UI until `mounted` state is true
3. Use `resolvedTheme` instead of `theme` for actual current theme
**Warning signs:** Console hydration errors, brief flash of wrong theme

### Pitfall 2: Turbopack + PWA Tooling Incompatibility
**What goes wrong:** Build errors: "Webpack is configured while Turbopack is not"
**Why it happens:** @serwist/next and next-pwa use webpack plugins; Turbopack is incompatible
**How to avoid:**
1. Use manual service worker approach (public/sw.js)
2. OR disable Turbopack in dev: `next dev` instead of `next dev --turbopack`
3. OR use next-pwa-pack which claims Turbopack support
**Warning signs:** Compile-time errors mentioning webpack/turbopack conflict

### Pitfall 3: iOS PWA Safe Area Issues
**What goes wrong:** Content hidden behind notch or overlapping home indicator
**Why it happens:** Missing `viewport-fit=cover` meta or not using `env()` CSS
**How to avoid:**
1. Set `viewportFit: 'cover'` in viewport export
2. Use `pb-[env(safe-area-inset-bottom)]` for bottom nav
3. Test on actual iOS device (simulators differ)
**Warning signs:** Bottom nav partially hidden when installed to home screen

### Pitfall 4: Mobile-First Tailwind Confusion
**What goes wrong:** Styles apply on wrong screen sizes
**Why it happens:** Thinking `sm:` means "small screens" when it means "small breakpoint and up"
**How to avoid:**
1. Write mobile styles first (unprefixed)
2. Add larger breakpoints to override: `flex-col md:flex-row`
3. Remember: breakpoints are minimum widths
**Warning signs:** Desktop layout appears on mobile, mobile layout missing

### Pitfall 5: Touch Gesture Scroll Conflicts
**What goes wrong:** Drag gestures don't work or interfere with page scroll
**Why it happens:** Missing `touch-action` CSS property
**How to avoid:**
1. Add `touch-action: none` for fully draggable elements
2. Use `touch-action: pan-y` for horizontal-only drag (allows vertical scroll)
3. Use `touch-action: pan-x` for vertical-only drag
**Warning signs:** Gestures work on desktop but fail on mobile

### Pitfall 6: Service Worker Cache Staleness
**What goes wrong:** Users see outdated content even after deployment
**Why it happens:** Cache-first strategy without invalidation; no versioning
**How to avoid:**
1. Use cache versioning (v1, v2) with cleanup on activate
2. Use stale-while-revalidate for dynamic content
3. Use network-first for HTML/API responses
4. Implement cache size limits
**Warning signs:** Changes not appearing for users, "works on my machine"

## Code Examples

Verified patterns from official sources:

### Mode Toggle Component
```typescript
// Source: https://ui.shadcn.com/docs/dark-mode/next
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Hydration-Safe Theme Display
```typescript
// Source: https://github.com/pacocoursey/next-themes
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-6 w-6" /> // Placeholder with same dimensions
  }

  return (
    <span>Current theme: {resolvedTheme}</span>
  )
}
```

### Service Worker Caching Strategies
```javascript
// Source: https://developer.chrome.com/docs/workbox/caching-strategies-overview
// public/sw.js

const CACHE_NAME = 'product-helper-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/icons/icon-192x192.png',
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for HTML/API
  if (request.mode === 'navigate' || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
```

### Responsive Hook for Navigation
```typescript
// lib/hooks/use-media-query.ts
'use client'

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (deprecated) | @serwist/next or manual SW | 2024 | Original next-pwa unmaintained, Serwist is active fork |
| Tailwind v3 config | Tailwind v4 CSS-first | 2025 | No tailwind.config.ts needed, use @theme in CSS |
| framer-motion | motion (same package, new docs) | 2024 | Package renamed, same API, new documentation site |
| Cookie-based theme | localStorage + media query | Standard | next-themes handles both; cookies unnecessary |
| Separate manifest.json | app/manifest.ts | Next.js 13+ | Type-safe, co-located, dynamic |

**Deprecated/outdated:**
- `next-pwa` by shadowwalker: Unmaintained since 2023, use @serwist/next
- `prefers-color-scheme` only: Users expect manual override option
- Fixed viewport meta in _document: Use Next.js viewport export
- `darkMode: 'class'` in tailwind.config.js: Use @custom-variant in CSS for v4

## Open Questions

Things that couldn't be fully resolved:

1. **Turbopack + Serwist Compatibility**
   - What we know: Serwist has separate Turbopack docs, implies some support
   - What's unclear: Production stability with Turbopack for PWA generation
   - Recommendation: Start with manual service worker; evaluate Serwist when Turbopack leaves experimental

2. **Offline Chat Functionality Scope**
   - What we know: Service workers can cache, IndexedDB can store messages
   - What's unclear: How much offline capability is needed for an AI chat app (messages require API)
   - Recommendation: Cache navigation shell + recent projects; show "offline" state for chat

3. **Push Notification Server Infrastructure**
   - What we know: web-push + VAPID keys for server-side; subscription storage needed
   - What's unclear: Whether push notifications are in scope for Phase 3
   - Recommendation: Defer push notifications to future phase; focus on installability + offline shell

## Sources

### Primary (HIGH confidence)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - ThemeProvider API, configuration options
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official manifest, service worker patterns
- [shadcn/ui Dark Mode](https://ui.shadcn.com/docs/dark-mode/next) - Integration pattern with Next.js App Router
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) - v4 @custom-variant configuration
- [Serwist Getting Started](https://serwist.pages.dev/docs/next/getting-started) - @serwist/next setup
- [MDN env() CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/env) - Safe area insets

### Secondary (MEDIUM confidence)
- [Motion Gestures](https://motion.dev/docs/react-gestures) - Drag/pan gesture configuration
- [Chrome Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview) - Cache-first, network-first, stale-while-revalidate
- [Wisp CMS Lighthouse Guide](https://www.wisp.blog/blog/mastering-mobile-performance-a-complete-guide-to-improving-nextjs-lighthouse-scores) - Mobile performance optimization

### Tertiary (LOW confidence)
- [Medium: Tailwind v4 Dark Mode](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) - Community implementation patterns
- [Dev.to: PWA iOS](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08) - iOS PWA safe area hacks

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - next-themes and Motion are well-documented, widely used
- Architecture: HIGH - Official Next.js patterns for manifest/viewport
- PWA implementation: MEDIUM - Turbopack compatibility is evolving
- Pitfalls: HIGH - Well-documented issues with known solutions

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable domain, watch for Turbopack PWA updates)
