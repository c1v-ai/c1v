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
    <aside
      className="w-64 border-r flex-shrink-0 h-full overflow-y-auto hidden lg:block"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="p-4">
        {/* MY PROJECTS Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              My Projects
            </h3>
            <Link
              href="/projects"
              className="text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              View all
            </Link>
          </div>

          {projects.length === 0 ? (
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No projects yet
            </p>
          ) : (
            <ul className="space-y-1">
              {projects.slice(0, 5).map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}/chat`}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors hover:bg-opacity-10"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
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
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Collaborating On
            </h3>
            <Link
              href="/projects"
              className="text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              View all
            </Link>
          </div>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No shared projects
          </p>
        </div>
      </div>
    </aside>
  );
}
