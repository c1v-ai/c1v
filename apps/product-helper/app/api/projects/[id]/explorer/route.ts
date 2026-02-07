import { withProjectAuth } from '@/lib/api/with-project-auth';
import { getExplorerData } from '@/lib/db/queries/explorer';
import { NextResponse } from 'next/server';

export const GET = withProjectAuth(async (_req, { projectId }) => {
  const data = await getExplorerData(projectId);
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    hasData: data.hasData,
    completeness: data.completeness,
  });
});
