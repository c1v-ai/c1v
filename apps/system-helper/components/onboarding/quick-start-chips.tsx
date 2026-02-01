'use client';

interface QuickStartChip {
  label: string;
  prompt: string;
}

const DEFAULT_CHIPS: QuickStartChip[] = [
  {
    label: 'SaaS backend',
    prompt: 'A SaaS backend service with user authentication, subscription management, and multi-tenant data isolation.',
  },
  {
    label: 'Public API',
    prompt: 'A public REST API with rate limiting, API key authentication, comprehensive documentation, and versioning support.',
  },
  {
    label: 'Event-driven system',
    prompt: 'An event-driven architecture with message queues, event sourcing, and eventual consistency patterns.',
  },
  {
    label: 'Internal admin tool',
    prompt: 'An internal admin dashboard for managing users, content, and system configuration with role-based access control.',
  },
  {
    label: 'Marketplace platform',
    prompt: 'A two-sided marketplace connecting buyers and sellers with listings, transactions, reviews, and payment processing.',
  },
];

interface QuickStartChipsProps {
  onSelect: (prompt: string) => void;
  chips?: QuickStartChip[];
  disabled?: boolean;
}

export function QuickStartChips({
  onSelect,
  chips = DEFAULT_CHIPS,
  disabled = false
}: QuickStartChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.prompt)}
          disabled={disabled}
          className="px-4 py-2 rounded-full text-sm font-medium border transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
