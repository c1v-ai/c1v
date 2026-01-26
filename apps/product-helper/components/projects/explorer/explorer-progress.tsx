'use client';

interface ExplorerProgressProps {
  completeness: number;
}

export function ExplorerProgress({ completeness }: ExplorerProgressProps) {
  // Clamp between 0 and 100
  const percent = Math.max(0, Math.min(100, completeness));

  return (
    <div
      className="px-3 py-3 border-t shrink-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          Completeness
        </span>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {percent}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
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
                  : 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
