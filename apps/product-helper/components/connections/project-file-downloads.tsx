'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText, Check } from 'lucide-react';

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
      <p className="text-sm text-muted-foreground">
        Create a folder on your computer, then download these files into it. They give your AI assistant full context about your project&apos;s requirements, architecture, and conventions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant={downloaded.has('claude-md') ? 'outline' : 'default'}
          className="h-auto py-3 px-4 justify-start"
          onClick={() => downloadFile('claude-md')}
          disabled={downloading === 'claude-md'}
        >
          {downloading === 'claude-md' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : downloaded.has('claude-md') ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          <div className="text-left">
            <div className="font-medium">CLAUDE.md</div>
            <div className="text-xs opacity-70">Quick reference for AI tools</div>
          </div>
        </Button>

        <Button
          variant={downloaded.has('skill') ? 'outline' : 'default'}
          className="h-auto py-3 px-4 justify-start"
          onClick={() => downloadFile('skill')}
          disabled={downloading === 'skill'}
        >
          {downloading === 'skill' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : downloaded.has('skill') ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          <div className="text-left">
            <div className="font-medium">SKILL.md</div>
            <div className="text-xs opacity-70">Full project context &amp; tools</div>
          </div>
        </Button>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted rounded-md p-3">
        <FileText className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
        Place these files in your project root. Claude Code and other AI tools auto-detect them.
      </div>
    </div>
  );
}
