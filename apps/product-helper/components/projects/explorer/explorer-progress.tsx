'use client';

import type { ExplorerData } from '@/lib/db/queries/explorer';

interface ExplorerProgressProps {
  completeness: number;
  hasData: ExplorerData['hasData'];
}

/** Section definitions for progress tracking */
const JOURNEY_SECTIONS = [
  { key: 'hasProblemStatement', label: 'Problem' },
  { key: 'hasGoalsMetrics', label: 'Goals' },
  { key: 'hasSystemOverview', label: 'System' },
  { key: 'hasArchitecture', label: 'Arch' },
  { key: 'hasTechStack', label: 'Tech' },
  { key: 'hasUserStories', label: 'Stories' },
  { key: 'hasSchema', label: 'Schema' },
  { key: 'hasApiSpec', label: 'API' },
  { key: 'hasInfrastructure', label: 'Infra' },
  { key: 'hasGuidelines', label: 'Guide' },
  { key: 'hasNfr', label: 'NFR' },
] as const;

export function ExplorerProgress({ completeness, hasData }: ExplorerProgressProps) {
  const percent = Math.max(0, Math.min(100, completeness));
  const completedCount = JOURNEY_SECTIONS.filter(
    (s) => hasData[s.key as keyof typeof hasData]
  ).length;
  const totalSections = JOURNEY_SECTIONS.length;

  return (
    <div className="px-3 py-3 border-t shrink-0">
      {/* Overall completeness */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          Completeness
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-foreground">
          {percent}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Project completeness: ${percent}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor:
              percent >= 80
                ? '#22c55e'
                : percent >= 40
                  ? '#eab308'
                  : 'hsl(var(--accent))',
          }}
        />
      </div>

      {/* Section journey */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Sections
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-foreground">
            {completedCount}/{totalSections}
          </span>
        </div>
        <div className="flex gap-0.5">
          {JOURNEY_SECTIONS.map((section) => {
            const done = hasData[section.key as keyof typeof hasData];
            return (
              <div
                key={section.key}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${done ? 'bg-green-500' : 'bg-muted'}`}
                title={`${section.label}: ${done ? 'Complete' : 'Pending'}`}
                aria-label={`${section.label}: ${done ? 'Complete' : 'Pending'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
