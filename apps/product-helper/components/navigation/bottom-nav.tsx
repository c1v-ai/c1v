'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/projects', icon: Home, label: 'Home' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  // Chat link will go to most recent project's chat or a default
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/settings', icon: User, label: 'Account' },
]

export function BottomNav() {
  const pathname = usePathname()

  // Check if current path matches nav item (handles nested routes)
  const isActive = (href: string) => {
    if (href === '/projects') {
      return pathname === '/projects' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "md:hidden", // Only show on mobile (< 768px)
        "bg-background border-t border-border",
        "pb-[env(safe-area-inset-bottom)]" // iOS safe area
      )}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "transition-colors duration-200",
                "min-w-[64px]", // Minimum touch target width
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mb-1",
                  active && "stroke-[2.5px]" // Bolder stroke when active
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
