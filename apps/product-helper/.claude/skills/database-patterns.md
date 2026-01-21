# Database Patterns

Best practices for database operations using Drizzle ORM with PostgreSQL in the product-helper codebase.

## Schema Definition

### Table Structure
```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['draft', 'active', 'completed'] }).default('draft'),
  validationScore: integer('validation_score').default(0),
  collectedData: jsonb('collected_data').$type<CollectedData>(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type inference
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

### Relations
```typescript
// lib/db/schema.ts
import { relations } from 'drizzle-orm';

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
  artifacts: many(artifacts),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  project: one(projects, {
    fields: [conversations.projectId],
    references: [projects.id],
  }),
  messages: many(messages),
}));
```

## Queries

### Basic CRUD Operations
```typescript
// lib/db/queries/projects.ts
import { db } from '../drizzle';
import { projects, type Project, type NewProject } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

// Create
export async function createProject(data: NewProject): Promise<Project> {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

// Read single
export async function getProject(id: string): Promise<Project | null> {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
}

// Read with relations
export async function getProjectWithConversations(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      conversations: {
        orderBy: desc(conversations.createdAt),
        limit: 1,
      },
    },
  });
}

// Read list with pagination
export async function getProjectsByUser(
  userId: string,
  { limit = 10, offset = 0 }: { limit?: number; offset?: number }
): Promise<Project[]> {
  return db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: desc(projects.updatedAt),
    limit,
    offset,
  });
}

// Update
export async function updateProject(
  id: string,
  data: Partial<NewProject>
): Promise<Project | null> {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return project ?? null;
}

// Delete
export async function deleteProject(id: string): Promise<boolean> {
  const result = await db.delete(projects).where(eq(projects.id, id));
  return result.rowCount > 0;
}
```

### Complex Queries
```typescript
// Filtering with multiple conditions
export async function getActiveProjectsByUser(userId: string) {
  return db.query.projects.findMany({
    where: and(
      eq(projects.userId, userId),
      eq(projects.status, 'active')
    ),
  });
}

// Using SQL operators
import { sql, gte, like } from 'drizzle-orm';

export async function searchProjects(query: string, minScore: number) {
  return db.query.projects.findMany({
    where: and(
      like(projects.name, `%${query}%`),
      gte(projects.validationScore, minScore)
    ),
  });
}

// Raw SQL when needed
export async function getProjectStats(userId: string) {
  return db.execute(sql`
    SELECT
      status,
      COUNT(*) as count,
      AVG(validation_score) as avg_score
    FROM projects
    WHERE user_id = ${userId}
    GROUP BY status
  `);
}
```

## Transactions

### Basic Transaction
```typescript
import { db } from '../drizzle';

export async function createProjectWithConversation(
  projectData: NewProject,
  initialMessage: string
) {
  return db.transaction(async (tx) => {
    // Create project
    const [project] = await tx.insert(projects).values(projectData).returning();

    // Create conversation
    const [conversation] = await tx
      .insert(conversations)
      .values({ projectId: project.id })
      .returning();

    // Create initial message
    await tx.insert(messages).values({
      conversationId: conversation.id,
      role: 'system',
      content: initialMessage,
    });

    return project;
  });
}
```

### Transaction with Rollback
```typescript
export async function transferProject(
  projectId: string,
  fromUserId: string,
  toUserId: string
) {
  return db.transaction(async (tx) => {
    // Verify ownership
    const project = await tx.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.userId, fromUserId)
      ),
    });

    if (!project) {
      throw new Error('Project not found or not owned by user');
      // Transaction automatically rolls back on throw
    }

    // Transfer ownership
    await tx
      .update(projects)
      .set({ userId: toUserId, updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    // Log the transfer
    await tx.insert(activityLog).values({
      type: 'project_transfer',
      projectId,
      fromUserId,
      toUserId,
    });

    return { success: true };
  });
}
```

## Migrations

### Creating Migrations
```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Push schema directly (dev only)
pnpm drizzle-kit push
```

### Migration File Structure
```typescript
// drizzle/0001_add_validation_score.sql
ALTER TABLE projects ADD COLUMN validation_score INTEGER DEFAULT 0;

