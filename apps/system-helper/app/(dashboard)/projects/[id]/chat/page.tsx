import { redirect } from 'next/navigation';

interface ProjectChatPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Chat route now redirects to project overview since chat is
 * a persistent panel in the 3-column layout, not a separate page.
 */
export default async function ProjectChatPage({ params }: ProjectChatPageProps) {
  const { id } = await params;
  redirect(`/projects/${id}`);
}
