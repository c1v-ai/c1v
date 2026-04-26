# Manifest Contract — `GET /api/projects/[id]/artifacts/manifest`

**Status:** v1 — frozen by TA3 Wave A (2026-04-25)
**Owner:** TA3 (`c1v-cloudrun-sidecar`)
**Primary consumer:** TA2 `download-dropdown` agent (Wave B, dispatched in 13–20 days)
**Source of truth:** this file. Route docstring at `apps/product-helper/app/api/projects/[id]/artifacts/manifest/route.ts` MUST link back here.

---

## 1. Purpose

A single read-only endpoint that returns everything the project UI needs to render artifact download links. It merges two data sources:

1. **Legacy filesystem manifest** — `artifacts.manifest.jsonl` produced by `scripts/artifact-generators/` runs landed under `.planning/runs/project-<id>/...`. Predates v2.1; still authoritative for self-application runs and local dev.
2. **Per-tenant DB rows** — `project_artifacts` table written by the Cloud Run sidecar after a `POST /api/projects/[id]/synthesize` request. Carries Supabase Storage signed URLs for the v2.1 production path.

TA2's download dropdown reads ONLY this endpoint. It never touches `project_artifacts` directly and never reads the filesystem.

---

## 2. Versioning

The response carries `manifest_contract_version: 'v1'`.

| Bump | Trigger | Examples |
|---|---|---|
| **MAJOR** (`v1` → `v2`) | Shape break: field removal, type change, semantic redefinition | Renaming `dbArtifacts[].kind` → `dbArtifacts[].artifact_kind`; changing `signed_url` from string → object |
| **MINOR** (`v1` → `v1.1`) | Additive only: new optional fields, new enum members on a status union | Adding `dbArtifacts[].size_bytes`; adding `'expired'` to status enum (with consumer fallback path) |
| **No bump** | Backend-only changes invisible to consumers | Switching legacy manifest file format internally, optimizing signed-URL TTL within the documented range |

**Consumer rule (TA2):** treat unknown fields as forward-compatible; pin to `v1` and refuse to render if `manifest_contract_version` is missing or starts with `v2`.

**Producer rule (TA3 / future maintainers):** any MAJOR bump requires a coordinated PR across TA3 (route) + TA2 (consumer) and a new `plans/v21-outputs/ta3/manifest-contract.v2.md` with diff section.

---

## 3. Response shape (`v1`)

```ts
type ManifestResponse = {
  manifest_contract_version: 'v1';

  /** Path of the resolved run directory, relative to repo root.
   *  null when no filesystem run exists for this project (v2.1 production path). */
  runDir: string | null;

  /** Legacy filesystem manifest entries — full row for every artifact recorded. */
  entries: ManifestEntry[];

  /** Latest entry per generator (deduplicated view of `entries`). */
  latest: ManifestEntry[];

  /** v2.1 per-tenant DB extension. One row per `project_artifacts` row.
   *  Empty array if no synthesis run has been kicked off yet. */
  dbArtifacts: DbArtifactEntry[];

  /** Only present on 500 responses (legacy manifest read failed but DB read succeeded). */
  error?: string;
  message?: string;
};

type ManifestEntry = {
  // Shape owned by lib/artifact-generators/manifest.ts — see that file for full type.
  // Includes: generator, target, path, sha256, ts, schemaRef, instanceName, ...
  [key: string]: unknown;
};

type DbArtifactEntry = {
  /** One of EXPECTED_ARTIFACT_KINDS (lib/synthesis/artifacts-bridge.ts) plus optional
   *  sidecar-emitted kinds (mermaid_*, n2_matrix_xlsx, decision_network_v1, decision_matrix_v1). */
  kind: string;

  /** Terminal states are 'ready' and 'failed'. 'pending' appears between
   *  POST /synthesize and the sidecar's per-artifact upsert. */
  status: 'pending' | 'ready' | 'failed';

  /** Mime-family the artifact was produced in. null while pending. */
  format: 'json' | 'html' | 'pdf' | 'pptx' | 'xlsx' | 'zip' | string | null;

  /** Signed Supabase Storage URL with 30-day TTL (D-V21.08).
   *  Present iff status === 'ready' AND signing succeeded.
   *  null on pending, failed, or transient signing error (route logs the cause). */
  signed_url: string | null;

  /** Hex sha256 of the artifact bytes. null on pending/failed. */
  sha256: string | null;

  /** ISO-8601 UTC timestamp of terminal state transition. null while pending. */
  synthesized_at: string | null;
};
```

Field-level notes:

- `signed_url` is the primary download mechanism for v2.1. TA2's dropdown should render it directly as `<a href={signed_url} download>`. No separate proxy route is needed.
- `failure_reason` is intentionally omitted from the manifest endpoint to keep responses cacheable and small. TA2 surfaces failed artifacts as "retry" buttons that hit `GET /synthesize/status` for the human-readable reason.
- `dbArtifacts` and `entries` may overlap (legacy and v2.1 produced the same artifact). TA2 SHOULD prefer `dbArtifacts` when both are present for the same `kind` — DB rows are tenant-scoped; filesystem entries are shared across the team's monorepo runs.

---

## 4. Authorization & RLS

- Route is wrapped in `withProjectAuth` — cross-tenant `projectId` returns 404 before the handler runs.
- `project_artifacts` carries TA1-owned RLS policies as defense-in-depth on the DB read.
- Filesystem reads are unauthenticated at the FS layer; project-scoped path resolution (`.planning/runs/project-<id>/...`) is the only isolation. This is acceptable because legacy manifests are dev-only; production hosts read DB rows.

---

## 5. Latency budget

| Path | Target p95 | Notes |
|---|---|---|
| `dbArtifacts` only (no filesystem run) | < 150ms | DB read + N signed-URL HTTP roundtrips (parallelized via `Promise.all`, deduped via `SignedUrlCache`) |
| Full payload (legacy + DB) | < 400ms | Adds a recursive `readdir` over the run directory |

Signed-URL signing is per-request — TTL is 30 days but URLs are NOT cached across requests (tenant-scoped, would leak).

---

## 6. Change log

| Date | Version | Author | Note |
|---|---|---|---|
| 2026-04-25 | v1 | TA3 Wave A (`docs`) | Initial freeze. Source: route at commit `e2d58b2a` (Wave-A roll-up). |

---

## 7. Open questions / forward-compat hooks

- **TB2 may add `expires_at`** alongside `signed_url` once URL renewal is in scope. That would be MINOR per §2.
- **Pagination** is not contemplated for v1 — the artifact set per project is bounded to single-digit cardinality. If sidecar-emitted optional kinds grow, revisit at MAJOR boundary.
- **Bundle ZIP** (`dbArtifacts[].kind === 'bundle_zip'`) is reserved for v2.2 (TD-team). Consumers should tolerate the kind appearing without breaking.
