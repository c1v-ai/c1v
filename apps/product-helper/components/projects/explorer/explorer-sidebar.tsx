'use client';

import { useState } from 'react';
import { ExplorerHeader } from './explorer-header';
import { ExplorerSearch } from './explorer-search';
import { ExplorerTree } from './explorer-tree';
import { ExplorerProgress } from './explorer-progress';
import type { ExplorerData } from '@/lib/db/queries/explorer';

interface ExplorerSidebarProps {
  projectId: number;
  data: ExplorerData;
}

export function ExplorerSidebar({ projectId, data }: ExplorerSidebarProps) {
  const [filter, setFilter] = useState('');

  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 h-full border-r"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
      aria-label="Project explorer"
    >
      <ExplorerHeader
        projectName={data.project.name}
        status={data.project.status}
      />

      <ExplorerSearch value={filter} onChange={setFilter} />

      <ExplorerTree projectId={projectId} data={data} filter={filter} />

      <ExplorerProgress completeness={data.completeness} />
    </aside>
  );
}
