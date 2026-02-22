import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: '2,500 credits included',
    cta: 'Get Started Free',
    href: '/sign-up',
    features: [
      'Unlimited projects',
      'AI PRD generation',
      'Auto-generated diagrams',
      'Custom MCP export',
      'CLAUDE.md + SKILL.md export',
      'Cursor IDE integration',
      'Community support',
    ],
  },
  {
    name: 'Base',
    price: 'CA$19.99',
    period: '/mo',
    description: '5,000 credits/mo · 2 team members',
    cta: 'Get Base',
    href: '/sign-up',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '5,000 credits per month',
      '2 team members',
      'Email support',
      'PRD-SPEC validation',
      'IDE sync',
    ],
  },
  {
    name: 'Plus',
    price: 'CA$49.99',
    period: '/mo',
    description: 'Unlimited credits · Unlimited seats',
    cta: 'Get Plus',
    href: '/sign-up',
    features: [
      'Everything in Base',
      'Unlimited credits',
      'Unlimited workspace members',
      'Early access to new features',
      '24/7 support + Slack channel',
      'Priority response time',
    ],
  },
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Cancel your subscription at any time with no penalties or hidden fees. Your access continues through the end of your billing cycle.',
  },
  {
    question: 'What are credits?',
    answer:
      'Credits are used when the AI generates content — starting a project uses 1,250 credits, each chat message uses 5, and regenerating an artifact uses 100. All core features are available on every plan.',
  },
  {
    question: 'Can teams use one account?',
    answer:
      'Free supports 1 user, Base supports up to 2 team members, and Plus offers unlimited workspace members who can collaborate on projects together.',
  },
  {
    question: "What's included in early access?",
    answer:
      'Plus members get first look at new features before general release. You shape the product roadmap with your feedback and requests.',
  },
  {
    question: 'Do you offer invoices?',
    answer:
      'We send invoices automatically to your email each billing cycle. Download them anytime from your account dashboard for your records.',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 sm:px-[5%] py-16 md:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="mb-3 font-semibold text-[var(--color-tangerine)] md:mb-4">Plans</p>
          <h2 className="mb-4">
            Simple pricing. Start free. Upgrade when you ship.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Pick what works for your pace
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 md:mb-24">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-xl border p-6 md:p-8 ${
                tier.badge
                  ? 'border-[var(--color-tangerine)] ring-1 ring-[var(--color-tangerine)]'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl">{tier.name}</h3>
                {tier.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-tangerine)] text-white">
                    {tier.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl md:text-5xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground ml-1">{tier.period}</span>
              </div>

              <Button asChild className="w-full mb-6" variant={tier.badge ? 'default' : 'secondary'}>
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>

              <div className="h-px w-full bg-border mb-6" />

              <ul className="space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-4 mt-0.5 text-[var(--color-tangerine)] shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-[.75fr_1fr] gap-12 md:gap-x-20">
          <div>
            <h2 className="mb-4">Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our plans and billing.
            </p>
          </div>
          <div className="space-y-10 md:space-y-12">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h4 className="text-base font-bold mb-3">{faq.question}</h4>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
