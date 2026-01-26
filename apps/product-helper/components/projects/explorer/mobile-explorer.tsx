'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ExplorerHeader } from './explorer-header';
import { ExplorerSearch } from './explorer-search';
import { ExplorerTree } from './explorer-tree';
import { ExplorerProgress } from './explorer-progress';
import type { ExplorerData } from '@/lib/db/queries/explorer';

interface MobileExplorerProps {
  projectId: number;
  data: ExplorerData;
}

export function MobileExplorer({ projectId, data }: MobileExplorerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  return (
    <>
      {/* Floating action button visible only on mobile */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-20 right-4 z-40 md:hidden rounded-full shadow-lg w-12 h-12"
        style={{ backgroundColor: 'var(--accent)' }}
        onClick={() => setOpen(true)}
        aria-label="Open project navigator"
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Project Navigator</SheetTitle>
            <SheetDescription>
              Navigate between project sections
            </SheetDescription>
          </SheetHeader>

          <ExplorerHeader
            projectName={data.project.name}
            status={data.project.status}
          />

          <ExplorerSearch value={filter} onChange={setFilter} />

          {/* Clicking a link in the tree should close the sheet */}
          <div onClick={() => setOpen(false)} className="flex-1 min-h-0 flex flex-col">
            <ExplorerTree projectId={projectId} data={data} filter={filter} />
          </div>

          <ExplorerProgress completeness={data.completeness} />
        </SheetContent>
      </Sheet>
    </>
  );
}
