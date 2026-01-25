# Phase 9: Data Model Depth - Research

**Researched:** 2026-01-25
**Domain:** Database schema design, LangChain agents, TypeScript types, Drizzle ORM
**Confidence:** HIGH

## Summary

Research involved analyzing the existing codebase structure, v2-types.ts definitions, current schema.ts implementation, and the extraction agent architecture. The goal is to achieve Epic.dev feature parity by expanding data models for use cases, database schemas, tech stacks, and user stories.

**Key Findings:**
1. **Types already defined** - `lib/db/schema/v2-types.ts` has complete TypeScript interfaces for all Phase 9 models
2. **Schema needs migration** - `projectData` table needs 2 new JSONB columns, plus new `userStories` table
3. **Agents needed** - 3 new extraction agents required (schema, tech-stack, user-stories)
4. **Incremental approach** - New fields can be added without breaking existing functionality

**Primary recommendation:** Execute in 4 sub-phases (9.1-9.4), each adding one data model end-to-end (schema + migration + agent + queries).

---

## Current State Analysis

### Database Schema (lib/db/schema.ts)

**`projects` table:**
- id, name, vision, status, validation tracking, teamId, createdBy, timestamps
- Status: intake | in_progress | validation | completed | archived

**`projectData` table (1:1 with projects):**
- actors (JSONB)
- useCases (JSONB) - Current: `{ id, name, description, actor }`
- systemBoundaries (JSONB)
- dataEntities (JSONB) - Current: `{ name, attributes[], relationships[] }`
- intakeState (JSONB) - LangGraph state
- completeness (0-100)
- lastExtractedAt

**Missing columns:**
- databaseSchema (JSONB) - For 9.2
- techStack (JSONB) - For 9.3

**Missing table:**
- userStories - For 9.4

### Existing Types (lib/db/schema/v2-types.ts)

All target types are already defined:

| Model | Interface | Status |
|-------|-----------|--------|
| Enhanced Use Cases | `EnhancedUseCase`, `FlowStep`, `AlternativeFlow` | Defined |
| Database Schema | `DatabaseSchemaModel`, `DatabaseEntity`, `DatabaseField`, `DatabaseRelationship` | Defined |
| Tech Stack | `TechStackModel`, `TechChoice`, `TechAlternative` | Defined |
| User Stories | `UserStory`, `NewUserStory`, `UserStoryUpdate` | Defined |

### Existing Extraction Architecture

**Pattern:** `lib/langchain/agents/extraction-agent.ts`
- Uses GPT-4o with temperature=0
- Returns `ExtractionResult` validated against Zod schema
- Called from `extract-data.ts` graph node
- Incremental merge via `mergeExtractionData()`

**Key function signature:**
```typescript
export async function extractProjectData(
  conversationHistory: string[],
  projectName: string,
  projectVision: string
): Promise<ExtractionResult>
```

---

## Phase 9.1: Enhanced Use Cases

### Current Use Case Structure
```typescript
// Current (lib/db/schema.ts:342)
type UseCase = {
  id: string;
  name: string;
  description: string;
  actor: string;
  preconditions?: string[];
  postconditions?: string[];
};
```

### Target Structure (v2-types.ts)
```typescript
interface EnhancedUseCase {
  id: string;
  name: string;
  description: string;
  actor: string;
  trigger: string;
  outcome: string;
  preconditions: string[];
  postconditions: string[];
  mainFlow: FlowStep[];
  alternativeFlows: AlternativeFlow[];
  acceptanceCriteria: string[];
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'draft' | 'validated';
}
```

### Implementation Approach

**Option A: Update existing useCases column** (Recommended)
- Pros: No migration needed, backward compatible (new fields optional)
- Cons: Mixed old/new data in same column
- Implementation: Update extraction agent to extract enhanced fields

**Option B: Create new enhancedUseCases column**
- Pros: Clean separation
- Cons: Duplication, migration needed
- Implementation: Add column, migrate data

**Recommendation:** Option A - Update existing column with enhanced extraction. The existing schema already supports preconditions/postconditions. Add new optional fields via extraction agent updates.

### Tasks for 9.1
1. Update `lib/langchain/schemas.ts` - Extend useCaseSchema with new fields
2. Update `lib/langchain/agents/extraction-agent.ts` - Extract enhanced fields
3. Update extraction prompt to ask for flows, triggers, acceptance criteria
4. Add Zod validators for enhanced use case in `v2-validators.ts`
5. Test with sample conversations

---

## Phase 9.2: Full Database Schema Model

### Current Entity Structure
```typescript
// Current (lib/db/schema.ts:356)
type DataEntity = {
  name: string;
  attributes: string[];
  relationships: string[];
};
```

### Target Structure (v2-types.ts)
```typescript
interface DatabaseSchemaModel {
  entities: DatabaseEntity[];
  enums?: DatabaseEnum[];
  version?: string;
  generatedAt?: string;
}

interface DatabaseEntity {
  name: string;
  description: string;
  tableName?: string;
  fields: DatabaseField[];
  relationships: DatabaseRelationship[];
  indexes: DatabaseIndex[];
  constraints?: string[];
}
```

