/**
 * Single API Key Management Route
 *
 * DELETE - Revoke a key (soft delete)
 */

import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeApiKey } from '@/lib/mcp/auth';

export const DELETE = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project belongs to team
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Extract keyId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const keyIdIndex = pathParts.indexOf('keys') + 1;
    const keyIdStr = pathParts[keyIdIndex];
    const keyIdNum = parseInt(keyIdStr, 10);

    if (isNaN(keyIdNum)) {
      return NextResponse.json({ error: 'Invalid key ID' }, { status: 400 });
    }

    // Verify key exists and belongs to project
    const key = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.id, keyIdNum), eq(apiKeys.projectId, projectId)),
    });

    if (!key) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (key.revokedAt) {
      return NextResponse.json(
        { error: 'API key already revoked' },
        { status: 400 }
      );
    }

    // Revoke key
    await revokeApiKey(keyIdNum);

    return NextResponse.json({
      success: true,
      keyId: keyIdNum,
      revokedAt: new Date().toISOString(),
    });
  }
);
