'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MarketingFooter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email });
    setEmail('');
  };

  return (
    <footer className="px-4 sm:px-[5%] py-12 md:py-18 lg:py-20 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-x-[8vw] gap-y-12 pb-8 md:gap-y-16 md:pb-10 lg:grid-cols-[0.75fr_1fr] lg:gap-y-4 lg:pb-12">
          {/* Left: Logo + email */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center mb-5 md:mb-6">
              <CircleIcon className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold text-foreground">Product Helper</span>
            </Link>
            <p className="mb-5 md:mb-6 text-muted-foreground">
              Get updates on new agents and spec improvements.
            </p>
            <div className="w-full max-w-md">
              <form
                className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[1fr_max-content] md:gap-y-4"
                onSubmit={handleSubmit}
              >
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                We respect your inbox. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Right: 3-column nav */}
          <div className="grid grid-cols-1 items-start gap-y-10 sm:grid-cols-3 sm:gap-x-6 md:gap-x-8 md:gap-y-4">
            <div className="flex flex-col items-start">
              <h2 className="mb-3 font-semibold md:mb-4">Product</h2>
              <ul className="flex flex-col items-start gap-2">
                <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it works</a></li>
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="mb-3 font-semibold md:mb-4">Developers</h2>
              <ul className="flex flex-col items-start gap-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">MCP server</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">API docs</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Integration guide</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</a></li>
              </ul>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="mb-3 font-semibold md:mb-4">Community</h2>
              <ul className="flex flex-col items-start gap-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Discord</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">X / Twitter</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">YouTube</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-border" />
        <div className="flex flex-col-reverse items-start justify-between pb-4 pt-6 text-sm md:flex-row md:items-center md:pb-0 md:pt-8">
          <p className="mt-6 md:mt-0 text-muted-foreground">
            Made by C1V Ventures &middot; &copy; 2026 C1V Ventures. All rights reserved.
          </p>
          <ul className="flex gap-x-6 text-sm">
            <li><a href="#" className="text-muted-foreground hover:text-foreground underline">Privacy policy</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground underline">Terms of service</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