### Implementation Approach

**Database change:** Add `databaseSchema` JSONB column to `projectData`
```sql
ALTER TABLE project_data ADD COLUMN database_schema JSONB;
```

**New agent:** `lib/langchain/agents/schema-extraction-agent.ts`
- Input: Existing dataEntities + conversation history
- Output: Full DatabaseSchemaModel
- Prompt: Infer field types, constraints, relationships from entity names/attributes

### Tasks for 9.2
1. Add `databaseSchema` column to `projectData` table (migration)
2. Create `lib/langchain/agents/schema-extraction-agent.ts`
3. Create prompt template for schema inference
4. Add database queries for schema CRUD
5. Update extraction flow to call schema agent after entities extracted
6. Test with sample projects

---

## Phase 9.3: Tech Stack with Rationale

### Target Structure (v2-types.ts)
```typescript
interface TechStackModel {
  categories: TechChoice[];
  constraints: string[];
  rationale: string;
  estimatedCost?: string;
  scalability?: string;
  generatedAt?: string;
}

interface TechChoice {
  category: TechCategory; // 18 categories
  choice: string;
  version?: string;
  rationale: string;
  alternatives: TechAlternative[];
  documentation?: string;
  license?: string;
}
```

### Implementation Approach

**Database change:** Add `techStack` JSONB column to `projectData`
```sql
ALTER TABLE project_data ADD COLUMN tech_stack JSONB;
```

**New agent:** `lib/langchain/agents/tech-stack-agent.ts`
- Input: Project vision, use cases, data entities, any mentioned tech preferences
- Output: Full TechStackModel with rationale
- Prompt: Recommend tech based on project type, scale, constraints

### Tasks for 9.3
1. Add `techStack` column to `projectData` table (migration)
2. Create `lib/langchain/agents/tech-stack-agent.ts`
3. Create prompt template for tech stack recommendation
4. Add database queries for tech stack CRUD
5. Optionally add intake question for tech preferences
6. Test with sample projects

---

## Phase 9.4: User Stories Model

### Target Structure (v2-types.ts)
```typescript
interface UserStory {
  id: number;
  projectId: number;
  useCaseId?: string;
  title: string;
  description: string; // "As a [actor], I want [goal], so that [benefit]"
  actor: string;
  epic?: string;
  acceptanceCriteria: string[];
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  order: number;
  assignee?: string;
  labels?: string[];
  blockedBy?: number[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Implementation Approach

**Database change:** Create new `user_stories` table
```sql
CREATE TABLE user_stories (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  use_case_id VARCHAR(50),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  actor VARCHAR(100) NOT NULL,
  epic VARCHAR(100),
  acceptance_criteria JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'backlog',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  estimated_effort VARCHAR(20),
  "order" INTEGER NOT NULL DEFAULT 0,
  assignee VARCHAR(100),
  labels JSONB,
  blocked_by JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX user_stories_project_id_idx ON user_stories(project_id);
CREATE INDEX user_stories_status_idx ON user_stories(status);
CREATE INDEX user_stories_priority_idx ON user_stories(priority);
```

**New agent:** `lib/langchain/agents/user-stories-agent.ts`
- Input: Use cases (enhanced), actors
- Output: Array of UserStory objects
- Prompt: Transform each use case into 1+ user stories with acceptance criteria

### Tasks for 9.4
1. Create `userStories` table in schema.ts
2. Generate migration for new table
3. Create `lib/langchain/agents/user-stories-agent.ts`
4. Create prompt template for story generation
5. Add database queries for stories CRUD (create, read, update status, reorder)
6. Add API endpoints: GET/POST/PUT /api/projects/:id/stories
7. Test with sample projects

---

## Dependencies and Execution Order

```
9.1 Enhanced Use Cases    (no dependencies)
       ↓
9.2 Database Schema       (depends on 9.1 for entity context)
       ↓
9.3 Tech Stack            (no hard deps, can run parallel with 9.2)
       ↓
9.4 User Stories          (depends on 9.1 for enhanced use cases)
```

**Recommended execution:**
- Wave 1: 9.1 (Enhanced Use Cases) - Foundation
- Wave 2: 9.2 + 9.3 (Schema + Tech Stack) - Can parallelize
- Wave 3: 9.4 (User Stories) - Depends on 9.1 completion

---

## Technical Patterns

### Pattern: JSONB Column with TypeScript Interface

```typescript
// Schema definition
export const projectData = pgTable('project_data', {
  // ...
  databaseSchema: jsonb('database_schema').$type<DatabaseSchemaModel>(),
  techStack: jsonb('tech_stack').$type<TechStackModel>(),
});

// Type-safe query
const data = await db.query.projectData.findFirst({
  where: eq(projectData.projectId, projectId),
});
const schema: DatabaseSchemaModel | null = data?.databaseSchema;
```

### Pattern: Extraction Agent Structure

```typescript
// lib/langchain/agents/[name]-agent.ts
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const outputSchema = z.object({
  // Define output structure
});

export async function extract[Name](
  context: ExtractorContext
): Promise<z.infer<typeof outputSchema>> {
  const model = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
  });

  const prompt = buildPrompt(context);
  const result = await model.invoke(prompt);

  return outputSchema.parse(JSON.parse(result.content as string));
}
```

### Pattern: Migration File Structure

```typescript
// lib/db/migrations/YYYYMMDD_add_phase9_columns.ts
import { sql } from 'drizzle-orm';
import { db } from '../client';

