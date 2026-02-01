'use client';

import { CircleIcon, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          <CircleIcon className="h-8 w-8 text-orange-500" />
          <span className="ml-2 text-2xl font-semibold">Product Helper</span>
        </div>

        <div className="mb-8">
          <WifiOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection.
            Some features require a connection to work.
          </p>
        </div>

        <Button
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Try Again
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          Your work is saved locally and will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
