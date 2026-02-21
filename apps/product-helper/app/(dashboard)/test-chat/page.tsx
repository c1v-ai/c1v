import { ChatWindow, DefaultEmptyState } from '@/components/chat';

/**
 * Test Chat Page
 * Demo page for testing chat UI components
 * Uses test API endpoint (no auth required)
 */
export default function TestChatPage() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col">
      {/* Page Header */}
      <div className="border-b px-6 py-4 bg-background">
        <h1 className="text-2xl font-bold">
          Chat Test
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Testing the chat UI components with AI streaming
        </p>
      </div>

      {/* Chat Interface */}
      <div className="relative flex-1">
        <ChatWindow
          endpoint="/api/chat/test"
          emptyStateComponent={<DefaultEmptyState />}
          placeholder="Ask me anything to test the chat..."
          emoji="🤖"
        />
      </div>
    </div>
  );
}
