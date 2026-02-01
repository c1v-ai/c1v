'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface ExplorerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExplorerSearch({ value, onChange }: ExplorerSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div
      className="px-3 py-2 border-b shrink-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="relative flex items-center h-7 rounded-md px-2 transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          outline: isFocused
            ? '2px solid var(--accent)'
            : '1px solid transparent',
          outlineOffset: '-1px',
        }}
      >
        <Search
          className="h-3.5 w-3.5 shrink-0 mr-1.5"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Filter..."
          className="flex-1 bg-transparent border-0 outline-none text-xs placeholder:opacity-50"
          style={{
            color: 'var(--text-primary)',
          }}
          aria-label="Filter tree sections"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center w-4 h-4 rounded-sm shrink-0 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear filter"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
