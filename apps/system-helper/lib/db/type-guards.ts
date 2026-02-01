import { z } from 'zod';
import type {
  Actor,
  UseCase,
  DataEntity,
  SystemBoundaries,
  ProjectData,
  Artifact,
} from './schema';
import {
  actorSchema,
  useCaseSchema,
  dataEntitySchema,
  systemBoundariesSchema,
} from '../langchain/schemas';

/**
 * Type Guards and Parsers for JSONB fields
 *
 * These utilities provide type-safe parsing of JSONB fields
 * from the database, with graceful fallbacks for invalid data.
 */

// ============================================================
// Array Parsers (for JSONB arrays)
// ============================================================

/**
 * Parse actors from JSONB with validation
 * Returns empty array if data is invalid
 */
export function parseActors(data: unknown): Actor[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is Actor => actorSchema.safeParse(item).success);
}

/**
 * Parse use cases from JSONB with validation
 * Returns empty array if data is invalid
 */
export function parseUseCases(data: unknown): UseCase[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is UseCase => useCaseSchema.safeParse(item).success);
}

/**
 * Parse data entities from JSONB with validation
 * Returns empty array if data is invalid
 */
export function parseDataEntities(data: unknown): DataEntity[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is DataEntity => dataEntitySchema.safeParse(item).success);
}

/**
 * Parse system boundaries from JSONB with validation
 * Returns default empty boundaries if data is invalid
 */
export function parseSystemBoundaries(data: unknown): SystemBoundaries {
  const result = systemBoundariesSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return { internal: [], external: [] };
}

// ============================================================
// Artifact Content Parser
// ============================================================

export interface ArtifactContent {
  mermaid: string;
  metadata?: {
    actorCount?: number;
    useCaseCount?: number;
    generatedAt?: string;
  };
}

/**
 * Parse artifact content from JSONB
 */
export function parseArtifactContent(data: unknown): ArtifactContent | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  if (typeof record.mermaid === 'string') {
    return {
      mermaid: record.mermaid,
      metadata: record.metadata as ArtifactContent['metadata'],
    };
  }

  return null;
}

// ============================================================
// Complete ProjectData Parser
// ============================================================

export interface ParsedProjectData {
  actors: Actor[];
  useCases: UseCase[];
  dataEntities: DataEntity[];
  systemBoundaries: SystemBoundaries;
  completeness: number;
  lastExtractedAt: Date | null;
}

/**
 * Parse all ProjectData fields with type safety
 * Provides default values for any missing or invalid fields
 */
export function parseProjectData(data: ProjectData | null | undefined): ParsedProjectData {
  if (!data) {
    return {
      actors: [],
      useCases: [],
      dataEntities: [],
      systemBoundaries: { internal: [], external: [] },
      completeness: 0,
      lastExtractedAt: null,
    };
  }

  return {
    actors: parseActors(data.actors),
    useCases: parseUseCases(data.useCases),
    dataEntities: parseDataEntities(data.dataEntities),
    systemBoundaries: parseSystemBoundaries(data.systemBoundaries),
    completeness: data.completeness ?? 0,
    lastExtractedAt: data.lastExtractedAt ?? null,
  };
}

// ============================================================
// Artifact Helpers
// ============================================================

export type DiagramType =
  | 'context_diagram'
  | 'use_case'
  | 'class_diagram'
  | 'sequence_diagram'
  | 'activity_diagram'
  | 'unknown';

export interface ParsedArtifact {
  id: number;
  type: DiagramType;
  mermaid: string;
  status: string;
  createdAt: Date;
}

/**
 * Parse artifacts array with content extraction
 */
export function parseArtifacts(artifacts: Artifact[] | null | undefined): ParsedArtifact[] {
  if (!Array.isArray(artifacts)) return [];

  return artifacts
    .map((artifact) => {
      const content = parseArtifactContent(artifact.content);
      if (!content) return null;

      return {
        id: artifact.id,
        type: artifact.type as DiagramType,
        mermaid: content.mermaid,
        status: artifact.status,
        createdAt: artifact.createdAt,
      };
    })
    .filter((a): a is ParsedArtifact => a !== null);
}

// ============================================================
// Completeness Calculation
// ============================================================

/**
 * Calculate completeness percentage based on extracted data
 * Matches the scoring in extraction-agent.ts
 */
export function calculateCompletenessFromData(data: ParsedProjectData): number {
  let score = 0;

  // Actors: 25% (need >= 2)
  if (data.actors.length >= 2) {
    score += 25;
  } else if (data.actors.length === 1) {
    score += 12;
  }

  // Use cases: 35% (need >= 3)
  if (data.useCases.length >= 3) {
    score += 35;
  } else if (data.useCases.length >= 1) {
    score += Math.round((data.useCases.length / 3) * 35);
  }

  // System boundaries: 20% (need both internal and external)
  const hasInternal = data.systemBoundaries.internal.length > 0;
  const hasExternal = data.systemBoundaries.external.length > 0;
  if (hasInternal && hasExternal) {
    score += 20;
  } else if (hasInternal || hasExternal) {
    score += 10;
  }

  // Data entities: 20% (need >= 1)
  if (data.dataEntities.length >= 1) {
    score += 20;
  }

  return Math.min(score, 100);
}
