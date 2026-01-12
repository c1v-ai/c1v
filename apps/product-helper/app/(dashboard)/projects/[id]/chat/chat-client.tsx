'use client';

import { useChat, type Message } from 'ai/react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'sonner';
import { saveAssistantMessage } from '@/app/actions/conversations';
import { ChatMessages } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatLayout } from '@/components/chat/chat-window';

interface ProjectChatClientProps {
  projectId: number;
  projectName: string;
  projectVision: string;
  initialMessages: Message[];
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
          <p>💬 I'll guide you through:</p>
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
}: ProjectChatClientProps) {
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
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chat.isLoading || !chat.input.trim()) return;
    chat.handleSubmit(e);
  };

  const emptyState = initialMessages.length === 0
    ? <ProjectEmptyState projectName={projectName} />
    : undefined;

  return (
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
  );
}
