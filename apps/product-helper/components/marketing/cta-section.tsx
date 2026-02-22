'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="px-4 sm:px-[5%] py-16 md:py-24 lg:py-28 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1>
            <motion.span
              initial={{ x: '-30%', opacity: 0 }}
              whileInView={{ x: '0%', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
              className="block"
            >
              Your next build deserves
            </motion.span>
          </h1>
          <h1>
            <motion.span
              initial={{ x: '30%', opacity: 0 }}
              whileInView={{ x: '0%', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.1 }}
              className="block mb-5 md:mb-6"
            >
              architecture, not guesswork.
            </motion.span>
          </h1>
          <p className="text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto">
            Every hour you spend without a spec is an hour you&apos;ll spend rewriting
            later. Get your architecture right before line one.
          </p>
          <Button asChild size="lg">
            <Link href="/sign-up">
              <Sparkles className="size-4" />
              Let&apos;s get building
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
