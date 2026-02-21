'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChatMessages, ChatLayout } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { useProjectChat } from './project-chat-provider';
import { GenerationProgressCard } from './generation-progress-card';

export function MobileChatSheet() {
  const [open, setOpen] = useState(false);
  const {
    projectName,
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    stop,
    isNewProject,
  } = useProjectChat();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg border border-accent bg-accent"
        >
          <MessageSquare className="h-5 w-5 text-white" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
              {messages.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Chat - {projectName}
          </span>
        </div>

        {/* Generation progress card */}
        <GenerationProgressCard />

        {/* Chat content */}
        <div className="flex-1 min-h-0">
          <ChatLayout
            content={
              <ChatMessages
                messages={messages}
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
                placeholder="Share your thoughts..."
              />
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
