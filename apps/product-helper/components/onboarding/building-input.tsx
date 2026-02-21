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
      <label className="block text-sm font-medium mb-2 text-foreground">
        What are you building?
      </label>

      {/* Input Card */}
      <div className="rounded-xl border p-4 bg-background">
        {/* Textarea */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-base text-foreground"
          disabled={isPending}
        />

        {/* Footer with Create from scratch link and CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setDescription('');
              onSubmit('');
            }}
            className="text-sm hover:underline text-muted-foreground"
            disabled={isPending}
          >
            Create from scratch
          </button>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Let&apos;s get building
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
