import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
  tokenHashIdx: index('password_reset_tokens_token_hash_idx').on(table.tokenHash),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  projects: many(projects),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  passwordResetTokens: many(passwordResetTokens),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================
// PRD-Specific Tables
// ============================================================

export const PROJECT_TYPES = ['saas', 'mobile-app', 'marketplace', 'api-service', 'e-commerce', 'internal-tool', 'open-source', 'other'] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

export const PROJECT_STAGES = ['idea', 'prototype', 'mvp', 'growth', 'mature'] as const;
export type ProjectStage = typeof PROJECT_STAGES[number];

export const USER_ROLES = ['founder', 'product-manager', 'developer', 'designer', 'other'] as const;
export type UserRole = typeof USER_ROLES[number];

export const BUDGET_RANGES = ['bootstrap', 'seed', 'series-a', 'enterprise', 'undecided'] as const;
export type BudgetRange = typeof BUDGET_RANGES[number];

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  vision: text('vision').notNull(),
  projectType: varchar('project_type', { length: 30 }),
  projectStage: varchar('project_stage', { length: 30 }),
  userRole: varchar('user_role', { length: 30 }),
  budget: varchar('budget', { length: 30 }),
  status: varchar('status', { length: 20 }).notNull().default('intake'),

  // Validation tracking
  validationScore: integer('validation_score').default(0),
  validationPassed: integer('validation_passed').default(0),
  validationFailed: integer('validation_failed').default(0),

  // Foreign keys
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  teamIdIdx: index('projects_team_id_idx').on(table.teamId),
  statusIdx: index('projects_status_idx').on(table.status),
  createdByIdx: index('projects_created_by_idx').on(table.createdBy),
}));

export const projectData = pgTable('project_data', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' })
    .unique(),

  // Extracted data (JSON fields)
  actors: jsonb('actors'),
  useCases: jsonb('use_cases'),
  systemBoundaries: jsonb('system_boundaries'),
  dataEntities: jsonb('data_entities'),
  problemStatement: jsonb('problem_statement'),
  goalsMetrics: jsonb('goals_metrics'),

  // Phase 9 v2.0 fields
  databaseSchema: jsonb('database_schema'),
  techStack: jsonb('tech_stack'),
  apiSpecification: jsonb('api_specification'),
  infrastructureSpec: jsonb('infrastructure_spec'),
  codingGuidelines: jsonb('coding_guidelines'),
  nonFunctionalRequirements: jsonb('non_functional_requirements'),

  // Review workflow state per section: { sectionKey: 'draft' | 'awaiting-review' | 'approved' }
  reviewStatus: jsonb('review_status'),

  // Intake agent state (serialized IntakeState for LangGraph)
  intakeState: jsonb('intake_state'),

  // Metadata
  completeness: integer('completeness').default(0), // 0-100
  lastExtractedAt: timestamp('last_extracted_at'),
  lastExtractedMessageIndex: integer('last_extracted_message_index').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const artifacts = pgTable('artifacts', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  content: jsonb('content').notNull(), // Structured diagram data
  imageUrl: text('image_url'), // Generated diagram image URL
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  validationErrors: jsonb('validation_errors'), // Array of validation issues
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('artifacts_project_id_idx').on(table.projectId),
  typeIdx: index('artifacts_type_idx').on(table.type),
}));

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  tokens: integer('tokens'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('conversations_project_id_idx').on(table.projectId),
  createdAtIdx: index('conversations_created_at_idx').on(table.createdAt),
}));

// LangGraph State Checkpointing
export const graphCheckpoints = pgTable('graph_checkpoints', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' })
    .unique(),
  threadId: text('thread_id').notNull(),
  checkpointNs: text('checkpoint_ns').default(''),
  checkpointId: text('checkpoint_id').notNull(),
  parentCheckpointId: text('parent_checkpoint_id'),
  channelValues: jsonb('channel_values').notNull(),
  channelVersions: jsonb('channel_versions').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  projectIdx: index('graph_checkpoints_project_idx').on(table.projectId),
  threadIdx: index('graph_checkpoints_thread_idx').on(table.projectId, table.threadId),
  uniqueCheckpoint: uniqueIndex('graph_checkpoints_unique').on(
    table.projectId,
    table.threadId,
    table.checkpointNs,
    table.checkpointId
  ),
}));

