'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useChat, type Message } from 'ai/react';
import { toast } from 'sonner';
import { stripVisionMetadata } from '@/lib/utils/vision';
import useSWR from 'swr';
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

  // Generation progress
  generationStartedAt: number | null;
  postGenerationPhase: 'idle' | 'saving' | 'complete';

  // Current LangGraph node (from stream markers)
  currentNode: string | null;

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

  // Generation progress tracking
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [postGenerationPhase, setPostGenerationPhase] = useState<'idle' | 'saving' | 'complete'>('idle');
  const prevIsLoading = useRef(false);

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
    onFinish: (message) => {
      if (message.role === 'assistant') {
        // Message is already saved by the backend (langgraph-handler or route.ts).
        // We only handle UI state transitions and data revalidation here.
        setPostGenerationPhase('saving');
        mutate();
        setPostGenerationPhase('complete');
        // Show "complete" briefly, then reset progress state
        setTimeout(() => {
          setPostGenerationPhase('idle');
          setGenerationStartedAt(null);
        }, 2500);
        // Revalidate again after server-side extraction likely finishes.
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
      const userDescription = stripVisionMetadata(projectVision);

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

  // Track generation start (isLoading transitions from false → true)
  useEffect(() => {
    if (chat.isLoading && !prevIsLoading.current) {
      setGenerationStartedAt(Date.now());
      setPostGenerationPhase('idle');
    }
    prevIsLoading.current = chat.isLoading;
  }, [chat.isLoading]);

  // Parse stream status markers from streaming content
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  useEffect(() => {
    if (!chat.isLoading) {
      setCurrentNode(null);
      return;
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;

    const markers = [...lastMsg.content.matchAll(/<!--status:(.*?)-->/g)];
    if (markers.length > 0) {
      try {
        const latest = JSON.parse(markers[markers.length - 1][1]);
        setCurrentNode(latest.node);
      } catch { /* malformed marker */ }
    }
  }, [chat.messages, chat.isLoading]);

  // Strip internal markers and metadata from messages so consumers never see them
  const strippedMessages = useMemo(
    () => {
      let firstUserSeen = false;
      return chat.messages.map((m) => {
        // Strip stream status markers from assistant messages
        if (m.role === 'assistant' && m.content.includes('<!--status:')) {
          return { ...m, content: m.content.replace(/<!--status:.*?-->\r?\n?/g, '') };
        }
        // Strip vision metadata (mode prefix, system context) from first user message
        if (m.role === 'user' && !firstUserSeen) {
          firstUserSeen = true;
          const cleaned = stripVisionMetadata(m.content);
          if (cleaned !== m.content) {
            return { ...m, content: cleaned };
          }
        }
        return m;
      });
    },
    [chat.messages]
  );

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
    messages: strippedMessages,
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
    generationStartedAt,
    postGenerationPhase,
    currentNode,
    isNewProject: initialMessages.length === 0,
  };

  return (
    <ProjectChatContext.Provider value={value}>
      {children}
    </ProjectChatContext.Provider>
  );
}
