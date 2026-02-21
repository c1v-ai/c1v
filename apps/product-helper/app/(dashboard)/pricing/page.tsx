import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import Link from 'next/link';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Choose your plan</h1>
      <p className="text-center text-muted-foreground mb-10">
        Start free, upgrade when you need more.
      </p>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <FreeTierCard />
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 1999}
          currency={basePrice?.currency || 'cad'}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 0}
          features={[
            '5,000 Credits / month',
            '2 Team Members',
            'Unlimited Projects',
            'Unlimited PRD Generation',
            'MCP IDE Integration',
            'SKILL.md & CLAUDE.md Export',
            'Email Support',
          ]}
          priceId={basePrice?.id}
          highlighted
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 3999}
          currency={plusPrice?.currency || 'cad'}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 0}
          features={[
            'Unlimited Credits',
            'Unlimited Team Members',
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  );
}

function FreeTierCard() {
  return (
    <div className="pt-6 bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-medium text-foreground mb-2">Free</h2>
      <p className="text-sm text-muted-foreground mb-4">
        2,500 credits to get started
      </p>
      <p className="text-4xl font-medium text-foreground mb-6">
        $0{' '}
        <span className="text-xl font-normal text-muted-foreground">
          / forever
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {['2,500 AI Credits', 'Unlimited Projects', 'AI PRD Generation', 'Custom MCP', 'CLAUDE.md Export'].map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up"
        className="block w-full text-center py-2 px-4 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
      >
        Get Started Free
      </Link>
    </div>
  );
}

function PricingCard({
  name,
  price,
  currency,
  interval,
  trialDays,
  features,
  priceId,
  highlighted,
}: {
  name: string;
  price: number;
  currency: string;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  highlighted?: boolean;
}) {
  const currencySymbol = currency === 'cad' ? 'CA$' : '$';

  return (
    <div className={`pt-6 bg-card border rounded-xl p-6 ${highlighted ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
      {highlighted && (
        <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md mb-3">
          Most Popular
        </span>
      )}
      <h2 className="text-2xl font-medium text-foreground mb-2">{name}</h2>
      {trialDays > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          with {trialDays} day free trial
        </p>
      )}
      <p className="text-4xl font-medium text-foreground mb-6">
        {currencySymbol}{(price / 100).toFixed(2)}{' '}
        <span className="text-xl font-normal text-muted-foreground">
          / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
