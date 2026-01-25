'use client';

import { GitBranch, Database, Lightbulb, TrendingUp } from 'lucide-react';

interface ValueProp {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: 'Context & Use Case Diagrams',
    description: 'Visual representation of system boundaries and user interactions',
    color: '#3B82F6', // blue
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: 'Requirements & Scope Trees',
    description: 'Structured breakdown of functional and non-functional requirements',
    color: '#8B5CF6', // purple
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: 'SR-CORNELL Validation',
    description: 'Engineering-validated requirements using proven methodology',
    color: '#F59E0B', // amber
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Technical Specifications',
    description: 'Database schemas, API specs, and architecture decisions',
    color: '#10B981', // green
  },
];

export function ValuePropsGrid() {
  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)'
      }}
    >
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        What Product Helper will generate
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VALUE_PROPS.map((prop) => (
          <div key={prop.title} className="flex items-start gap-4">
            {/* Icon container */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${prop.color}15`,
                color: prop.color,
              }}
            >
              {prop.icon}
            </div>

            {/* Text content */}
            <div>
              <h4
                className="font-medium text-sm mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {prop.title}
              </h4>
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {prop.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
