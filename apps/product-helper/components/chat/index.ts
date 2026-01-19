/**
 * Chat Components Module
 * Exports all chat-related components for easy importing
 */

export { ChatWindow, DefaultEmptyState } from './chat-window';
export type { ChatWindowProps } from './chat-window';

export { ChatMessageBubble, ChatLoadingBubble } from './chat-message-bubble';
export type { ChatMessageBubbleProps } from './chat-message-bubble';

export { ChatInput } from './chat-input';
export type { ChatInputProps } from './chat-input';

export { MarkdownRenderer } from './markdown-renderer';

export { CollapsibleSection } from './collapsible-section';
export type { CollapsibleSectionProps } from './collapsible-section';

export { ArtifactsSidebar } from './artifacts-sidebar';
export type { ArtifactsSidebarProps } from './artifacts-sidebar';

export { DiagramLinkCard, detectDiagramType } from './diagram-link-card';
export type { DiagramLinkCardProps, DiagramInfo, DiagramType as LinkDiagramType } from './diagram-link-card';

export { DiagramPopup } from './diagram-popup';