-- drizzle/0002_add_artifacts_table.sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX artifacts_project_id_idx ON artifacts(project_id);
```

## Connection Configuration

### Drizzle Client Setup
```typescript
// lib/db/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL for production
  ...(process.env.NODE_ENV === 'production' && {
    ssl: { rejectUnauthorized: false },
  }),
});

export const db = drizzle(pool, { schema });
```

### Environment-Specific Config
```typescript
// lib/db/config.ts
const configs = {
  development: {
    max: 10,
    idleTimeoutMillis: 30000,
  },
  test: {
    max: 3,
    idleTimeoutMillis: 10000,
  },
  production: {
    max: 20,
    idleTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false },
  },
};

export const poolConfig = configs[process.env.NODE_ENV || 'development'];
```

## Type Safety

### Inferring Types from Schema
```typescript
// Always use inferred types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// For partial updates
export type ProjectUpdate = Partial<Omit<NewProject, 'id' | 'createdAt'>>;
```

### JSONB Column Types
```typescript
// Define JSONB structure
interface CollectedData {
  actors?: Array<{ name: string; type: string }>;
  useCases?: string[];
  boundaries?: string[];
  entities?: Array<{ name: string; attributes: string[] }>;
}

// Use in schema
export const projects = pgTable('projects', {
  // ...
  collectedData: jsonb('collected_data').$type<CollectedData>(),
});

// Type-safe access
const project = await getProject(id);
const actors = project?.collectedData?.actors ?? [];
```

## Testing Database Code

### Test Setup
```typescript
// test/db-setup.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/lib/db/schema';

const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
});

export const testDb = drizzle(testPool, { schema });

// Clean up between tests
export async function cleanDatabase() {
  await testDb.delete(messages);
  await testDb.delete(conversations);
  await testDb.delete(artifacts);
  await testDb.delete(projects);
  await testDb.delete(users);
}
```

### Integration Tests
```typescript
// lib/db/queries/__tests__/projects.integration.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { testDb, cleanDatabase } from '@/test/db-setup';
import { createProject, getProject, updateProject } from '../projects';

describe('Project Queries', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it('should create and retrieve a project', async () => {
    const project = await createProject({
      name: 'Test Project',
      userId: testUserId,
    });

    const retrieved = await getProject(project.id);

    expect(retrieved).toMatchObject({
      id: project.id,
      name: 'Test Project',
      status: 'draft',
    });
  });

  it('should update project fields', async () => {
    const project = await createProject({
      name: 'Original',
      userId: testUserId,
    });

    await updateProject(project.id, { name: 'Updated' });
    const retrieved = await getProject(project.id);

    expect(retrieved?.name).toBe('Updated');
    expect(retrieved?.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
  });
});
```

## Performance Tips

### Use Indexes
```typescript
// In schema
export const projects = pgTable('projects', {
  // ...
}, (table) => ({
  userIdIdx: index('projects_user_id_idx').on(table.userId),
  statusIdx: index('projects_status_idx').on(table.status),
  createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
}));
```

### Select Only Needed Columns
```typescript
// BAD: Fetches all columns
const projects = await db.query.projects.findMany();

// GOOD: Fetch only needed columns
const projects = await db
  .select({
    id: projects.id,
    name: projects.name,
    status: projects.status,
  })
  .from(projects)
  .where(eq(projects.userId, userId));
```

### Batch Operations
```typescript
// BAD: Multiple individual inserts
for (const msg of messages) {
  await db.insert(messagesTable).values(msg);
}

// GOOD: Single batch insert
await db.insert(messagesTable).values(messages);
```

## References

- See `lib/db/schema.ts` for schema definitions
- See `lib/db/queries/` for query functions
- See `drizzle/` for migration files
- See `drizzle.config.ts` for Drizzle Kit configuration
