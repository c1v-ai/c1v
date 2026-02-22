import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="px-4 sm:px-[5%] py-16 md:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="mb-12 text-center md:mb-18 lg:mb-20">
            <div className="w-full max-w-2xl mx-auto">
              <h1 className="mb-5 md:mb-6">
                Stop building on vibes. Start building on architecture.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                prd.c1v.ai generates engineering-ready specs from your product idea — data
                schemas, APIs, infrastructure — so Cursor and Claude Code build it right
                the first time. No drift. No rework. No starting over.
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    <Sparkles className="size-4" />
                    Let&apos;s get building
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
            </div>
          </div>
          {/* Hero image — screenshot of the Product Helper home page */}
          <div className="w-full max-w-5xl mx-auto rounded-xl border border-border shadow-2xl overflow-hidden">
            <div className="bg-[var(--color-firefly)] p-1">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-white/20" />
                  <div className="size-3 rounded-full bg-white/20" />
                  <div className="size-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white/10 rounded-md py-1 px-3 text-xs text-white/60 text-center">
                    prd.c1v.ai
                  </div>
                </div>
              </div>
            </div>
            {/* App preview — mockup of the home page */}
            <div className="bg-[var(--color-firefly)] px-6 pb-8 pt-4">
              <div className="max-w-lg mx-auto text-center">
                <h2 className="text-white text-xl md:text-2xl font-bold mb-2">
                  Start your product requirements
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  Define the structure, decisions, and tradeoffs before you write code.
                </p>
                {/* Scope toggle */}
                <div className="inline-flex rounded-xl border border-white/20 mb-6">
                  <div className="px-4 py-2 text-sm text-white bg-white/10 rounded-l-xl">I have a defined scope</div>
                  <div className="px-4 py-2 text-sm text-white/60 rounded-r-xl">Help me scope</div>
                </div>
                {/* Textarea mockup */}
                <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-left mb-4">
                  <p className="text-sm text-white/40 mb-8">What are you building?</p>
                  <p className="text-xs text-white/30 mb-2">Describe your product vision. What problem does it solve? Who are the users?</p>
                  <div className="h-12" />
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-white/40">Create from scratch</span>
                    <div className="inline-flex items-center gap-2 bg-[var(--color-porcelain)] text-[var(--color-firefly)] px-4 py-2 rounded-xl text-sm font-medium">
                      <Sparkles className="size-3.5" />
                      Let&apos;s get building
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
                {/* Template chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['SaaS backend', 'Public API', 'Event-driven system', 'Internal admin tool', 'Marketplace platform'].map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1.5 rounded-xl border border-white/20 text-xs text-white/60"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
