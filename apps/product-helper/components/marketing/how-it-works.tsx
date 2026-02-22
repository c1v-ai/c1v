import { MessageCircle, Cpu, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Describe your product idea',
    description:
      'Type your idea in plain English. No templates, no forms — just tell the AI what you want to build and who it is for.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI generates your full spec',
    description:
      '17 specialized agents — PM, backend, DB, QA, UX — collaborate to produce actors, use cases, data schemas, API contracts, and infrastructure. 10 validation gates ensure nothing is missing.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Export to Claude Code or Cursor. Build.',
    description:
      'One click exports CLAUDE.md, .cursorrules, SKILL.md, and a custom MCP server. Your AI coding agent now understands the full architecture. Build without drift.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 sm:px-[5%] py-16 md:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="mb-3 font-semibold text-[var(--color-tangerine)] md:mb-4">How it works</p>
          <h2 className="mb-4">
            Three steps. From idea to architecture.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-start">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl md:text-5xl font-bold text-[var(--color-tangerine)]/20">
                  {step.number}
                </span>
                <div className="size-10 rounded-xl bg-[var(--color-tangerine)]/10 flex items-center justify-center">
                  <step.icon className="size-5 text-[var(--color-tangerine)]" />
                </div>
              </div>
              <h3 className="text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
