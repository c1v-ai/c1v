import { eq, count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  projects,
  projectData,
  artifacts,
  userStories,
  conversations,
} from '@/lib/db/schema';

export type ExplorerData = {
  project: {
    id: number;
    name: string;
    status: string;
    validationScore: number | null;
  };
  completeness: number;
  counts: {
    actors: number;
    useCases: number;
    entities: number;
    stories: number;
    artifacts: number;
    conversations: number;
  };
  hasData: {
    hasSystemOverview: boolean;
    hasSchema: boolean;
    hasTechStack: boolean;
    hasApiSpec: boolean;
    hasInfrastructure: boolean;
    hasGuidelines: boolean;
    hasArchitecture: boolean;
    hasUserStories: boolean;
    hasDiagrams: boolean;
  };
};

/**
 * Load all data needed for the project explorer sidebar in a single query batch.
 * Returns project metadata, section counts, and boolean flags for data presence.
 */
export async function getExplorerData(
  projectId: number
): Promise<ExplorerData | null> {
  // Run queries in parallel to avoid async waterfalls
  const [projectResult, dataResult, artifactCountResult, storyCountResult, conversationCountResult] =
    await Promise.all([
      db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        columns: {
          id: true,
          name: true,
          status: true,
          validationScore: true,
        },
      }),
      db.query.projectData.findFirst({
        where: eq(projectData.projectId, projectId),
        columns: {
          actors: true,
          useCases: true,
          dataEntities: true,
          systemBoundaries: true,
          databaseSchema: true,
          techStack: true,
          apiSpecification: true,
          infrastructureSpec: true,
          codingGuidelines: true,
          completeness: true,
        },
      }),
      db
        .select({ value: count() })
        .from(artifacts)
        .where(eq(artifacts.projectId, projectId)),
      db
        .select({ value: count() })
        .from(userStories)
        .where(eq(userStories.projectId, projectId)),
      db
        .select({ value: count() })
        .from(conversations)
        .where(eq(conversations.projectId, projectId)),
    ]);

  if (!projectResult) {
    return null;
  }

  const actorsArray = Array.isArray(dataResult?.actors)
    ? dataResult.actors
    : [];
  const useCasesArray = Array.isArray(dataResult?.useCases)
    ? dataResult.useCases
    : [];
  const entitiesArray = Array.isArray(dataResult?.dataEntities)
    ? dataResult.dataEntities
    : [];

  const hasJsonbData = (field: unknown): boolean => {
    if (field === null || field === undefined) return false;
    if (Array.isArray(field)) return field.length > 0;
    if (typeof field === 'object') return Object.keys(field).length > 0;
    return false;
  };

  // System overview is considered present if actors or system boundaries exist
  const hasSystemOverview =
    hasJsonbData(dataResult?.actors) ||
    hasJsonbData(dataResult?.systemBoundaries);

  // Architecture is based on system boundaries or data entities
  const hasArchitecture =
    hasJsonbData(dataResult?.systemBoundaries) ||
    hasJsonbData(dataResult?.dataEntities);

  return {
    project: {
      id: projectResult.id,
      name: projectResult.name,
      status: projectResult.status,
      validationScore: projectResult.validationScore,
    },
    completeness: dataResult?.completeness ?? 0,
    counts: {
      actors: actorsArray.length,
      useCases: useCasesArray.length,
      entities: entitiesArray.length,
      stories: storyCountResult[0]?.value ?? 0,
      artifacts: artifactCountResult[0]?.value ?? 0,
      conversations: conversationCountResult[0]?.value ?? 0,
    },
    hasData: {
      hasSystemOverview,
      hasSchema: hasJsonbData(dataResult?.databaseSchema),
      hasTechStack: hasJsonbData(dataResult?.techStack),
      hasApiSpec: hasJsonbData(dataResult?.apiSpecification),
      hasInfrastructure: hasJsonbData(dataResult?.infrastructureSpec),
      hasGuidelines: hasJsonbData(dataResult?.codingGuidelines),
      hasArchitecture,
      hasUserStories: (storyCountResult[0]?.value ?? 0) > 0,
      hasDiagrams: (artifactCountResult[0]?.value ?? 0) > 0,
    },
  };
}
