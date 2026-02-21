'use client';

/**
 * Coding Guidelines Section Component
 *
 * Displays coding guidelines including naming conventions, design patterns,
 * linting rules, testing strategy, and documentation strategy in collapsible cards.
 * Used in the Project Explorer sidebar under Backend > Guidelines.
 *
 * Team: Frontend (Agent 2.1: UI Engineer)
 */

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  BookOpen,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  TestTube,
  PenLine,
  ShieldAlert,
  ScrollText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  CodingGuidelines,
  NamingConventions,
  NamingStyle,
  DesignPattern,
  ForbiddenPattern,
  LintConfig,
  TestingStrategy,
  DocStrategy,
} from '@/lib/db/schema/v2-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectForSection {
  id: number;
  name: string;
  status: string;
  projectData: {
    codingGuidelines: CodingGuidelines | null;
  } | null;
}

interface GuidelinesSectionProps {
  project: ProjectForSection;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNamingStyle(style: NamingStyle): string {
  switch (style) {
    case 'camelCase':
      return 'camelCase';
    case 'PascalCase':
      return 'PascalCase';
    case 'snake_case':
      return 'snake_case';
    case 'SCREAMING_SNAKE_CASE':
      return 'SCREAMING_SNAKE_CASE';
    case 'kebab-case':
      return 'kebab-case';
    default:
      return style;
  }
}

function getNamingExample(element: string, style: NamingStyle): string {
  switch (style) {
    case 'camelCase':
      return element === 'functions' ? 'getUserById' : 'userName';
    case 'PascalCase':
      return element === 'components' ? 'UserProfile' : element === 'types' ? 'UserData' : element === 'interfaces' ? 'IUserService' : 'MyClass';
    case 'snake_case':
      return element === 'files' ? 'user_service' : element === 'directories' ? 'user_data' : 'user_name';
    case 'SCREAMING_SNAKE_CASE':
      return 'MAX_RETRIES';
    case 'kebab-case':
      return element === 'files' ? 'user-service' : element === 'directories' ? 'user-data' : 'user-name';
    default:
      return style;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CollapsibleCard({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg flex-1">
                {title}
              </CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function NamingConventionsTable({ naming }: { naming: NamingConventions }) {
  const rows: Array<{ element: string; convention: NamingStyle; example: string }> = [];

  const coreEntries: Array<[string, NamingStyle]> = [
    ['variables', naming.variables],
    ['functions', naming.functions],
    ['classes', naming.classes],
    ['constants', naming.constants],
    ['files', naming.files],
    ['directories', naming.directories],
  ];

  for (const [element, convention] of coreEntries) {
    rows.push({
      element,
      convention,
      example: getNamingExample(element, convention),
    });
  }

  // Optional entries
  if (naming.components) {
    rows.push({ element: 'components', convention: naming.components, example: getNamingExample('components', naming.components) });
  }
  if (naming.hooks) {
    rows.push({ element: 'hooks', convention: naming.hooks, example: getNamingExample('hooks', naming.hooks) });
  }
  if (naming.types) {
    rows.push({ element: 'types', convention: naming.types, example: getNamingExample('types', naming.types) });
  }
  if (naming.interfaces) {
    rows.push({ element: 'interfaces', convention: naming.interfaces, example: getNamingExample('interfaces', naming.interfaces) });
  }
  if (naming.enums) {
    rows.push({ element: 'enums', convention: naming.enums, example: getNamingExample('enums', naming.enums) });
  }
  if (naming.database) {
    rows.push({ element: 'db tables', convention: naming.database.tables, example: getNamingExample('files', naming.database.tables) });
    rows.push({ element: 'db columns', convention: naming.database.columns, example: getNamingExample('variables', naming.database.columns) });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">
              Element
            </th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">
              Convention
            </th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">
              Example
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.element}
              className="border-t border-border"
            >
              <td className="px-4 py-2.5 capitalize text-foreground">
                {row.element}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant="outline" className="text-xs font-mono">
                  {formatNamingStyle(row.convention)}
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                {row.example}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatternsCard({ patterns }: { patterns: DesignPattern[] }) {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <div
          key={pattern.name + index}
          className="rounded-lg border border-border p-4"
        >
          <h5 className="font-semibold mb-1 text-foreground">
            {pattern.name}
          </h5>
          <p className="text-sm mb-2 text-muted-foreground">
            {pattern.description}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">When:</span> {pattern.when}
          </p>
          {pattern.example && (
            <pre className="mt-2 rounded p-3 text-xs font-mono overflow-x-auto bg-muted text-foreground">
              {pattern.example}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function ForbiddenPatternsCard({ forbidden }: { forbidden: ForbiddenPattern[] }) {
  if (forbidden.length === 0) return null;

  return (
    <div className="space-y-3">
      {forbidden.map((pattern, index) => (
        <div
          key={pattern.name + index}
          className="rounded-lg border border-border p-4"
        >
          <div className="flex items-start gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
            <h5 className="font-semibold text-foreground">
              {pattern.name}
            </h5>
          </div>
          <p className="text-sm mb-1 ml-6 text-muted-foreground">
            {pattern.reason}
          </p>
          {pattern.alternative && (
            <p className="text-xs ml-6 text-muted-foreground">
              <span className="font-semibold">Alternative:</span> {pattern.alternative}
            </p>
          )}
          {pattern.lintRule && (
            <Badge variant="outline" className="text-xs ml-6 mt-1 font-mono">
              {pattern.lintRule}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function LintingCard({ linting }: { linting: LintConfig }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          Tool: {linting.tool}
        </Badge>
        {linting.formatter && linting.formatter !== 'none' && (
          <Badge variant="outline" className="text-xs">
            Formatter: {linting.formatter}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          Format on Save: {linting.formatOnSave ? 'Yes' : 'No'}
        </Badge>
      </div>

      {linting.extends && linting.extends.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground">
            Extends:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {linting.extends.map((ext, i) => (
              <Badge key={i} variant="outline" className="text-xs font-mono">
                {ext}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {linting.rules.length > 0 && (
        <div>
          <span className="text-xs font-semibold mb-2 block text-muted-foreground">
            Rules:
          </span>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-2 font-semibold text-xs text-foreground">Rule</th>
                  <th className="text-left px-4 py-2 font-semibold text-xs text-foreground">Level</th>
                </tr>
              </thead>
              <tbody>
                {linting.rules.map((rule, i) => (
                  <tr key={rule.name + i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs text-foreground">{rule.name}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {rule.level}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {linting.ignorePatterns && linting.ignorePatterns.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-muted-foreground">
            Ignored:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {linting.ignorePatterns.map((pat, i) => (
              <Badge key={i} variant="outline" className="text-xs font-mono">
                {pat}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TestingCard({ testing }: { testing: TestingStrategy }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          Framework: {testing.framework}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Min Coverage: {testing.coverage.minimum}%
        </Badge>
        <Badge variant="outline" className="text-xs">
          Coverage Enforced: {testing.coverage.enforced ? 'Yes' : 'No'}
        </Badge>
      </div>

      {testing.types.length > 0 && (
        <div>
          <span className="text-xs font-semibold mb-2 block text-muted-foreground">
            Test Types:
          </span>
          <div className="space-y-2">
            {testing.types.map((testType, i) => (
              <div
                key={testType.type + i}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm capitalize flex-1 text-foreground">
                  {testType.type}
                </span>
                <Badge variant="outline" className="text-xs">
                  {testType.required ? 'Required' : 'Optional'}
                </Badge>
                {testType.coverage !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {testType.coverage}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="text-xs font-semibold mb-1 block text-muted-foreground">
          Patterns:
        </span>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Location: {testing.patterns.unitTestLocation}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Suffix: {testing.patterns.testFileSuffix}
          </Badge>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold mb-1 block text-muted-foreground">
          CI:
        </span>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Run on Push: {testing.ci.runOnPush ? 'Yes' : 'No'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Run on PR: {testing.ci.runOnPr ? 'Yes' : 'No'}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function DocumentationCard({ documentation }: { documentation: DocStrategy }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <h5 className="font-semibold mb-2 text-foreground">
          Code Comments
        </h5>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Style: {documentation.codeComments.style}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Required: {documentation.codeComments.required}
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h5 className="font-semibold mb-2 text-foreground">
          API Documentation
        </h5>
        <div className="flex flex-wrap gap-2">
          {documentation.apiDocs.tool && documentation.apiDocs.tool !== 'none' && (
            <Badge variant="outline" className="text-xs">
              Tool: {documentation.apiDocs.tool}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Auto-Generate: {documentation.apiDocs.autoGenerate ? 'Yes' : 'No'}
          </Badge>
        </div>
      </div>

      {documentation.readme.required && (
        <div className="rounded-lg border border-border p-4">
          <h5 className="font-semibold mb-2 text-foreground">
            README Sections
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {documentation.readme.sections.map((section, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {section}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {documentation.changelog.enabled && (
        <div className="rounded-lg border border-border p-4">
          <h5 className="font-semibold mb-2 text-foreground">
            Changelog
          </h5>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Enabled: Yes
            </Badge>
            {documentation.changelog.format && (
              <Badge variant="outline" className="text-xs">
                Format: {documentation.changelog.format}
              </Badge>
            )}
          </div>
        </div>
      )}

      {documentation.adr?.enabled && (
        <div className="rounded-lg border border-border p-4">
          <h5 className="font-semibold mb-2 text-foreground">
            Architecture Decision Records
          </h5>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Enabled: Yes
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              Location: {documentation.adr.location}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ projectId, status }: { projectId: number; status: string }) {
  const message =
    status === 'intake'
      ? 'Complete the intake chat to generate coding guidelines.'
      : 'No guidelines generated yet. Data will appear here after extraction.';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No Guidelines Generated Yet
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

export function GuidelinesSection({ project }: GuidelinesSectionProps) {
  const guidelines = project.projectData?.codingGuidelines as CodingGuidelines | null;

  if (!guidelines || typeof guidelines !== 'object') {
    return <EmptyState projectId={project.id} status={project.status} />;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          Coding Guidelines
        </h2>
        <p className="text-sm text-muted-foreground">
          Naming conventions, design patterns, linting rules, testing strategy, and documentation standards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Naming Conventions */}
        {guidelines.naming && (
          <CollapsibleCard icon={PenLine} title="Naming Conventions" defaultOpen>
            <NamingConventionsTable naming={guidelines.naming} />
          </CollapsibleCard>
        )}

        {/* Design Patterns */}
        {guidelines.patterns && guidelines.patterns.length > 0 && (
          <CollapsibleCard icon={ScrollText} title="Design Patterns">
            <PatternsCard patterns={guidelines.patterns} />
          </CollapsibleCard>
        )}

        {/* Forbidden Patterns */}
        {guidelines.forbidden && guidelines.forbidden.length > 0 && (
          <CollapsibleCard icon={ShieldAlert} title="Forbidden Patterns">
            <ForbiddenPatternsCard forbidden={guidelines.forbidden} />
          </CollapsibleCard>
        )}

        {/* Linting */}
        {guidelines.linting && (
          <CollapsibleCard icon={FileText} title="Linting Rules">
            <LintingCard linting={guidelines.linting} />
          </CollapsibleCard>
        )}

        {/* Testing Strategy */}
        {guidelines.testing && (
          <CollapsibleCard icon={TestTube} title="Testing Strategy">
            <TestingCard testing={guidelines.testing} />
          </CollapsibleCard>
        )}

        {/* Documentation Strategy */}
        {guidelines.documentation && (
          <CollapsibleCard icon={BookOpen} title="Documentation Strategy">
            <DocumentationCard documentation={guidelines.documentation} />
          </CollapsibleCard>
        )}
      </div>
    </div>
  );
}
