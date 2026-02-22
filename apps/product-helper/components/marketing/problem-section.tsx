import { Unlink, BatteryLow, Trash2 } from 'lucide-react';

const painPoints = [
  {
    icon: Unlink,
    title: 'Fix one thing, break four others.',
    description:
      'You describe the bug. Claude rewrites a function. Three other features stop working. You spend the next hour hunting for what broke — and the fix creates two new issues.',
  },
  {
    icon: BatteryLow,
    title: 'You got to 70% fast. Then you got stuck.',
    description:
      'The first 70% felt like magic. Then integration hit. Auth broke the payments. Payments broke the dashboard. Every layer depended on decisions that were never made.',
  },
  {
    icon: Trash2,
    title: 'You deleted everything and started over.',
    description:
      'Wrong schema from day one. Every fix created two new problems. You spent more time debugging than building — until you gave up and hit reset.',
  },
];

export function ProblemSection() {
  return (
    <section className="px-4 sm:px-[5%] py-16 md:py-24 lg:py-28 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="mb-4">
            You already know the problem. Your AI coding agent doesn&apos;t.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border p-6 md:p-8 bg-background"
            >
              <point.icon className="size-8 mb-4 text-[var(--color-tangerine)]" />
              <h3 className="text-xl mb-3">{point.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
