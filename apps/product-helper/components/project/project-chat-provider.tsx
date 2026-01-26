'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useChat, type Message } from 'ai/react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { saveAssistantMessage } from '@/app/actions/conversations';
import {
  parseProjectData,
  parseArtifacts,
  type ParsedProjectData,
  type ParsedArtifact,
} from '@/lib/db/type-guards';

// ============================================================
// Types
// ============================================================

interface ProjectChatContextValue {
  // Project info
  projectId: number;
  projectName: string;
  projectStatus: string;

  // Chat state (from useChat)
  messages: Message[];
  input: string;
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  stop: () => void;
  append: (message: { role: 'user' | 'assistant'; content: string }) => void;

  // Project data
  parsedProjectData: ParsedProjectData;
  parsedArtifacts: ParsedArtifact[];

  // Diagram popup state
  selectedDiagram: ParsedArtifact | null;
  setSelectedDiagram: (artifact: ParsedArtifact | null) => void;

  // Explorer sidebar state
  explorerCollapsed: boolean;
  toggleExplorer: () => void;

  // Chat panel state
  chatPanelCollapsed: boolean;
  toggleChatPanel: () => void;

  // Whether this is a new project (no initial messages)
  isNewProject: boolean;
}

// ============================================================
// Context
// ============================================================

const ProjectChatContext = createContext<ProjectChatContextValue | null>(null);

export function useProjectChat() {
  const ctx = useContext(ProjectChatContext);
  if (!ctx) {
    throw new Error('useProjectChat must be used within a ProjectChatProvider');
  }
  return ctx;
}

// ============================================================
// Provider Props
// ============================================================

export interface ProjectChatProviderProps {
  projectId: number;
  projectName: string;
  projectStatus: string;
  projectVision: string;
  initialMessages: Message[];
  initialProjectData: unknown;
  initialArtifacts: unknown[];
  children: ReactNode;
}

// ============================================================
// Provider Component
// ============================================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ProjectChatProvider({
  projectId,
  projectName,
  projectStatus,
  projectVision,
  initialMessages,
  initialProjectData,
  initialArtifacts,
  children,
}: ProjectChatProviderProps) {
  // Panel state
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<ParsedArtifact | null>(null);

  // SWR for real-time updates of project data and artifacts
  const { data: projectResponse, mutate } = useSWR(
    `/api/projects/${projectId}`,
    fetcher,
    {
      fallbackData: { projectData: initialProjectData, artifacts: initialArtifacts },
      revalidateOnFocus: false,
    }
  );

  // Parse data with type guards
  const parsedProjectData = parseProjectData(
    projectResponse?.projectData ?? initialProjectData
  );
  const parsedArtifacts = parseArtifacts(
    projectResponse?.artifacts ?? initialArtifacts
  );

  // Chat hook
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
      if (message.role === 'assistant') {
        const result = await saveAssistantMessage(projectId, message.content);
        if (!result.success) {
          console.error('Failed to save assistant message:', result.error);
        }
        // Revalidate after save completes
        mutate();
        // Revalidate again after server-side extraction likely finishes.
        // TODO: Replace with polling or server event when extraction
        // provides a completion signal.
        setTimeout(() => mutate(), 5000);
      }
    },
  });

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (chat.isLoading || !chat.input.trim()) return;
      chat.handleSubmit(e);
    },
    [chat]
  );

  // Auto-send first message for new projects
  const hasSentInitialMessage = useRef(false);
  useEffect(() => {
    if (
      initialMessages.length === 0 &&
      !hasSentInitialMessage.current &&
      projectVision
    ) {
      const visionLines = projectVision.split('\n');
      const modeLineIndex = visionLines.findIndex((line) => line.startsWith('[Mode:'));
      const separatorIndex = visionLines.findIndex((line) => line === '---');

      let userDescription = '';
      if (modeLineIndex !== -1 && separatorIndex !== -1) {
        userDescription = visionLines
          .slice(modeLineIndex + 1, separatorIndex)
          .join('\n')
          .trim();
      } else if (modeLineIndex !== -1) {
        userDescription = visionLines
          .slice(modeLineIndex + 1)
          .join('\n')
          .trim();
      }

      if (userDescription && userDescription.length > 10) {
        hasSentInitialMessage.current = true;
        setTimeout(() => {
          chat.append({
            role: 'user',
            content: userDescription,
          });
        }, 500);
      }
    }
  }, [initialMessages.length, projectVision, chat]);

  const toggleExplorer = useCallback(() => {
    setExplorerCollapsed((prev) => !prev);
  }, []);

  const toggleChatPanel = useCallback(() => {
    setChatPanelCollapsed((prev) => !prev);
  }, []);

  const value: ProjectChatContextValue = {
    projectId,
    projectName,
    projectStatus,
    messages: chat.messages,
    input: chat.input,
    isLoading: chat.isLoading,
    handleInputChange: chat.handleInputChange,
    handleSubmit,
    stop: chat.stop,
    append: chat.append,
    parsedProjectData,
    parsedArtifacts,
    selectedDiagram,
    setSelectedDiagram,
    explorerCollapsed,
    toggleExplorer,
    chatPanelCollapsed,
    toggleChatPanel,
    isNewProject: initialMessages.length === 0,
  };

  return (
    <ProjectChatContext.Provider value={value}>
      {children}
    </ProjectChatContext.Provider>
  );
}
