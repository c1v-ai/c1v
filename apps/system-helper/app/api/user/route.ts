import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json(null);
  }

  // SECURITY: Never expose password hash in API response
  const { passwordHash, ...safeUser } = user;
  return Response.json(safeUser);
}
