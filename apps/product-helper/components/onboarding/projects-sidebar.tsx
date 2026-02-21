'use client';

import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface ProjectsSidebarProps {
  projects: Project[];
}

export function ProjectsSidebar({ projects }: ProjectsSidebarProps) {
  // Truncate project name if too long
  const truncateName = (name: string, maxLength = 25) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <aside className="w-64 border-r flex-shrink-0 h-full overflow-y-auto hidden lg:block bg-background">
      <div className="p-4">
        {/* MY PROJECTS Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Projects
            </h3>
            <Link
              href="/home"
              className="text-xs hover:underline text-accent"
            >
              View all
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet
            </p>
          ) : (
            <ul className="space-y-1">
              {projects.slice(0, 5).map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}/chat`}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <FolderOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{truncateName(project.name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* COLLABORATING ON Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collaborating On
            </h3>
            <Link
              href="/home"
              className="text-xs hover:underline text-accent"
            >
              View all
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No shared projects
          </p>
        </div>
      </div>
    </aside>
  );
}
