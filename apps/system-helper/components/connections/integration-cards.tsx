'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface IntegrationCardsProps {
  projectId: number;
  projectName: string;
  mcpUrl: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  setupCommand: string;
  docsUrl: string;
  status: 'recommended' | 'supported' | 'beta';
}

export function IntegrationCards({ projectId, projectName, mcpUrl }: IntegrationCardsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const integrations: Integration[] = [
    {
      id: 'claude-code',
      name: 'Claude Code',
      description: 'Official Claude CLI with MCP support',
      icon: '🤖',
      setupCommand: `claude mcp add ${slug} ${mcpUrl} --key YOUR_API_KEY`,
      docsUrl: 'https://docs.anthropic.com/claude-code/mcp',
      status: 'recommended',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      description: 'AI-powered code editor with MCP integration',
      icon: '⚡',
      setupCommand: JSON.stringify({
        mcpServers: {
          [slug]: {
            command: 'npx',
            args: ['-y', '@anthropic-ai/mcp-proxy', mcpUrl],
            env: { API_KEY: 'YOUR_API_KEY' },
          },
        },
      }, null, 2),
      docsUrl: 'https://cursor.sh/docs/mcp',
      status: 'supported',
    },
    {
      id: 'vscode',
      name: 'VS Code',
      description: 'Via Continue or Cline extension',
      icon: '💻',
      setupCommand: `// Add to .continue/config.json or cline settings
{
  "mcpServers": [{
    "name": "${slug}",
    "url": "${mcpUrl}",
    "apiKey": "YOUR_API_KEY"
  }]
}`,
      docsUrl: 'https://continue.dev/docs/mcp',
      status: 'supported',
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      description: 'Codeium\'s AI IDE with MCP support',
      icon: '🏄',
      setupCommand: JSON.stringify({
        mcpServers: {
          [slug]: {
            url: mcpUrl,
            apiKey: 'YOUR_API_KEY',
          },
        },
      }, null, 2),
      docsUrl: 'https://windsurf.dev/docs',
      status: 'beta',
    },
  ];

  const copyToClipboard = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColors = {
    recommended: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    supported: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {integrations.map((integration) => (
        <Card key={integration.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                </div>
              </div>
              <Badge className={statusColors[integration.status]}>
                {integration.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-32">
                <code>{integration.setupCommand}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(integration.id, integration.setupCommand)}
              >
                {copiedId === integration.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="link" size="sm" asChild className="text-xs">
                <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                  Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
