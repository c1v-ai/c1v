'use client';

export type ScopeMode = 'defined' | 'help';

interface ScopeModeToggleProps {
  mode: ScopeMode;
  onChange: (mode: ScopeMode) => void;
  disabled?: boolean;
}

export function ScopeModeToggle({ mode, onChange, disabled = false }: ScopeModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg p-1"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)'
      }}
    >
      <button
        type="button"
        onClick={() => onChange('defined')}
        disabled={disabled}
        className="px-5 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: mode === 'defined' ? 'var(--accent)' : 'transparent',
          color: mode === 'defined' ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        I have a defined scope
      </button>
      <button
        type="button"
        onClick={() => onChange('help')}
        disabled={disabled}
        className="px-5 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: mode === 'help' ? 'var(--accent)' : 'transparent',
          color: mode === 'help' ? '#FFFFFF' : 'var(--text-secondary)',
        }}
      >
        Help me scope
      </button>
    </div>
  );
}
