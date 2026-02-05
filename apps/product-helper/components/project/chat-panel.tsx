'use client';

import { MessageSquare, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessages, ChatLayout } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { useProjectChat } from './project-chat-provider';
import { GenerationProgressCard } from './generation-progress-card';

function ProjectEmptyState({ projectName }: { projectName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-4 py-16">
      <div className="text-7xl" role="img" aria-label="Robot emoji">
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

export function ChatPanel({ className }: { className?: string }) {
  const {
    projectName,
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    stop,
    chatPanelCollapsed,
    toggleChatPanel,
    isNewProject,
  } = useProjectChat();

  const emptyState =
    isNewProject && messages.length === 0 ? (
      <ProjectEmptyState projectName={projectName} />
    ) : undefined;

  // Collapsed state - narrow strip
  if (chatPanelCollapsed) {
    return (
      <aside
        className={cn('flex-col items-center w-12 border-l flex-shrink-0 pt-3', className)}
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
      >
        <button
          type="button"
          onClick={toggleChatPanel}
          aria-label="Expand chat panel"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <PanelRightOpen className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="mt-2 flex flex-col items-center gap-1">
          <MessageSquare className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {messages.length}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn('flex-col w-[400px] border-l flex-shrink-0 h-full', className)}
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Chat
          </span>
          {messages.length > 0 && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {messages.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleChatPanel}
          aria-label="Collapse chat panel"
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <PanelRightClose className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Generation progress card */}
      <GenerationProgressCard />

      {/* Chat content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatLayout
          content={
            <ChatMessages
              messages={messages}
              emptyStateComponent={emptyState}
              aiEmoji="🤖"
              isLoading={isLoading}
            />
          }
          footer={
            <ChatInput
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onStop={stop}
              loading={isLoading}
              placeholder="Share your thoughts about the project..."
            />
          }
        />
      </div>
    </aside>
  );
}
