'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface BuildingInputProps {
  onSubmit: (description: string) => void;
  isPending: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function BuildingInput({
  onSubmit,
  isPending,
  placeholder = "A payments API for marketplaces with high throughput and strict compliance...",
  value: controlledValue,
  onChange: controlledOnChange,
}: BuildingInputProps) {
  const [internalValue, setInternalValue] = useState('');

  // Support both controlled and uncontrolled modes
  const description = controlledValue !== undefined ? controlledValue : internalValue;
  const setDescription = controlledOnChange || setInternalValue;

  const handleSubmit = () => {
    if (description.trim() || true) { // Allow empty for "create from scratch"
      onSubmit(description.trim());
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        What are you building?
      </label>

      {/* Input Card */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Credits Badge (optional - can be removed if not using credits system) */}
        {/* <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <Tag className="h-3 w-3" />
            1,050 credits
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Free
          </span>
        </div> */}

        {/* Textarea */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
          style={{
            color: 'var(--text-primary)',
          }}
          disabled={isPending}
        />

        {/* Footer with Create from scratch link and CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => {
              setDescription('');
              onSubmit('');
            }}
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
            disabled={isPending}
          >
            Create from scratch
          </button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Let's get building
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
