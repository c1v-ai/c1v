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
        title="Create a project folder"
        subtitle="Create a folder on your computer to store your project's code and skills"
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
