/**
 * Chat Layout - Full Width for Sidebar Support
 *
 * Purpose: Override the max-w-5xl constraint from parent layout
 * to allow the chat page to use a sidebar layout.
 *
 * This layout removes width constraints so the chat page can
 * implement its own flex layout with:
 * - ArtifactsSidebar (left, 288px)
 * - Chat content (flex-1, centered messages)
 */

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      {children}
    </div>
  );
}
