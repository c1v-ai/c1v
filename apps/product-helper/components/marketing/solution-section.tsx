'use client';

import { MessageSquare, Bot, Shield } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'From concept to specs in minutes',
    description:
      'Describe your idea in plain English. The AI runs you through actors, use cases, system boundaries, and data models. Out comes professional-grade specifications your developers can build from immediately.',
    replaces: 'Replaces weeks of architecture meetings and Google Docs PRDs nobody reads.',
  },
  {
    icon: Bot,
    title: 'Custom MCP + 17 specialized agents',
    description:
      'Product manager, QA engineer, UX specialist, backend architect, database designer — 17 agents collaborate on your spec. Then export a custom MCP server so your IDE understands the full architecture.',
    replaces: 'Replaces manually writing CLAUDE.md and .cursorrules by hand.',
  },
  {
    icon: Shield,
    title: 'Anti-drift architecture',
    description:
      '10 hard validation gates catch missing actors, orphan use cases, and hallucinated endpoints before they reach your codebase. Persistent memory means your AI never forgets what it already decided.',
    replaces: 'Replaces the endless "fix one thing, break four others" cycle.',
  },
];

export function SolutionSection() {
  return (
    <section id="features" className="px-4 sm:px-[5%] pt-24 md:pt-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-y-0">
          {/* Left panel — sticky */}
          <div>
            <div className="md:sticky md:top-0">
              <div className="flex flex-col items-end md:h-screen md:justify-center">
                <div className="mx-[5%] max-w-md md:ml-0 md:mr-12 lg:mr-20">
                  <p className="mb-3 font-semibold text-[var(--color-tangerine)] md:mb-4">Build</p>
                  <h2 className="mb-5 md:mb-6">
                    The architecture layer between your idea and your code.
                  </h2>
                  <p className="text-muted-foreground">
                    Chat about your product idea. Get engineering-ready specs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — scrolling cards */}
          <div>
            {features.map((feature) => (
              <div
                key={feature.title}
                className="sticky top-0 flex h-screen flex-col justify-center border-t border-border bg-card px-[5%] py-10 md:px-10"
              >
                <div className="max-w-md">
                  <div className="mb-6 md:mb-8">
                    <div className="size-12 rounded-xl bg-[var(--color-tangerine)]/10 flex items-center justify-center">
                      <feature.icon className="size-6 text-[var(--color-tangerine)]" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <p className="text-sm text-[var(--color-danube)] italic">
                    {feature.replaces}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
