/**
 * Supabase Storage signed-URL helper for the v2.1 synthesis pipeline.
 *
 * Per D-V21.08: PDF / PPTX / Bundle ZIP artifacts live in Supabase Storage,
 * accessed via signed URLs with a 30-day TTL. The Cloud Run sidecar (TA3)
 * uploads using a service-role key; the Vercel API surface signs read URLs.
 *
 * Implemented via fetch against the Supabase Storage REST API to avoid pulling
 * in a new runtime dependency. The endpoint is documented at
 * https://supabase.com/docs/reference/api/storage and the signed-URL response
 * shape is `{ signedURL: "/object/sign/<bucket>/<path>?token=..." }`.
 *
 * Per-request cache: callers pass a fresh cache map (e.g. `new Map()`) and
 * reuse it across multiple lookups inside a single API handler. The cache is
 * NEVER module-scoped — signed URLs are tenant-scoped and would leak across
 * requests if cached globally.
 */

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days per D-V21.08

export type SignedUrlCache = Map<string, string>;

export class SupabaseStorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseStorageConfigError';
  }
}

function getStorageConfig(): { url: string; serviceRoleKey: string } {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseStorageConfigError(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for signed-URL generation'
    );
  }

  return { url: url.replace(/\/$/, ''), serviceRoleKey };
}

/**
 * Parse a storage_path of the form `<bucket>/<object/path>` into its parts.
 * The convention TA1's project_artifacts.storage_path follows is `<bucket>/<rest>`.
 */
function splitStoragePath(storagePath: string): { bucket: string; objectPath: string } {
  const trimmed = storagePath.replace(/^\/+/, '');
  const slash = trimmed.indexOf('/');
  if (slash <= 0) {
    throw new Error(
      `Invalid storage_path "${storagePath}": expected "<bucket>/<object-path>"`
    );
  }
  return {
    bucket: trimmed.slice(0, slash),
    objectPath: trimmed.slice(slash + 1),
  };
}

/**
 * Get a signed URL for a Supabase Storage object.
 *
 * @param storagePath - `<bucket>/<object-path>` (matches project_artifacts.storage_path).
 * @param ttlSeconds - signed URL lifetime; defaults to 30 days per D-V21.08.
 * @param cache - per-request cache to avoid re-signing the same path on repeated reads.
 */
export async function getSignedUrl(
  storagePath: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  cache?: SignedUrlCache
): Promise<string> {
  const cacheKey = `${storagePath}::${ttlSeconds}`;
  if (cache?.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const { url, serviceRoleKey } = getStorageConfig();
  const { bucket, objectPath } = splitStoragePath(storagePath);

  const response = await fetch(
    `${url}/storage/v1/object/sign/${bucket}/${objectPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: ttlSeconds }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Supabase signed-URL request failed: ${response.status} ${response.statusText} — ${body}`
    );
  }

  const data = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedFragment = data.signedURL ?? data.signedUrl;
  if (!signedFragment) {
    throw new Error('Supabase signed-URL response missing signedURL field');
  }

  const fullUrl = signedFragment.startsWith('http')
    ? signedFragment
    : `${url}/storage/v1${signedFragment.startsWith('/') ? '' : '/'}${signedFragment}`;

  cache?.set(cacheKey, fullUrl);
  return fullUrl;
}

export const SIGNED_URL_DEFAULT_TTL_SECONDS = DEFAULT_TTL_SECONDS;
