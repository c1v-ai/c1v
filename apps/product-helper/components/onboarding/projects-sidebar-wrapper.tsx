import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { ProjectsSidebar } from './projects-sidebar';

// Lightweight project fetch - only what sidebar needs
async function getSidebarProjects() {
  const user = await getUser();
  if (!user) return [];

  const team = await getTeamForUser();
  if (!team) return [];

  try {
    // Only fetch id, name, status - no relations
    const teamProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
      })
      .from(projects)
      .where(eq(projects.teamId, team.id))
      .orderBy(desc(projects.createdAt))
      .limit(5);

    return teamProjects;
  } catch (error) {
    console.error('Error fetching sidebar projects:', error);
    return [];
  }
}

// Server component that fetches and renders the sidebar
export async function ProjectsSidebarWrapper() {
  const sidebarProjects = await getSidebarProjects();
  return <ProjectsSidebar projects={sidebarProjects} />;
}
