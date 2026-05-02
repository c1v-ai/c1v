'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { signOut } from '@/app/(login)/actions'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    setMoreOpen(false)
    router.push('/')
  }

  const tabBase = cn(
    'flex flex-col items-center justify-center flex-1 h-full',
    'transition-colors duration-200 select-none touch-manipulation',
    'min-w-[64px]',
    'active:scale-95 active:opacity-80'
  )

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'md:hidden',
        'bg-background border-t border-border',
        'pb-[env(safe-area-inset-bottom)]'
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
                tabBase,
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('h-5 w-5 mb-1', active && 'stroke-[2.5px]')}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="More options"
              className={cn(
                tabBase,
                moreOpen
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MoreHorizontal
                className={cn('h-5 w-5 mb-1', moreOpen && 'stroke-[2.5px]')}
              />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
          >
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1">
              <Link
                href="/account"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted touch-manipulation"
              >
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted touch-manipulation"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                type="button"
                onClick={() =>
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                }
                className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-foreground hover:bg-muted touch-manipulation"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              <hr className="my-2 border-border" />
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-destructive hover:bg-destructive/10 touch-manipulation"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
