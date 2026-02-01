'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Project } from '@/lib/db/schema';
import { FileText, Calendar, TrendingUp, MessageSquare, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project & {
    createdByUser?: {
      id: number;
      name: string | null;
      email: string;
    };
  };
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

const statusColors = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const statusLabels = {
  intake: 'Intake',
  in_progress: 'In Progress',
  validation: 'Validation',
  completed: 'Completed',
  archived: 'Archived',
};

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const visionPreview = project.vision.length > 150
    ? project.vision.substring(0, 150) + '...'
    : project.vision;

  const statusKey = project.status as keyof typeof statusColors;
  const statusColor = statusColors[statusKey] || statusColors.intake;
  const statusLabel = statusLabels[statusKey] || 'Unknown';

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "block group",
        // Focus visible for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "h-full transition-all duration-200 cursor-pointer",
        "hover:shadow-lg hover:border-accent",
        // Desktop: enhanced shadow on hover
        "md:hover:shadow-xl"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-accent flex-shrink-0" />
              <h3
                className="font-bold text-lg truncate"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {project.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge className={`${statusColor}`}>
                {statusLabel}
              </Badge>

              {/* Actions menu - visible on hover (desktop) or always accessible */}
              {(onDelete || onEdit) && (
                <div
                  className={cn(
                    "transition-opacity duration-200",
                    // Always visible on mobile, fade in on desktop hover
                    "md:opacity-0 md:group-hover:opacity-100",
                    isHovered && "md:opacity-100"
                  )}
                  onClick={(e) => e.preventDefault()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(project.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(project.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description - shows more on desktop */}
          <p
            className={cn(
              "text-sm text-muted-foreground",
              "line-clamp-2", // 2 lines on mobile
              "md:line-clamp-3" // 3 lines on desktop
            )}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {visionPreview}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{project.validationScore || 0}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>

          {/* Desktop: Quick actions on hover */}
          <div className={cn(
            "flex gap-2 overflow-hidden transition-all duration-200",
            // Hidden by default, shown on hover (desktop only)
            "h-0 opacity-0 -mt-3",
            "md:group-hover:h-auto md:group-hover:opacity-100 md:group-hover:mt-0",
            isHovered && "md:h-auto md:opacity-100 md:mt-0"
          )}>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/projects/${project.id}/chat`;
              }}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/projects/${project.id}`;
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              View PRD
            </Button>
          </div>
        </CardContent>

        {project.createdByUser && (
          <CardFooter className="text-xs text-muted-foreground pt-0">
            Created by {project.createdByUser.name || project.createdByUser.email}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
