/**
 * User Stories Generation Agent (Phase 9.4)
 *
 * Purpose: Transform use cases into user stories with acceptance criteria
 * Pattern: Structured output with Zod schema validation
 *
 * This agent uses GPT-4o with temperature=0.2 for consistent story generation.
 */

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

// ============================================================
// Types and Schemas
// ============================================================

export type UserStoryPriority = 'critical' | 'high' | 'medium' | 'low';
export type UserStoryEffort = 'xs' | 'small' | 'medium' | 'large' | 'xl';
export type UserStoryStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

export interface UserStoriesContext {
  projectName: string;
  projectVision: string;
  useCases: Array<{
    id: string;
    name: string;
    description: string;
    actor: string;
    trigger?: string;
    outcome?: string;
    preconditions?: string[];
    postconditions?: string[];
    priority?: 'must' | 'should' | 'could' | 'wont';
  }>;
  actors: Array<{
    name: string;
    role: string;
    description?: string;
  }>;
}

export interface GeneratedStory {
  useCaseId: string;
  title: string;
  description: string;
  actor: string;
  epic: string;
  acceptanceCriteria: string[];
  priority: UserStoryPriority;
  estimatedEffort: UserStoryEffort;
}

export interface StoryForInsert {
  projectId: number;
  useCaseId: string;
  title: string;
  description: string;
  actor: string;
  epic: string;
  acceptanceCriteria: string[];
  status: UserStoryStatus;
  priority: UserStoryPriority;
  estimatedEffort: UserStoryEffort;
  order: number;
}

const generatedStorySchema = z.object({
  useCaseId: z.string().describe('The ID of the use case this story derives from'),
  title: z.string().describe('Short, descriptive story title'),
  description: z.string().describe('Full story in "As a [actor], I want [goal], so that [benefit]" format'),
  actor: z.string().describe('The actor/user performing this story'),
  epic: z.string().describe('Epic or feature group this story belongs to'),
  acceptanceCriteria: z.array(z.string())
    .min(2)
    .max(5)
    .describe('2-5 testable acceptance criteria'),
  priority: z.enum(['critical', 'high', 'medium', 'low'])
    .describe('Story priority based on use case importance'),
  estimatedEffort: z.enum(['xs', 'small', 'medium', 'large', 'xl'])
    .describe('Estimated effort using t-shirt sizing'),
});

const userStoriesOutputSchema = z.object({
  stories: z.array(generatedStorySchema)
    .describe('Array of generated user stories'),
});

// ============================================================
// Main Functions
// ============================================================

export async function generateUserStories(
  context: UserStoriesContext
): Promise<GeneratedStory[]> {
  try {
    if (!context.useCases || context.useCases.length === 0) {
      console.warn('No use cases provided for story generation');
      return [];
    }

    if (!context.actors || context.actors.length === 0) {
      console.warn('No actors provided for story generation');
      return [];
    }

    const model = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0.2,
    });

    const structuredModel = model.withStructuredOutput(userStoriesOutputSchema, {
      name: 'generate_user_stories',
    });

    const prompt = `You are an expert Agile product manager transforming use cases into well-structured user stories.

## Project Context
Project Name: ${context.projectName}
Vision: ${context.projectVision}

## Actors
${JSON.stringify(context.actors, null, 2)}

## Use Cases to Transform
${JSON.stringify(context.useCases, null, 2)}

## Instructions

For each use case, generate 1-3 user stories following these rules:

### Story Format
Each story MUST follow the format: "As a [actor], I want [goal], so that [benefit]"

### Story Splitting Guidelines
- Simple use cases: 1 story
- Moderate use cases: 2 stories
- Complex use cases: 2-3 stories

### Acceptance Criteria
Generate 2-5 testable acceptance criteria per story using "Given/When/Then" or "Verify that..." format.

### Priority Mapping
- "must" -> "critical" or "high"
- "should" -> "high" or "medium"
- "could" -> "medium" or "low"
- "wont" -> "low"
- Default: "medium"

### Effort Estimation
- xs: Simple UI change
- small: Single feature with 1-2 components
- medium: Feature requiring 2-3 components
- large: Complex feature with multiple integrations
- xl: Major feature requiring significant architecture work

Generate the user stories now.`;

    const result = await structuredModel.invoke(prompt);

    return result.stories.map(story => ({
      useCaseId: story.useCaseId,
      title: story.title,
      description: story.description,
      actor: story.actor,
      epic: story.epic,
      acceptanceCriteria: story.acceptanceCriteria,
      priority: story.priority as UserStoryPriority,
      estimatedEffort: story.estimatedEffort as UserStoryEffort,
    }));
  } catch (error) {
    console.error('Error generating user stories:', error);
    throw new Error('Failed to generate user stories');
  }
}

