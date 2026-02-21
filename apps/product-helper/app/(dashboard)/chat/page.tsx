import { ChatWindow, DefaultEmptyState } from '@/components/chat';

/**
 * Authenticated Chat Page
 * Chat interface with authentication required
 * Uses /api/chat endpoint with user session
 */
export default function ChatPage() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col">
      {/* Page Header */}
      <div className="border-b px-6 py-4 bg-background">
        <h1 className="text-2xl font-bold">
          AI Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get help with creating your Product Requirements Documents
        </p>
      </div>

      {/* Chat Interface */}
      <div className="relative flex-1">
        <ChatWindow
          endpoint="/api/chat"
          emptyStateComponent={<PRDEmptyState />}
          placeholder="Ask me anything about creating PRDs..."
          emoji="🤖"
        />
      </div>
    </div>
  );
}

/**
 * Custom Empty State for PRD Chat
 */
function PRDEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-4">
      <div
        className="text-7xl"
        role="img"
        aria-label="Robot emoji"
      >
        🤖
      </div>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-3">
          AI-Powered PRD Assistant
        </h2>
        <p className="text-base leading-relaxed mb-4 text-muted-foreground">
          I can help you create comprehensive Product Requirements Documents through conversation.
        </p>
        <div className="text-left text-sm space-y-2 text-muted-foreground">
          <p>Ask me to help with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Defining actors and use cases</li>
            <li>Clarifying requirements</li>
            <li>Identifying system boundaries</li>
            <li>Creating data models</li>
            <li>Validating PRD completeness</li>
          </ul>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Start by describing your product vision or asking a question
      </p>
    </div>
  );
}
