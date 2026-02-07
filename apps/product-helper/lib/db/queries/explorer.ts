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
  sectionStatuses: Record<string, string>;
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
    hasProblemStatement: boolean;
    hasGoalsMetrics: boolean;
    hasNfr: boolean;
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
          problemStatement: true,
          goalsMetrics: true,
          nonFunctionalRequirements: true,
          reviewStatus: true,
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

  // Helpers for stricter checks that match what section components render
  const hasNonEmptyArray = (field: unknown): boolean =>
    Array.isArray(field) && field.length > 0;

  const asRecord = (field: unknown): Record<string, unknown> | null =>
    field && typeof field === 'object' && !Array.isArray(field)
      ? (field as Record<string, unknown>)
      : null;

  // System overview: section checks actors || boundaries.internal/external || entities
  const hasSystemOverview =
    hasJsonbData(dataResult?.actors) ||
    hasJsonbData(dataResult?.systemBoundaries) ||
    entitiesArray.length > 0;

  // Architecture: section checks dataEntities.length > 0 || context_diagram artifact
  // We check entities + artifacts (context_diagram stored as artifact)
  const hasArchitecture =
    entitiesArray.length > 0 ||
    (artifactCountResult[0]?.value ?? 0) > 0;

  // Schema: section checks databaseSchema.tables/entities array length > 0 || class_diagram artifact
  const schemaObj = asRecord(dataResult?.databaseSchema);
  const hasSchema =
    hasNonEmptyArray(schemaObj?.tables) ||
    hasNonEmptyArray(schemaObj?.entities) ||
    (artifactCountResult[0]?.value ?? 0) > 0;

  // API spec: section extracts endpoints from .endpoints, .routes, .paths, or .groups
  const apiObj = asRecord(dataResult?.apiSpecification);
  const hasApiSpec = (() => {
    if (!apiObj) return false;
    if (hasNonEmptyArray(apiObj.endpoints)) return true;
    if (hasNonEmptyArray(apiObj.routes)) return true;
    if (apiObj.paths && typeof apiObj.paths === 'object' && Object.keys(apiObj.paths).length > 0) return true;
    if (hasNonEmptyArray(apiObj.groups)) return true;
    return false;
  })();

  // Infrastructure: section checks for categories array length > 0 || activity_diagram artifact
  const infraObj = asRecord(dataResult?.infrastructureSpec);
  const hasInfrastructure =
    hasNonEmptyArray(infraObj?.categories) ||
    hasNonEmptyArray(infraObj?.sections) ||
    (infraObj !== null && hasJsonbData(dataResult?.infrastructureSpec));

  return {
    project: {
      id: projectResult.id,
      name: projectResult.name,
      status: projectResult.status,
      validationScore: projectResult.validationScore,
    },
    completeness: dataResult?.completeness ?? 0,
    sectionStatuses: (dataResult?.reviewStatus as Record<string, string>) ?? {},
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
      hasSchema,
      hasTechStack: hasJsonbData(dataResult?.techStack),
      hasApiSpec,
      hasInfrastructure,
      hasGuidelines: hasJsonbData(dataResult?.codingGuidelines),
      hasArchitecture,
      hasUserStories: (storyCountResult[0]?.value ?? 0) > 0,
      hasDiagrams: (artifactCountResult[0]?.value ?? 0) > 0,
      hasProblemStatement: hasJsonbData(dataResult?.problemStatement),
      hasGoalsMetrics: hasJsonbData(dataResult?.goalsMetrics),
      hasNfr: hasJsonbData(dataResult?.nonFunctionalRequirements),
    },
  };
}
