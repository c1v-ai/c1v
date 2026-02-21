'use client';

export type ScopeMode = 'defined' | 'help';

interface ScopeModeToggleProps {
  mode: ScopeMode;
  onChange: (mode: ScopeMode) => void;
  disabled?: boolean;
}

export function ScopeModeToggle({ mode, onChange, disabled = false }: ScopeModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg p-1 bg-card border">
      <button
        type="button"
        onClick={() => onChange('defined')}
        disabled={disabled}
        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === 'defined'
            ? 'bg-accent text-accent-foreground'
            : 'bg-transparent text-muted-foreground'
        }`}
      >
        I have a defined scope
      </button>
      <button
        type="button"
        onClick={() => onChange('help')}
        disabled={disabled}
        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === 'help'
            ? 'bg-accent text-accent-foreground'
            : 'bg-transparent text-muted-foreground'
        }`}
      >
        Help me scope
      </button>
    </div>
  );
}
