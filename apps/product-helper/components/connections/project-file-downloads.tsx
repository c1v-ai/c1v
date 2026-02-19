'use client';

import { useState } from 'react';
import { Download, Loader2, Check, Wrench } from 'lucide-react';

interface ProjectFileDownloadsProps {
  projectId: number;
  projectName: string;
}

export function ProjectFileDownloads({ projectId, projectName }: ProjectFileDownloadsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (type: 'skill' | 'claude-md') => {
    setDownloading(type);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/exports/${type}`);
      if (!response.ok) {
        setError(`Failed to download ${type === 'skill' ? 'SKILL.md' : 'CLAUDE.md'}. Please try again.`);
        return;
      }
      const blob = await response.blob();
      const filename = type === 'skill' ? 'SKILL.md' : 'CLAUDE.md';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloaded(prev => new Set(prev).add(type));
    } catch {
      setError('Download failed. Check your connection and try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 ${downloaded.has('claude-md') ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''}`}
          onClick={() => downloadFile('claude-md')}
          disabled={downloading === 'claude-md'}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
            {downloading === 'claude-md' ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : downloaded.has('claude-md') ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Download className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">CLAUDE.md</div>
            <div className="text-xs text-muted-foreground">Quick reference for AI tools</div>
          </div>
        </button>

        <button
          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50 ${downloaded.has('skill') ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : ''}`}
          onClick={() => downloadFile('skill')}
          disabled={downloading === 'skill'}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
            {downloading === 'skill' ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : downloaded.has('skill') ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Download className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">SKILL.md</div>
            <div className="text-xs text-muted-foreground">Full project context &amp; tools</div>
          </div>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted rounded-md p-3">
        <Wrench className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
        17 MCP tools included: <span className="font-mono">get_prd</span>, <span className="font-mono">get_user_stories</span>, <span className="font-mono">get_database_schema</span>, <span className="font-mono">get_api_specs</span>, <span className="font-mono">get_diagrams</span>, <span className="font-mono">invoke_agent</span>, <span className="font-mono">search_project_context</span>, and more.
      </div>
    </div>
  );
}