export function prepareStoriesForInsert(
  projectId: number,
  stories: GeneratedStory[]
): StoryForInsert[] {
  return stories.map((story, index) => ({
    projectId,
    useCaseId: story.useCaseId,
    title: story.title,
    description: story.description,
    actor: story.actor,
    epic: story.epic,
    acceptanceCriteria: story.acceptanceCriteria,
    status: 'backlog' as UserStoryStatus,
    priority: story.priority,
    estimatedEffort: story.estimatedEffort,
    order: index,
  }));
}

export function mapUseCasePriorityToStoryPriority(
  useCasePriority?: 'must' | 'should' | 'could' | 'wont'
): UserStoryPriority {
  switch (useCasePriority) {
    case 'must': return 'critical';
    case 'should': return 'high';
    case 'could': return 'medium';
    case 'wont': return 'low';
    default: return 'medium';
  }
}

export function validateStory(story: GeneratedStory): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!story.description.toLowerCase().startsWith('as a ')) {
    errors.push('Story description must start with "As a"');
  }

  if (!story.description.includes('I want')) {
    errors.push('Story description must include "I want"');
  }

  if (!story.description.includes('so that')) {
    errors.push('Story description must include "so that"');
  }

  if (story.acceptanceCriteria.length < 2) {
    errors.push('Story must have at least 2 acceptance criteria');
  }

  if (story.acceptanceCriteria.length > 5) {
    errors.push('Story should not have more than 5 acceptance criteria');
  }

  return { valid: errors.length === 0, errors };
}

export function groupStoriesByEpic(stories: GeneratedStory[]): Map<string, GeneratedStory[]> {
  const grouped = new Map<string, GeneratedStory[]>();
  for (const story of stories) {
    const epic = story.epic || 'Uncategorized';
    const existing = grouped.get(epic) || [];
    existing.push(story);
    grouped.set(epic, existing);
  }
  return grouped;
}

export function calculateStoryStats(stories: GeneratedStory[]): {
  total: number;
  byPriority: Record<UserStoryPriority, number>;
  byEffort: Record<UserStoryEffort, number>;
  byEpic: Record<string, number>;
  avgAcceptanceCriteria: number;
} {
  const byPriority: Record<UserStoryPriority, number> = {
    critical: 0, high: 0, medium: 0, low: 0,
  };

  const byEffort: Record<UserStoryEffort, number> = {
    xs: 0, small: 0, medium: 0, large: 0, xl: 0,
  };

  const byEpic: Record<string, number> = {};
  let totalAcceptanceCriteria = 0;

  for (const story of stories) {
    byPriority[story.priority]++;
    byEffort[story.estimatedEffort]++;
    const epic = story.epic || 'Uncategorized';
    byEpic[epic] = (byEpic[epic] || 0) + 1;
    totalAcceptanceCriteria += story.acceptanceCriteria.length;
  }

  return {
    total: stories.length,
    byPriority,
    byEffort,
    byEpic,
    avgAcceptanceCriteria: stories.length > 0
      ? Math.round((totalAcceptanceCriteria / stories.length) * 10) / 10
      : 0,
  };
}

export { generatedStorySchema, userStoriesOutputSchema };
