'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Layers,
  Code,
  BookOpen,
  Users,
  Database,
  Cloud,
  FileText,
} from 'lucide-react';
import { useProjectChat } from '@/components/project/project-chat-provider';

type HasDataMap = Record<string, boolean>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PipelineItem {
  name: string;
  dataKey: string;
  href: string;
  icon: typeof Layers;
}

const requirementsItems: PipelineItem[] = [
  { name: 'Architecture Diagram', dataKey: 'hasArchitecture', href: '/requirements/architecture', icon: Layers },
  { name: 'Tech Stack', dataKey: 'hasTechStack', href: '/requirements/tech-stack', icon: Code },
  { name: 'User Stories', dataKey: 'hasUserStories', href: '/requirements/user-stories', icon: BookOpen },
  { name: 'System Overview', dataKey: 'hasSystemOverview', href: '/requirements/system-overview', icon: Users },
];

const backendItems: PipelineItem[] = [
  { name: 'Database Schema', dataKey: 'hasSchema', href: '/backend/schema', icon: Database },
  { name: 'API Specification', dataKey: 'hasApiSpec', href: '/backend/api-spec', icon: Code },
  { name: 'Infrastructure', dataKey: 'hasInfrastructure', href: '/backend/infrastructure', icon: Cloud },
  { name: 'Coding Guidelines', dataKey: 'hasGuidelines', href: '/backend/guidelines', icon: FileText },
];

function StatusIcon({ ready, isGenerating }: { ready: boolean; isGenerating: boolean }) {
  if (ready) {
    return (
      <CheckCircle2
        className="h-4 w-4 shrink-0"
        style={{ color: 'var(--success, #22c55e)' }}
      />
    );
  }
  if (isGenerating) {
    return (
      <Loader2
        className="h-4 w-4 shrink-0 animate-spin"
        style={{ color: 'var(--accent)' }}
      />
    );
  }
  return (
    <Circle
      className="h-4 w-4 shrink-0"
      style={{ color: 'var(--text-muted)', opacity: 0.4 }}
    />
  );
}

function PipelineGroup({
  title,
  items,
  projectId,
  hasData,
  isGenerating,
}: {
  title: string;
  items: PipelineItem[];
  projectId: number;
  hasData: HasDataMap | undefined;
  isGenerating: boolean;
}) {
  return (
    <div>
      <h4
        className="text-sm font-semibold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const ready = hasData?.[item.dataKey] ?? false;

          return (
            <Link
              key={item.dataKey}
              href={`/projects/${projectId}${item.href}`}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </span>
              <StatusIcon ready={ready} isGenerating={!ready && isGenerating} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ArtifactPipeline({ projectId }: { projectId: number }) {
  const { isLoading } = useProjectChat();
  const { data } = useSWR<{ hasData: HasDataMap; completeness: number }>(
    `/api/projects/${projectId}/explorer`,
    fetcher,
    { refreshInterval: 5000 }
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Artifact Pipeline
        </h3>
        <div className="space-y-5">
          <PipelineGroup
            title="Product Requirements"
            items={requirementsItems}
            projectId={projectId}
            hasData={data?.hasData}
            isGenerating={isLoading}
          />
          <PipelineGroup
            title="Backend"
            items={backendItems}
            projectId={projectId}
            hasData={data?.hasData}
            isGenerating={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
