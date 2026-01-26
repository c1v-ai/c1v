'use server';

import { z } from 'zod';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  projects,
  activityLogs,
  type NewProject,
  type NewActivityLog,
  ProjectStatus,
} from '@/lib/db/schema';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

async function logActivity(
  teamId: number,
  userId: number,
  action: string,
  ipAddress?: string
) {
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

// Validation Schemas
const projectMetadataFields = {
  projectType: z.enum(['saas', 'mobile-app', 'marketplace', 'api-service', 'e-commerce', 'internal-tool', 'open-source', 'other']).optional(),
  projectStage: z.enum(['idea', 'prototype', 'mvp', 'growth', 'mature']).optional(),
  userRole: z.enum(['founder', 'product-manager', 'developer', 'designer', 'other']).optional(),
  budget: z.enum(['bootstrap', 'seed', 'series-a', 'enterprise', 'undecided']).optional(),
};

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(5000, 'Vision must be less than 5000 characters'),
  ...projectMetadataFields,
});

const updateProjectSchema = z.object({
  id: z.string().transform(Number),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(5000, 'Vision must be less than 5000 characters'),
  status: z.enum(['intake', 'in_progress', 'validation', 'completed', 'archived']).optional(),
  ...projectMetadataFields,
});

const deleteProjectSchema = z.object({
  id: z.string().transform(Number),
});

/**
 * Create a new PRD project
 */
export const createProject = validatedActionWithUser(
  createProjectSchema,
  async (data, formData, user) => {
    const team = await getTeamForUser();
    if (!team) {
      return { error: 'Team not found' };
    }

    // Check subscription status - allow active, trialing, or free tier (null/undefined means free)
    const subscriptionStatus = (team as any).subscriptionStatus;
    const allowedStatuses = ['active', 'trialing', null, undefined, ''];
    if (subscriptionStatus && !allowedStatuses.includes(subscriptionStatus)) {
      return { error: 'Active subscription required to create projects. Please upgrade your plan.' };
    }

    try {
      const newProject: NewProject = {
        name: data.name,
        vision: data.vision,
        status: ProjectStatus.INTAKE,
        teamId: team.id,
        createdBy: user.id,
        validationScore: 0,
        validationPassed: 0,
        validationFailed: 0,
        ...(data.projectType ? { projectType: data.projectType } : {}),
        ...(data.projectStage ? { projectStage: data.projectStage } : {}),
        ...(data.userRole ? { userRole: data.userRole } : {}),
        ...(data.budget ? { budget: data.budget } : {}),
      };

      const [project] = await db.insert(projects).values(newProject).returning();

      await logActivity(
        team.id,
        user.id,
        `Created project: ${data.name}`
      );

      // Return success with projectId - client will handle navigation
      return { success: 'Project created successfully', projectId: project.id };
    } catch (error) {
      console.error('Error creating project:', error);
      return { error: 'Failed to create project. Please try again.' };
    }
  }
);

/**
 * Update an existing project
 */
export const updateProject = validatedActionWithUser(
  updateProjectSchema,
  async (data, formData, user) => {
    const team = await getTeamForUser();
    if (!team) {
      return { error: 'Team not found' };
    }

    try {
      // Verify project belongs to user's team
      const existingProject = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, data.id),
          eq(projects.teamId, team.id)
        ),
      });

      if (!existingProject) {
        return { error: 'Project not found or access denied' };
      }

      // Update project
      await db
        .update(projects)
        .set({
          name: data.name,
          vision: data.vision,
          status: data.status || existingProject.status,
          projectType: data.projectType ?? existingProject.projectType,
          projectStage: data.projectStage ?? existingProject.projectStage,
          userRole: data.userRole ?? existingProject.userRole,
          budget: data.budget ?? existingProject.budget,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, data.id));

      await logActivity(
        team.id,
        user.id,
        `Updated project: ${data.name}`
      );

      return { success: 'Project updated successfully' };
    } catch (error) {
      console.error('Error updating project:', error);
      return { error: 'Failed to update project. Please try again.' };
    }
  }
);

/**
 * Delete a project
 */
export const deleteProject = validatedActionWithUser(
  deleteProjectSchema,
  async (data, formData, user) => {
    const team = await getTeamForUser();
    if (!team) {
      return { error: 'Team not found' };
    }

    try {
      // Verify project belongs to user's team
      const existingProject = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, data.id),
          eq(projects.teamId, team.id)
        ),
      });

      if (!existingProject) {
        return { error: 'Project not found or access denied' };
      }

      // Delete project (cascade will handle related data)
      await db.delete(projects).where(eq(projects.id, data.id));

      await logActivity(
        team.id,
        user.id,
        `Deleted project: ${existingProject.name}`
      );

      redirect('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      return { error: 'Failed to delete project. Please try again.' };
    }
  }
);

/**
 * Get all projects for the user's team
 */
export async function getProjects() {
  const user = await getUser();
  if (!user) {
    return [];
  }

  const team = await getTeamForUser();
  if (!team) {
    return [];
  }

  try {
    const teamProjects = await db.query.projects.findMany({
      where: eq(projects.teamId, team.id),
      orderBy: [desc(projects.createdAt)],
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectData: true,
      },
    });

    return teamProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: number) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const team = await getTeamForUser();
  if (!team) {
    return null;
  }

  try {
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectData: true,
        artifacts: true,
        conversations: {
          orderBy: (conversations, { asc }) => [asc(conversations.createdAt)],
          limit: 50,
        },
      },
    });

    return project || null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}
