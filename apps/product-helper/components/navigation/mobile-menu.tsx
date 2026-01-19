'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, FolderOpen, MessageSquare, Settings, LogOut, Moon, Sun, CircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { signOut } from '@/app/(login)/actions'
import { useRouter } from 'next/navigation'

const menuItems = [
  { href: '/projects', icon: Home, label: 'Home' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/projects') {
      return pathname === '/projects' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    router.push('/')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CircleIcon className="h-6 w-6 text-orange-500" />
            <span>Product Helper</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-2">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg",
                  "transition-colors duration-200",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <hr className="my-4 border-border" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg w-full",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "transition-colors duration-200"
            )}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg w-full",
              "text-destructive hover:bg-destructive/10",
              "transition-colors duration-200"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
