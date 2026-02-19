'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Copy, PlayCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface IdeAccordionProps {
  projectName: string;
  mcpUrl: string;
  apiKey: string | null;
}

interface IdeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'recommended' | 'supported' | 'beta';
  getCommand: (slug: string, mcpUrl: string, apiKey: string) => string;
  instructions: string[];
  prerequisite?: string;
}

const statusColors = {
  recommended: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  supported: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

const IDE_CONFIGS: IdeConfig[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '🤖',
    description: 'Official Claude CLI with MCP support',
    status: 'recommended',
    getCommand: (slug, mcpUrl, apiKey) =>
      `claude mcp add ${slug} ${mcpUrl} --key ${apiKey} --scope project`,
    instructions: [
      'Open your terminal in your project folder',
      'Paste and run the command below',
      'Start a new Claude Code conversation — your MCP tools are now available',
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '⚡',
    description: 'AI-powered code editor with MCP integration',
    status: 'supported',
    getCommand: (slug, mcpUrl, apiKey) =>
      JSON.stringify({
        mcpServers: {
          [slug]: {
            command: 'npx',
            args: ['-y', '@anthropic-ai/mcp-proxy', mcpUrl],
            env: { API_KEY: apiKey },
          },
        },
      }, null, 2),
    instructions: [
      'Open Cursor and go to Settings (Cmd+,)',
      'Navigate to the MCP section',
      'Click "Add new MCP server" and paste the JSON below',
      'Restart Cursor to activate the connection',
    ],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    icon: '💻',
    description: 'Via Continue or Cline extension',
    status: 'supported',
    prerequisite: 'Install the Continue or Cline extension from the VS Code marketplace first.',
    getCommand: (slug, mcpUrl, apiKey) =>
`// Add to .continue/config.json or Cline settings
{
  "mcpServers": [{
    "name": "${slug}",
    "url": "${mcpUrl}",
    "apiKey": "${apiKey}"
  }]
}`,
    instructions: [
      'Install the Continue or Cline extension from the VS Code marketplace',
      'Open the extension settings (Continue: .continue/config.json, Cline: settings UI)',
      'Add the MCP server configuration below',
      'Reload VS Code (Cmd+Shift+P \u2192 "Reload Window")',
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🏄',
    description: "Codeium's AI IDE with MCP support",
    status: 'beta',
    getCommand: (slug, mcpUrl, apiKey) =>
      JSON.stringify({
        mcpServers: {
          [slug]: {
            url: mcpUrl,
            apiKey: apiKey,
          },
        },
      }, null, 2),
    instructions: [
      'Open Windsurf Settings',
      'Navigate to the MCP configuration section',
      'Paste the JSON below',
      'Restart Windsurf to activate',
    ],
  },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function IdeAccordion({ projectName, mcpUrl, apiKey }: IdeAccordionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const slug = slugify(projectName);
  const displayKey = apiKey || 'YOUR_API_KEY';

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API not available (HTTP or denied permissions)
    }
  };

  return (
    <div className="space-y-3">
      {!apiKey && (
        <p className="text-sm text-muted-foreground italic">
          Create an API key above to auto-fill the commands below.
        </p>
      )}

      <Accordion type="single" collapsible className="w-full">
        {IDE_CONFIGS.map((ide) => {
          const command = ide.getCommand(slug, mcpUrl, displayKey);
          return (
            <AccordionItem key={ide.id} value={ide.id} className="border rounded-lg mb-2 px-4 border-b-0 last:border-b-0">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl" aria-hidden="true">{ide.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{ide.name}</div>
                    <div className="text-xs text-muted-foreground font-normal hidden sm:block">{ide.description}</div>
                  </div>
                  <Badge className={statusColors[ide.status]}>{ide.status}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {ide.prerequisite && (
                    <div role="alert" className="text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      {ide.prerequisite}
                    </div>
                  )}

                  <ol className="space-y-2 list-none">
                    {ide.instructions.map((text, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-48">
                      <code>{command}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      aria-label={`Copy ${ide.name} setup command`}
                      onClick={() => copyToClipboard(ide.id, command)}
                    >
                      {copiedId === ide.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground">
                    <PlayCircle className="h-8 w-8 mb-2 opacity-40" />
                    <span className="text-xs">Setup walkthrough GIF coming soon</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
