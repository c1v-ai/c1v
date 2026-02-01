import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * User type from getUser() query
 */
type User = NonNullable<Awaited<ReturnType<typeof getUser>>>;

/**
 * Team type from getTeamForUser() query
 */
type Team = NonNullable<Awaited<ReturnType<typeof getTeamForUser>>>;

/**
 * Project type from database query
 */
type Project = typeof projects.$inferSelect;

/**
 * Base authentication context provided to all handlers
 */
export interface AuthContext {
  user: User;
  team: Team;
  projectId: number;
}

/**
 * Extended context when withProject option is true
 */
export interface AuthContextWithProject extends AuthContext {
  project: Project;
}

/**
 * Options for withProjectAuth middleware
 */
export interface WithProjectAuthOptions {
  /**
   * If true, fetches the full project record and includes it in context
   * Handler will receive AuthContextWithProject instead of AuthContext
   */
  withProject?: boolean;
}

/**
 * Route params structure for Next.js 15 App Router
 * Params are now a Promise that must be awaited
 */
type RouteParams = Promise<{ id?: string; projectId?: string }>;

/**
 * Handler function type for routes without project fetching
 */
type ProjectRouteHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Handler function type for routes with project fetching
 */
type ProjectRouteHandlerWithProject = (
  req: NextRequest,
  context: AuthContextWithProject
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with authentication
 * and project authorization logic.
 *
 * Handles:
 * - User authentication (returns 401 if not authenticated)
 * - Team lookup (returns 404 if no team found)
 * - Project ID parsing (returns 400 if invalid)
 * - Optional project fetch with team ownership validation (returns 404 if not found)
 * - Error handling (returns 500 on unexpected errors)
 *
 * @example Basic usage (without project fetch)
 * ```ts
 * export const GET = withProjectAuth(async (req, { user, team, projectId }) => {
 *   // Your handler logic here
 *   return NextResponse.json({ projectId });
 * });
 * ```
 *
 * @example With project fetch
 * ```ts
 * export const GET = withProjectAuth(
 *   async (req, { user, team, projectId, project }) => {
 *     return NextResponse.json(project);
 *   },
 *   { withProject: true }
 * );
 * ```
 */
export function withProjectAuth(
  handler: ProjectRouteHandlerWithProject,
  options: WithProjectAuthOptions & { withProject: true }
): (req: NextRequest, context: { params: RouteParams }) => Promise<NextResponse>;

export function withProjectAuth(
  handler: ProjectRouteHandler,
  options?: WithProjectAuthOptions & { withProject?: false }
): (req: NextRequest, context: { params: RouteParams }) => Promise<NextResponse>;

export function withProjectAuth(
  handler: ProjectRouteHandler | ProjectRouteHandlerWithProject,
  options: WithProjectAuthOptions = {}
): (req: NextRequest, context: { params: RouteParams }) => Promise<NextResponse> {
  return async (req: NextRequest, { params }: { params: RouteParams }) => {
    try {
      // 1. Authenticate user
      const user = await getUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // 2. Get team for authorization
      const team = await getTeamForUser();
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      // 3. Parse project ID from params
      // Support both 'id' and 'projectId' param names
      const resolvedParams = await params;
      const idString = resolvedParams.id ?? resolvedParams.projectId;

      if (!idString) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      const projectId = parseInt(idString, 10);

      if (isNaN(projectId) || projectId <= 0) {
        return NextResponse.json(
          { error: 'Invalid project ID' },
          { status: 400 }
        );
      }

      // 4. If withProject option, fetch and validate project ownership
      if (options.withProject) {
        const project = await db.query.projects.findFirst({
          where: and(
            eq(projects.id, projectId),
            eq(projects.teamId, team.id)
          ),
        });

        if (!project) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
          );
        }

        // Call handler with extended context
        return (handler as ProjectRouteHandlerWithProject)(req, {
          user,
          team,
          projectId,
          project,
        });
      }

      // 5. Call handler with base context
      return (handler as ProjectRouteHandler)(req, {
        user,
        team,
        projectId,
      });
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
