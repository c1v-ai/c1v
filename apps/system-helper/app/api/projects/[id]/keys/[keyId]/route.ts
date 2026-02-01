/**
 * Single API Key Management Route
 *
 * DELETE - Revoke a key (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeApiKey } from '@/lib/mcp/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const { id, keyId } = await params;
    const projectId = parseInt(id, 10);
    const keyIdNum = parseInt(keyId, 10);

    if (isNaN(projectId) || isNaN(keyIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Verify project belongs to team
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