// User Stories (Phase 9.4)
export const userStories = pgTable('user_stories', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  useCaseId: varchar('use_case_id', { length: 50 }),

  // Story content
  title: text('title').notNull(),
  description: text('description').notNull(),
  actor: varchar('actor', { length: 100 }).notNull(),
  epic: varchar('epic', { length: 100 }),

  // Acceptance criteria as JSONB array
  acceptanceCriteria: jsonb('acceptance_criteria').notNull().default([]),

  // Tracking
  status: varchar('status', { length: 20 }).notNull().default('backlog'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  estimatedEffort: varchar('estimated_effort', { length: 20 }).notNull().default('medium'),

  // Ordering for backlog/kanban
  order: integer('order').notNull().default(0),

  // Optional fields
  assignee: varchar('assignee', { length: 100 }),
  labels: jsonb('labels').default([]),
  blockedBy: jsonb('blocked_by').default([]),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('user_stories_project_id_idx').on(table.projectId),
  statusIdx: index('user_stories_status_idx').on(table.status),
  priorityIdx: index('user_stories_priority_idx').on(table.priority),
  epicIdx: index('user_stories_epic_idx').on(table.epic),
  orderIdx: index('user_stories_order_idx').on(table.projectId, table.order),
}));

// API Keys (Phase 11 preparation)
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),

  // Key info
  keyHash: text('key_hash').notNull(),
  keyPrefix: varchar('key_prefix', { length: 8 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),

  // Usage tracking
  lastUsedAt: timestamp('last_used_at'),
  usageCount: integer('usage_count').notNull().default(0),

  // Expiration and revocation
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),

  // Scopes as JSONB array
  scopes: jsonb('scopes').notNull().default(['read:prd']),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  projectIdIdx: index('api_keys_project_id_idx').on(table.projectId),
  keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
  keyPrefixIdx: index('api_keys_key_prefix_idx').on(table.keyPrefix),
}));

// PRD Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  createdByUser: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  projectData: one(projectData),
  artifacts: many(artifacts),
  conversations: many(conversations),
  graphCheckpoint: one(graphCheckpoints),
  userStories: many(userStories),
  apiKeys: many(apiKeys),
}));

export const projectDataRelations = relations(projectData, ({ one }) => ({
  project: one(projects, {
    fields: [projectData.projectId],
    references: [projects.id],
  }),
}));

export const artifactsRelations = relations(artifacts, ({ one }) => ({
  project: one(projects, {
    fields: [artifacts.projectId],
    references: [projects.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  project: one(projects, {
    fields: [conversations.projectId],
    references: [projects.id],
  }),
}));

export const graphCheckpointsRelations = relations(graphCheckpoints, ({ one }) => ({
  project: one(projects, {
    fields: [graphCheckpoints.projectId],
    references: [projects.id],
  }),
}));

export const userStoriesRelations = relations(userStories, ({ one }) => ({
  project: one(projects, {
    fields: [userStories.projectId],
    references: [projects.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  project: one(projects, {
    fields: [apiKeys.projectId],
    references: [projects.id],
  }),
}));


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// PRD Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectData = typeof projectData.$inferSelect;
export type NewProjectData = typeof projectData.$inferInsert;
export type Artifact = typeof artifacts.$inferSelect;
export type NewArtifact = typeof artifacts.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type GraphCheckpoint = typeof graphCheckpoints.$inferSelect;
export type NewGraphCheckpoint = typeof graphCheckpoints.$inferInsert;
export type UserStory = typeof userStories.$inferSelect;
export type NewUserStory = typeof userStories.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// PRD Data Structures
export type Actor = {
  name: string;
  role: string;
  description: string;
  goals?: string[];
};

export type UseCase = {
  id: string;
  name: string;
  description: string;
  actor: string;
  preconditions?: string[];
  postconditions?: string[];
};

export type SystemBoundaries = {
  internal: string[];
  external: string[];
};

export type DataEntity = {
  name: string;
  attributes: string[];
  relationships: string[];
};

// Project with all related data
export type ProjectWithData = Project & {
  projectData?: ProjectData;
  artifacts?: Artifact[];
  conversations?: Conversation[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  REQUEST_PASSWORD_RESET = 'REQUEST_PASSWORD_RESET',
}

export enum ProjectStatus {
  INTAKE = 'intake',
  IN_PROGRESS = 'in_progress',
  VALIDATION = 'validation',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ArtifactType {
  CONTEXT_DIAGRAM = 'context_diagram',
  USE_CASE_DIAGRAM = 'use_case',
  CLASS_DIAGRAM = 'class_diagram',
  SEQUENCE_DIAGRAM = 'sequence_diagram',
  ACTIVITY_DIAGRAM = 'activity_diagram',
}

export enum ArtifactStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  EXPORTED = 'exported',
}

export enum ConversationRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}
