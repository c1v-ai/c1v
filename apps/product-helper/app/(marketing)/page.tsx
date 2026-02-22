import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { HeroSection } from '@/components/marketing/hero-section';
import { ProblemSection } from '@/components/marketing/problem-section';
import { SolutionSection } from '@/components/marketing/solution-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { CtaSection } from '@/components/marketing/cta-section';

export default async function MarketingPage() {
  const user = await getUser();

  if (user) {
    redirect('/home');
  }

  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
    </>
  );
}