export async function up() {
  await db.execute(sql`
    ALTER TABLE project_data
    ADD COLUMN database_schema JSONB,
    ADD COLUMN tech_stack JSONB;
  `);

  await db.execute(sql`
    CREATE TABLE user_stories (
      -- ... full definition
    );
  `);
}

export async function down() {
  await db.execute(sql`DROP TABLE IF EXISTS user_stories;`);
  await db.execute(sql`
    ALTER TABLE project_data
    DROP COLUMN IF EXISTS database_schema,
    DROP COLUMN IF EXISTS tech_stack;
  `);
}
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM extraction quality | Medium | Use structured output prompts, validate with Zod |
| Migration on production | High | Test migration locally, backup before deploy |
| Breaking existing data | Medium | All new columns/fields are optional, additive only |
| Agent token costs | Low | Use gpt-4o (cheaper), cache intermediate results |

---

## Common Pitfalls

### Pitfall 1: Optional Fields in Zod Schemas
When defining schemas with optional fields, use `.optional()` explicitly:
```typescript
// Good
z.object({
  trigger: z.string().optional(),
  outcome: z.string().optional(),
});

// Bad - will fail if field missing
z.object({
  trigger: z.string(),
});
```

### Pitfall 2: JSONB Type Safety
Drizzle's `jsonb()` column is `unknown` by default. Use `$type<T>()` for type safety:
```typescript
// Good
databaseSchema: jsonb('database_schema').$type<DatabaseSchemaModel>(),

// Bad - loses type safety
databaseSchema: jsonb('database_schema'),
```

### Pitfall 3: Circular Dependencies in Agents
When agents call each other, avoid circular imports:
```typescript
// Good - pass context, not agent references
extractDatabaseSchema({ entities: extractedEntities });

// Bad - circular dependency
import { extractEntities } from './extraction-agent';
```

---

## Files to Create/Modify

### Create
- `lib/db/migrations/20260125_phase9_data_models.ts` - Migration
- `lib/langchain/agents/schema-extraction-agent.ts` - Schema agent
- `lib/langchain/agents/tech-stack-agent.ts` - Tech stack agent
- `lib/langchain/agents/user-stories-agent.ts` - User stories agent
- `lib/db/queries/project-data.ts` - CRUD queries for new columns
- `lib/db/queries/user-stories.ts` - User stories CRUD
- `app/api/projects/[id]/stories/route.ts` - Stories API

### Modify
- `lib/db/schema.ts` - Add columns, userStories table, relations
- `lib/langchain/schemas.ts` - Extended use case schema
- `lib/langchain/agents/extraction-agent.ts` - Enhanced use case extraction
- `lib/langchain/graphs/nodes/extract-data.ts` - Call new agents

---

## Verification Checklist

### 9.1 Complete When:
- [ ] Use cases have trigger, outcome, acceptance criteria in extraction
- [ ] FlowStep and AlternativeFlow types validated by Zod
- [ ] Existing tests still pass

### 9.2 Complete When:
- [ ] databaseSchema column exists in project_data
- [ ] Schema agent generates valid DatabaseSchemaModel
- [ ] Field types, relationships, indexes populated

### 9.3 Complete When:
- [ ] techStack column exists in project_data
- [ ] Tech stack agent recommends choices with rationale
- [ ] All 18 categories handled

### 9.4 Complete When:
- [ ] user_stories table created and migrated
- [ ] User stories agent transforms use cases to stories
- [ ] API endpoints return valid story data
- [ ] Status updates work (for kanban board in Phase 13)

---

## Sources

### Primary (HIGH confidence)
- Direct code analysis: `lib/db/schema.ts`
- Direct code analysis: `lib/db/schema/v2-types.ts`
- Direct code analysis: `lib/langchain/agents/extraction-agent.ts`
- Direct code analysis: `lib/langchain/schemas.ts`
- Roadmap specification: `.planning/ROADMAP-2.0.md`

### Secondary
- Drizzle ORM documentation for JSONB handling
- LangChain.js documentation for structured output

## Metadata

**Confidence breakdown:**
- Schema design: HIGH - Following existing patterns
- Agent architecture: HIGH - Following existing extraction-agent.ts
- Migration strategy: HIGH - Standard Drizzle patterns
- Risk assessment: MEDIUM - LLM quality is variable

**Research date:** 2026-01-25
**Valid until:** Phase 9 completion
