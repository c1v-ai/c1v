'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';

interface ExportSectionProps {
  projectId: number;
  projectName: string;
}

export function ExportSection({ projectId, projectName }: ExportSectionProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = async (type: 'skill' | 'claude-md') => {
    setDownloading(type);
    try {
      const response = await fetch(`/api/projects/${projectId}/exports/${type}`);
      if (response.ok) {
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
      }
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Files
        </CardTitle>
        <CardDescription>
          Download project documentation for your codebase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SKILL.md Export */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold">SKILL.md</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive project context including all MCP tools, tech stack,
                coding guidelines, and workflows.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Best for:</strong> Full project onboarding, new team members
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadFile('skill')}
              disabled={downloading === 'skill'}
            >
              {downloading === 'skill' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download SKILL.md
                </>
              )}
            </Button>
          </div>

          {/* CLAUDE.md Export */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold">CLAUDE.md</h4>
              <p className="text-sm text-muted-foreground">
                Concise project reference with key context, entities, actors,
                and essential conventions.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Best for:</strong> Quick reference, existing team members
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadFile('claude-md')}
              disabled={downloading === 'claude-md'}
            >
              {downloading === 'claude-md' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download CLAUDE.md
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <strong>Tip:</strong> Place these files in your project root directory.
          Claude Code and other AI tools will automatically use them for context.
        </div>
      </CardContent>
    </Card>
  );
}
