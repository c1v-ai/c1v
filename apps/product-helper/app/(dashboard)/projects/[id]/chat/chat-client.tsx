'use client';

import { useChat, type Message } from 'ai/react';
import { FormEvent, useState, useCallback } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { saveAssistantMessage } from '@/app/actions/conversations';
import { ChatMessages } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatLayout } from '@/components/chat/chat-window';
import { ArtifactsSidebar } from '@/components/chat/artifacts-sidebar';
import { DiagramPopup } from '@/components/chat/diagram-popup';
import {
  parseProjectData,
  parseArtifacts,
  type ParsedProjectData,
  type ParsedArtifact,
} from '@/lib/db/type-guards';
import { useIsDesktop, useIsMobile } from '@/hooks/use-media-query';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

interface ProjectChatClientProps {
  projectId: number;
  projectName: string;
  projectVision: string;
  initialMessages: Message[];
  initialProjectData: any;
  initialArtifacts: any[];
}

function ProjectEmptyState({ projectName }: { projectName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-4 py-16">
      <div
        className="text-7xl"
        role="img"
        aria-label="Robot emoji"
      >
        🤖
      </div>
      <div className="max-w-md">
        <h2
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Welcome to {projectName}
        </h2>
        <p
          className="text-base leading-relaxed mb-4"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          I'll help you define requirements for this project through a conversational approach.
          Let's start by discussing your vision and identifying the key actors and use cases.
        </p>
        <div
          className="text-left text-sm space-y-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          <p>I'll guide you through:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Identifying actors (users, systems, external entities)</li>
            <li>Defining use cases (what users can do)</li>
            <li>Clarifying system boundaries</li>
            <li>Specifying data entities and relationships</li>
          </ul>
        </div>
      </div>
      <p
        className="text-sm"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Start by sharing your thoughts or answering my questions
      </p>
    </div>
  );
}

export function ProjectChatClient({
  projectId,
  projectName,
  projectVision,
  initialMessages,
  initialProjectData,
  initialArtifacts,
}: ProjectChatClientProps) {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<ParsedArtifact | null>(null);

  // Responsive hooks
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();

  // SWR for real-time updates of project data and artifacts
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: projectResponse, mutate } = useSWR(
    `/api/projects/${projectId}`,
    fetcher,
    {
      fallbackData: { projectData: initialProjectData, artifacts: initialArtifacts },
      revalidateOnFocus: false,
    }
  );

  // Parse data with type guards for type safety
  const parsedProjectData = parseProjectData(
    projectResponse?.projectData ?? initialProjectData
  );
  const parsedArtifacts = parseArtifacts(
    projectResponse?.artifacts ?? initialArtifacts
  );

  const chat = useChat({
    api: `/api/chat/projects/${projectId}`,
    initialMessages: initialMessages.length > 0 ? initialMessages : undefined,
    streamMode: 'text',
    onError: (error) => {
      toast.error('Error processing your message', {
        description: error.message,
      });
    },
    onFinish: async (message) => {
      // Save AI response to database
      if (message.role === 'assistant') {
        const result = await saveAssistantMessage(projectId, message.content);
        if (!result.success) {
          console.error('Failed to save assistant message:', result.error);
          // Don't show error to user as message still displays
        }
        // Delayed refetch to allow extraction to complete
        setTimeout(() => mutate(), 3000);
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chat.isLoading || !chat.input.trim()) return;
    chat.handleSubmit(e);
  };

  const handleDiagramClick = useCallback((artifact: ParsedArtifact) => {
    setSelectedDiagram(artifact);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const emptyState = initialMessages.length === 0
    ? <ProjectEmptyState projectName={projectName} />
    : undefined;

  return (
    <div className="flex h-full overflow-hidden" style={{ height: '100%' }}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <ArtifactsSidebar
          projectData={parsedProjectData}
          artifacts={parsedArtifacts}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onDiagramClick={handleDiagramClick}
        />
      )}

      {/* Mobile Sheet */}
      {isMobile && (
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-24 left-4 z-50 rounded-full shadow-lg"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <ArtifactsSidebar
              projectData={parsedProjectData}
              artifacts={parsedArtifacts}
              isCollapsed={false}
              onToggleCollapse={() => setMobileSheetOpen(false)}
              onDiagramClick={(artifact) => {
                handleDiagramClick(artifact);
                setMobileSheetOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <ChatLayout
          content={
            <ChatMessages
              messages={chat.messages}
              emptyStateComponent={emptyState}
              aiEmoji="🤖"
              isLoading={chat.isLoading}
            />
          }
          footer={
            <ChatInput
              value={chat.input}
              onChange={chat.handleInputChange}
              onSubmit={handleSubmit}
              onStop={chat.stop}
              loading={chat.isLoading}
              placeholder="Share your thoughts about the project..."
            />
          }
        />
      </div>

      {/* Diagram Popup */}
      {selectedDiagram && (
        <DiagramPopup
          isOpen={!!selectedDiagram}
          onClose={() => setSelectedDiagram(null)}
          syntax={selectedDiagram.mermaid}
          title={selectedDiagram.type.replace('_', ' ')}
        />
      )}
    </div>
  );
}
