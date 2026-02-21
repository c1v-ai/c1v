'use client';

/**
 * API Spec Section Component
 *
 * Displays API specification with endpoint groups, method badges,
 * parameters, and response schemas.
 * Used in the Project Explorer sidebar under Backend > API Spec.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiParameter {
  name: string;
  in?: string;
  type?: string;
  required?: boolean;
  description?: string;
}

interface ApiResponse {
  status?: number | string;
  description?: string;
  schema?: unknown;
}

interface ApiEndpoint {
  method: string;
  path: string;
  description?: string;
  summary?: string;
  parameters?: ApiParameter[];
  responses?: ApiResponse[] | Record<string, ApiResponse>;
  requestBody?: unknown;
  tags?: string[];
  group?: string;
}

interface ApiSpecData {
  endpoints?: ApiEndpoint[];
  routes?: ApiEndpoint[];
  paths?: Record<string, Record<string, ApiEndpoint>>;
  groups?: Array<{ name: string; endpoints: ApiEndpoint[] }>;
  info?: { title?: string; version?: string; description?: string };
  [key: string]: unknown;
}

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData: {
    apiSpecification: ApiSpecData | null;
  } | null;
}

interface ApiSpecSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

function getMethodBadge(method: string) {
  const upper = method.toUpperCase();
  const color = methodColors[upper] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  return (
    <Badge className={cn('font-mono text-xs min-w-[52px] justify-center', color)}>
      {upper}
    </Badge>
  );
}

/**
 * Extract a flat list of endpoints from various API spec formats
 */
function extractEndpoints(spec: ApiSpecData): ApiEndpoint[] {
  // Direct endpoints array
  if (spec.endpoints && Array.isArray(spec.endpoints)) {
    return spec.endpoints;
  }

  // Routes array
  if (spec.routes && Array.isArray(spec.routes)) {
    return spec.routes;
  }

  // OpenAPI paths format
  if (spec.paths && typeof spec.paths === 'object') {
    const endpoints: ApiEndpoint[] = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      if (typeof methods !== 'object' || methods === null) continue;
      for (const [method, details] of Object.entries(methods)) {
        if (typeof details !== 'object' || details === null) continue;
        endpoints.push({
          ...details,
          method,
          path,
        });
      }
    }
    return endpoints;
  }

  // Grouped format
  if (spec.groups && Array.isArray(spec.groups)) {
    return spec.groups.flatMap((g) => g.endpoints ?? []);
  }

  return [];
}

/**
 * Group endpoints by their first path segment or tag
 */
function groupEndpoints(
  endpoints: ApiEndpoint[]
): Map<string, ApiEndpoint[]> {
  const groups = new Map<string, ApiEndpoint[]>();

  for (const ep of endpoints) {
    const groupKey =
      ep.group ??
      ep.tags?.[0] ??
      ep.path
        .split('/')
        .filter(Boolean)[0] ??
      'General';

    const formatted = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
    const existing = groups.get(formatted) ?? [];
    existing.push(ep);
    groups.set(formatted, existing);
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    (endpoint.parameters && endpoint.parameters.length > 0) ||
    endpoint.responses;

  const toggleExpand = useCallback(() => {
    if (hasDetails) setExpanded((prev) => !prev);
  }, [hasDetails]);

  // Normalize responses to array
  const responsesArray: ApiResponse[] = (() => {
    if (!endpoint.responses) return [];
    if (Array.isArray(endpoint.responses)) return endpoint.responses;
    return Object.entries(endpoint.responses).map(([status, details]) => ({
      status,
      ...(typeof details === 'object' && details !== null ? details : {}),
    }));
  })();

  return (
    <div className="border-b border-border last:border-b-0">
      <div
        className={cn(
          'flex items-center gap-3 py-3 px-4',
          hasDetails && 'cursor-pointer hover:bg-muted/50 transition-colors'
        )}
        onClick={toggleExpand}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleExpand();
          }
        }}
        aria-expanded={hasDetails ? expanded : undefined}
      >
        {hasDetails ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        {getMethodBadge(endpoint.method)}
        <span className="font-mono text-sm text-foreground">
          {endpoint.path}
        </span>
        {(endpoint.description || endpoint.summary) && (
          <span className="text-sm hidden md:inline truncate text-muted-foreground">
            -- {endpoint.description || endpoint.summary}
          </span>
        )}
      </div>

      {expanded && hasDetails && (
        <div className="px-4 pb-4 pt-1 ml-8 space-y-3 bg-muted">
          {/* Description */}
          {(endpoint.description || endpoint.summary) && (
            <p className="text-sm text-muted-foreground">
              {endpoint.description || endpoint.summary}
            </p>
          )}

          {/* Parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold mb-2 text-muted-foreground">
                Parameters
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 px-2 font-semibold text-foreground">
                        Name
                      </th>
                      <th className="text-left py-1 px-2 font-semibold text-foreground">
                        In
                      </th>
                      <th className="text-left py-1 px-2 font-semibold text-foreground">
                        Type
                      </th>
                      <th className="text-left py-1 px-2 font-semibold text-foreground">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param, i) => (
                      <tr key={param.name + i} className="border-b border-border last:border-b-0">
                        <td className="py-1 px-2 font-mono text-foreground">
                          {param.name}
                        </td>
                        <td className="py-1 px-2 text-muted-foreground">
                          {param.in || '-'}
                        </td>
                        <td className="py-1 px-2">
                          {param.type && (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {param.type}
                            </Badge>
                          )}
                        </td>
                        <td className="py-1 px-2">
                          {param.required ? (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs">
                              required
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">optional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Responses */}
          {responsesArray.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold mb-2 text-muted-foreground">
                Responses
              </h5>
              <div className="space-y-1">
                {responsesArray.map((resp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Badge variant="outline" className="font-mono text-xs">
                      {String(resp.status ?? '200')}
                    </Badge>
                    <span className="text-muted-foreground">
                      {resp.description || 'Success'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EndpointGroupCard({
  groupName,
  endpoints,
}: {
  groupName: string;
  endpoints: ApiEndpoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {groupName}
            </CardTitle>
          </div>
          <Badge variant="secondary">
            {endpoints.length} {endpoints.length === 1 ? 'endpoint' : 'endpoints'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {endpoints.map((endpoint, index) => (
          <EndpointRow key={`${endpoint.method}-${endpoint.path}-${index}`} endpoint={endpoint} />
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Complete the intake chat to generate an API specification from your requirements.'
      : 'No API specification generated yet. Data will appear here after extraction.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No API Specification
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto text-muted-foreground">
            {message}
          </p>
          <Button asChild>
            <Link href={`/projects/${projectId}/chat`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ApiSpecSection({ project }: ApiSpecSectionProps) {
  const apiSpec = project.projectData?.apiSpecification as ApiSpecData | null;

  if (!apiSpec) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  const endpoints = extractEndpoints(apiSpec);

  if (endpoints.length === 0) {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  const grouped = groupEndpoints(endpoints);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-foreground">
              API Specification
            </h2>
            <p className="text-sm text-muted-foreground">
              {endpoints.length} {endpoints.length === 1 ? 'endpoint' : 'endpoints'} across{' '}
              {grouped.size} {grouped.size === 1 ? 'group' : 'groups'}.
              {apiSpec.info?.version && (
                <span> Version {apiSpec.info.version}.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([groupName, groupEndpoints]) => (
        <EndpointGroupCard
          key={groupName}
          groupName={groupName}
          endpoints={groupEndpoints}
        />
      ))}
    </div>
  );
}
