/**
 * Module 0 — `user_signals` Drizzle schema.
 *
 * Company-enrichment cache populated by `signup-signals-agent.ts` for
 * workplace-email signups. One row per user (unique on `userId`). Rows
 * older than 30 days are considered stale and MUST be rescraped on next
 * read (TTL enforced in query layer; `scraped_at` is the source of truth).
 *
 * Tenant isolation: RLS on `user_id` match (`app.current_user_id` GUC).
 * A service-role policy allows the backend writer (signup agent) and
 * reads for admin tooling.
 *
 * Mirrors the Zod `companySignalsSchema` shape from
 * `lib/langchain/schemas/module-0/user-profile.ts` — every persisted
 * field has a 1:1 Zod counterpart, but Zod is the source of truth.
 *
 * Migration: 0012_module-0-tables.sql (manual SQL per CLAUDE.md
 * drizzle-kit broken note).
 *
 * @module lib/db/schema/user-signals
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { users } from '../schema';

/**
 * Default TTL for enrichment freshness. Reads MAY treat rows older than
 * this as stale and trigger a rescrape. Kept in code so query layer
 * and migration comments stay in sync.
 */
export const USER_SIGNALS_TTL_DAYS = 30;

export const userSignals = pgTable(
  'user_signals',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Company enrichment envelope (mirrors companySignalsSchema)
    domain: varchar('domain', { length: 253 }),
    companyName: varchar('company_name', { length: 255 }),
    industry: varchar('industry', { length: 120 }),
    employeeCountBand: varchar('employee_count_band', { length: 40 }),
    fundingStage: varchar('funding_stage', { length: 40 }),
    websiteTechStack: jsonb('website_tech_stack')
      .$type<string[]>()
      .notNull()
      .default([]),
    complianceBadges: jsonb('compliance_badges')
      .$type<string[]>()
      .notNull()
      .default([]),

    // Scrape telemetry
    scrapeStatus: varchar('scrape_status', { length: 20 })
      .notNull()
      .default('pending'), // pending | success | failed | skipped
    scrapeError: text('scrape_error'),
    scrapeConfidence: numeric('scrape_confidence', { precision: 4, scale: 3 }),
    scrapedAt: timestamp('scraped_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdUnique: uniqueIndex('user_signals_user_id_unique').on(table.userId),
    domainIdx: index('user_signals_domain_idx').on(table.domain),
    scrapedAtIdx: index('user_signals_scraped_at_idx').on(table.scrapedAt),
  }),
);

export type UserSignalRow = typeof userSignals.$inferSelect;
export type NewUserSignalRow = typeof userSignals.$inferInsert;

export const USER_SIGNAL_STATUSES = [
  'pending',
  'success',
  'failed',
  'skipped',
] as const;
export type UserSignalStatus = (typeof USER_SIGNAL_STATUSES)[number];
