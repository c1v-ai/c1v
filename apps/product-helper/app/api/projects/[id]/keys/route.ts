/**
 * API Key Management Routes
 *
 * GET  - List all keys for a project
 * POST - Create a new key (returns full key ONCE)
 */

import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  generateApiKey,
  createApiKeyRecord,
  getProjectApiKeys,
} from '@/lib/mcp/auth';

export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project belongs to team
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const keys = await getProjectApiKeys(projectId);

    return NextResponse.json({
      projectId,
      keys: keys.map((key) => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        lastUsedAt: key.lastUsedAt,
        usageCount: key.usageCount,
        createdAt: key.createdAt,
        revokedAt: key.revokedAt,
        expiresAt: key.expiresAt,
        scopes: key.scopes,
        isActive: !key.revokedAt && (!key.expiresAt || key.expiresAt > new Date()),
      })),
    });
  }
);

export const POST = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project belongs to team
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const { name, scopes, expiresAt } = body;

    // Default name if not provided (field is optional in UI)
    const keyName =
      name && typeof name === 'string' && name.trim().length > 0
        ? name.trim()
        : `Key ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Generate key
    const { key, hash, prefix } = await generateApiKey(projectId);

    // Create record
    const record = await createApiKeyRecord({
      projectId,
      name: keyName,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: scopes || ['read:prd', 'read:schema', 'read:stories'],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Return full key only once
    return NextResponse.json({
      projectId,
      key, // Only returned on creation!
      keyId: record.id,
      name: record.name,
      keyPrefix: record.keyPrefix,
      createdAt: record.createdAt,
      scopes: record.scopes,
      message: 'Save this key now - it will not be shown again',
    });
  }
);
