'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star } from 'lucide-react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const leftTestimonials = [
  {
    quote: 'The specs were already there. We built against something real instead of guessing.',
    name: 'Maya Rodriguez',
    role: 'CTO, Momentum',
  },
  {
    quote: 'Three weeks of architecture meetings became one conversation with the AI. We shipped faster.',
    name: 'James Park',
    role: 'Founder, Nexus',
  },
  {
    quote: 'The API contracts were exact. Our frontend and backend aligned on the first try.',
    name: 'Marcus Webb',
    role: 'Lead Developer, Sync',
  },
  {
    quote: 'We had a blueprint before we wrote a line of code. Everything else was just execution.',
    name: 'Elena Vasquez',
    role: 'Technical Lead, Build',
  },
];

const rightTestimonials = [
  {
    quote: 'We stopped arguing about architecture and started shipping. The specs were there, waiting. Everything else followed.',
    name: 'Alex Chen',
    role: 'Founder, Velocity Labs',
  },
  {
    quote: 'Our developers stopped asking questions and started building. The specs were complete.',
    name: 'David Chen',
    role: 'Engineering Manager, Scale',
  },
  {
    quote: 'No more arguing about data models. The PRD settled it. Everyone moved forward.',
    name: 'Sarah Mitchell',
    role: 'Product Lead, Forge',
  },
  {
    quote: 'The AI understood our product better than we did. The specs proved it.',
    name: 'Tom Harrison',
    role: 'Founder, Velocity',
  },
  {
    quote: 'We went from idea to production-ready specs in an afternoon. No rework needed.',
    name: 'Lisa Patel',
    role: 'Solo Founder, Clarity',
  },
];

function Stars() {
  return (
    <div className="mb-4 flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="size-4 fill-[var(--color-tangerine)] text-[var(--color-tangerine)]" />
      ))}
    </div>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="rounded-xl border border-border p-6 md:p-8 bg-background">
      <Stars />
      <blockquote className="text-sm md:text-base mb-5 md:mb-6 text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const isMobile = useIsMobile();

  const leftY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ['20vh', '-70vh'] : ['-10rem', '5rem'],
  );
  const rightY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ['20vh', '-70vh'] : ['10rem', '-5rem'],
  );

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden px-4 sm:px-[5%] py-12 md:py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid min-h-[80vh] auto-cols-fr grid-cols-1 overflow-hidden border border-border rounded-xl lg:h-[90vh] lg:min-h-[auto] lg:grid-cols-[0.75fr_1fr] lg:overflow-visible">
          {/* Left — heading */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <h2 className="mb-5 md:mb-6">Built right</h2>
            <p className="text-muted-foreground">Real builders share what works</p>
          </div>

          {/* Right — parallax cards */}
          <div className="grid h-screen auto-cols-fr grid-cols-1 content-center items-center gap-4 overflow-hidden border-t border-border px-4 md:h-[70vh] md:grid-cols-2 md:px-8 lg:h-auto lg:border-t-0 lg:border-l lg:pl-0 lg:pr-12">
            <motion.div className="grid gap-4" style={{ y: leftY }}>
              {leftTestimonials.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </motion.div>
            <motion.div className="grid gap-4" style={{ y: rightY }}>
              {rightTestimonials.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
