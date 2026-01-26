/**
 * MCP API Key Authentication Utilities
 *
 * Provides functions for generating, hashing, and validating API keys
 * used for MCP endpoint authentication.
 *
 * Key format: ph_{projectIdPrefix}_{randomString}
 * Example: ph_00000001_xYz9AbCdEfGhIjKlMnOpQrSt
 */

import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { apiKeys } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

// Constants
const KEY_PREFIX = 'ph';
const PROJECT_ID_PREFIX_LENGTH = 8;
const RANDOM_PART_LENGTH = 24;

/**
 * Generates a new API key for a project.
 */
export async function generateApiKey(projectId: number): Promise<{
  key: string;
  hash: string;
  prefix: string;
}> {
  const randomPart = randomBytes(RANDOM_PART_LENGTH)
    .toString('base64url')
    .slice(0, RANDOM_PART_LENGTH);

  const projectIdStr = projectId.toString().padStart(PROJECT_ID_PREFIX_LENGTH, '0');
  const projectIdPrefix = projectIdStr.slice(0, PROJECT_ID_PREFIX_LENGTH);
  const key = `${KEY_PREFIX}_${projectIdPrefix}_${randomPart}`;
  const keyHash = hashApiKey(key);
  const prefix = key.slice(0, 12);

  return { key, hash: keyHash, prefix };
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Validate an API key against the database
 */
export async function validateApiKey(key: string, projectId: number): Promise<boolean> {
  if (!isValidKeyFormat(key)) return false;

  const keyHash = hashApiKey(key);
  const now = new Date();

  const keys = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.keyHash, keyHash),
        isNull(apiKeys.revokedAt)
      )
    );

  if (keys.length === 0) return false;

  const storedKey = keys[0];

  // Check expiration
  if (storedKey.expiresAt && storedKey.expiresAt < now) {
    return false;
  }

  // Update last used (fire and forget)
  updateKeyLastUsed(storedKey.id).catch(console.error);

  return true;
}

/**
 * Validate and return the API key record
 */
export async function validateAndGetApiKey(
  key: string,
  projectId: number
): Promise<typeof apiKeys.$inferSelect | null> {
  if (!isValidKeyFormat(key)) return null;

  const keyHash = hashApiKey(key);
  const now = new Date();

  const keys = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.projectId, projectId),
        eq(apiKeys.keyHash, keyHash),
        isNull(apiKeys.revokedAt)
      )
    );

  if (keys.length === 0) return null;

  const storedKey = keys[0];

  // Check expiration
  if (storedKey.expiresAt && storedKey.expiresAt < now) {
    return null;
  }

  // Update last used
  await updateKeyLastUsed(storedKey.id);

  return storedKey;
}

/**
 * Update the lastUsedAt timestamp for a key
 */
export async function updateKeyLastUsed(keyId: number): Promise<void> {
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyId));
}

/**
 * Check if a key has a valid format
 */
export function isValidKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const keyRegex = /^ph_\d{8}_[A-Za-z0-9_-]{24}$/;
  return keyRegex.test(key);
}

/**
 * Extract the prefix (first 12 chars) from a key
 */
export function extractKeyPrefix(key: string): string | null {
  if (!key || key.length < 12) return null;
  return key.slice(0, 12);
}

/**
 * Extract project ID from a key
 */
export function extractProjectIdFromKey(key: string): number | null {
  if (!isValidKeyFormat(key)) return null;
  const projectIdStr = key.slice(3, 11);
  const projectId = parseInt(projectIdStr, 10);
  return isNaN(projectId) ? null : projectId;
}

/**
 * Revoke an API key (soft delete)
 */
export async function revokeApiKey(keyId: number): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), isNull(apiKeys.revokedAt)));

  return true;
}

/**
 * Create a new API key record in the database
 */
export async function createApiKeyRecord(params: {
  projectId: number;
  name: string;
  keyHash: string;
  keyPrefix: string;
  scopes?: string[];
  expiresAt?: Date;
}): Promise<typeof apiKeys.$inferSelect> {
  const [record] = await db
    .insert(apiKeys)
    .values({
      projectId: params.projectId,
      name: params.name,
      keyHash: params.keyHash,
      keyPrefix: params.keyPrefix,
      scopes: params.scopes || ['read:prd'],
      expiresAt: params.expiresAt || null,
    })
    .returning();

  return record;
}

/**
 * Get all API keys for a project (without sensitive data)
 */
export async function getProjectApiKeys(projectId: number) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      usageCount: apiKeys.usageCount,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
      expiresAt: apiKeys.expiresAt,
      scopes: apiKeys.scopes,
    })
    .from(apiKeys)
    .where(eq(apiKeys.projectId, projectId));
}

/**
 * Extract API key from Authorization header
 */
export function extractKeyFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Support "Bearer <key>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Support raw key
  if (isValidKeyFormat(authHeader)) {
    return authHeader;
  }

  return null;
}
