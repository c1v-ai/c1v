'use client';

import type { Message } from 'ai/react';
import { ProjectChatProvider } from '@/components/project/project-chat-provider';
import { ProjectHeaderCompact } from '@/components/project/project-header-compact';
import { ExplorerSidebar } from '@/components/project/explorer-sidebar';
import { ChatPanel } from '@/components/project/chat-panel';
import { MobileExplorerSheet } from '@/components/project/mobile-explorer-sheet';
import { MobileChatSheet } from '@/components/project/mobile-chat-sheet';
import { DiagramPopup } from '@/components/chat/diagram-popup';
import { useProjectChat } from '@/components/project/project-chat-provider';

interface ProjectLayoutClientProps {
  projectId: number;
  projectName: string;
  projectStatus: string;
  projectVision: string;
  initialMessages: Message[];
  initialProjectData: unknown;
  initialArtifacts: unknown[];
  children: React.ReactNode;
}

function DiagramPopupWrapper() {
  const { selectedDiagram, setSelectedDiagram } = useProjectChat();

  if (!selectedDiagram) return null;

  return (
    <DiagramPopup
      isOpen={!!selectedDiagram}
      onClose={() => setSelectedDiagram(null)}
      syntax={selectedDiagram.mermaid}
      title={selectedDiagram.type.replace('_', ' ')}
    />
  );
}

export function ProjectLayoutClient({
  projectId,
  projectName,
  projectStatus,
  projectVision,
  initialMessages,
  initialProjectData,
  initialArtifacts,
  children,
}: ProjectLayoutClientProps) {
  return (
    <ProjectChatProvider
      projectId={projectId}
      projectName={projectName}
      projectStatus={projectStatus}
      projectVision={projectVision}
      initialMessages={initialMessages}
      initialProjectData={initialProjectData}
      initialArtifacts={initialArtifacts}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        <ProjectHeaderCompact />

        <div className="flex-1 flex min-h-0">
          {/* Explorer sidebar: hidden below lg, flex-col at lg+ */}
          <ExplorerSidebar className="hidden lg:flex" />

          {/* Main content area */}
          <main className="flex-1 min-h-0 min-w-0 overflow-y-auto">
            {children}
          </main>

          {/* Chat panel: hidden below md, flex-col at md+ */}
          <ChatPanel className="hidden md:flex" />
        </div>

        {/* Mobile explorer sheet: hidden at lg+ (sidebar visible) */}
        <div className="lg:hidden">
          <MobileExplorerSheet />
        </div>

        {/* Mobile chat sheet: hidden at md+ (panel visible) */}
        <div className="md:hidden">
          <MobileChatSheet />
        </div>

        {/* Diagram popup: all breakpoints */}
        <DiagramPopupWrapper />
      </div>
    </ProjectChatProvider>
  );
}
