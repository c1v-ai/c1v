'use client';

import { useState } from 'react';
import { SetupStep } from './setup-step';
import { ProjectFileDownloads } from './project-file-downloads';
import { InlineApiKeyCreation } from './api-key-management';
import { IdeAccordion } from './ide-accordion';

interface ConnectionsFlowProps {
  projectId: number;
  projectName: string;
  mcpUrl: string;
}

export function ConnectionsFlow({ projectId, projectName, mcpUrl }: ConnectionsFlowProps) {
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Step 1: Create folder & download files */}
      <SetupStep
        stepNumber={1}
        title="Set up your Project Folder"
        subtitle="Create a new project folder, then download CLAUDE.md and SKILL.md into it"
      >
        <ProjectFileDownloads projectId={projectId} projectName={projectName} />
      </SetupStep>

      {/* Step 2: Create API key & configure IDE */}
      <SetupStep
        stepNumber={2}
        title="Create an API key for your dedicated MCP server"
        subtitle="then configure your IDE below"
      >
        <div className="space-y-6">
          <InlineApiKeyCreation
            projectId={projectId}
            onKeyCreated={(key) => setCreatedApiKey(key)}
            onKeyRevoked={() => setCreatedApiKey(null)}
          />

          <IdeAccordion
            projectName={projectName}
            mcpUrl={mcpUrl}
            apiKey={createdApiKey}
          />
        </div>
      </SetupStep>
    </div>
  );
}
