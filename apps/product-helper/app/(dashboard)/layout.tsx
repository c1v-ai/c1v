'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, MessageSquare, FolderOpen } from 'lucide-react';
import { ModeToggle } from '@/components/theme/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { useAppKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DashboardShortcuts() {
  useAppKeyboardShortcuts();
  return null;
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/projects" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/projects" className="flex w-full items-center">
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/chat" className="flex w-full items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  return (
    <header className="border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Mobile menu button - only visible on mobile */}
        <div className="flex items-center gap-2">
          {user && <MobileMenu />}
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-orange-500" />
            <span className="ml-2 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Product Helper</span>
          </Link>
        </div>

        {/* Desktop Navigation - hidden on mobile, shows keyboard shortcuts on lg+ */}
        {user && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/projects"
              className="text-sm font-medium flex items-center gap-2 group"
              style={{ color: 'var(--text-primary)' }}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted rounded border border-border font-mono">
                <span>Cmd</span>
                <span>+</span>
                <span>Shift</span>
                <span>+</span>
                <span>H</span>
              </kbd>
            </Link>
            <Link
              href="/projects"
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Link>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col h-screen">
      <DashboardShortcuts />
      <Header />
      {/* Main content area - pb-16 on mobile for fixed bottom nav (64px) */}
      <div className="flex-1 min-h-0 flex flex-col pb-16 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </section>
  );
}
