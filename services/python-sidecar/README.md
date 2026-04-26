# `python-sidecar` — c1v Cloud Run rendering service

Per-artifact rendering sidecar. Owned by TA3 (`c1v-cloudrun-sidecar`). Boundary
locked by **D-V21.24** (2026-04-25):

> Vercel hosts LangGraph orchestration + all LLM calls. Cloud Run receives
> one `POST /run-render` per artifact, invokes a canonical Python generator
> from `scripts/artifact-generators/`, uploads the result to Supabase
> Storage, and upserts the matching `project_artifacts` row.

The sidecar **does not** orchestrate, branch, or call LLMs. It is a stateless
function-as-a-service over the canonical generators.

---

## Layout

```
services/python-sidecar/
├── orchestrator.py        # Flask app: GET /healthz + POST /run-render
├── run-single-artifact.py # CLI re-entry for local + Cloud Run Job runs
├── Dockerfile             # Build context = repo root (pulls scripts/artifact-generators/)
├── cloud-run.yaml         # Knative service manifest (cpu=2, mem=4Gi, conc=1, max=10)
├── warm-up.yaml           # Cloud Scheduler cron — /healthz every 5m to bound cold start
├── requirements.txt       # Sidecar-only deps (flask, gunicorn, supabase)
├── scripts/
│   └── render-mermaid.sh  # mmdc → PNG for weasyprint pre-render (R-V21.02)
└── __tests__/             # pytest suite (orchestrator + registry + failure semantics)
```

---

## Endpoints

### `GET /healthz` — liveness + warm-up
Returns `{"ok": true, "service": "python-sidecar"}`. Hit every 5 min by
`warm-up.yaml` so Cloud Run keeps at least one warm instance and EC-V21-A.2
cold-start p95 < 15s holds in practice.

### `POST /run-render` — render one artifact

```jsonc
// Request
{
  "project_id":           "<uuid>",
  "artifact_kind":        "recommendation_html",
  "agent_output_payload": { /* schema-valid instance the generator expects */ }
}

// Success — 200
{ "ok": true, "sha256": "<hex>", "storage_path": "<bucket-key>", "elapsed_ms": 2340 }

// Per-artifact failure — 200 (NOT 5xx; see "Failure semantics" below)
{ "ok": false, "failure_reason": "generator timeout after 240s" }
```

Supported `artifact_kind` values (see `ARTIFACT_REGISTRY` in `orchestrator.py`):

| kind | generator | target | format |
|---|---|---|---|
| `recommendation_json` | `gen-arch-recommendation.py` | `json-enriched` | json |
| `recommendation_html` | `gen-arch-recommendation.py` | `html` | html |
| `recommendation_pdf`  | `gen-arch-recommendation.py` | `pdf`  | pdf  |
| `recommendation_pptx` | `gen-arch-recommendation.py` | `pptx` | pptx |
| `hoq_xlsx`            | `gen-qfd.py`                 | `xlsx` | xlsx |
| `fmea_early_xlsx`     | `gen-fmea.py`                | `xlsx` | xlsx |
| `fmea_residual_xlsx`  | `gen-fmea.py`                | `xlsx` | xlsx |

Unknown kinds return `{"ok": false, "failure_reason": "unknown artifact_kind: ..."}`
with a `failed` row written upstream.

---

## Writer contract (`project_artifacts`)

The sidecar always upserts the matching row, regardless of outcome:

```sql
INSERT INTO project_artifacts (project_id, artifact_kind, ...)
VALUES (...)
ON CONFLICT (project_id, artifact_kind) DO UPDATE SET ...
```

| Column | On `ready` | On `failed` |
|---|---|---|
| `synthesis_status` | `'ready'` | `'failed'` |
| `synthesized_at` | now() | now() |
| `sha256` | hex digest of bytes | (unchanged) |
| `format` | one of json/html/pdf/pptx/xlsx/zip | (unchanged) |
| `storage_path` | `<bucket>/<project_id>/<kind>.<ext>` | (unchanged) |
| `failure_reason` | NULL | short string, ≤ 500 chars |

The row is pre-created in `synthesis_status='pending'` by
`POST /api/projects/[id]/synthesize` on the Vercel side. The sidecar only
ever transitions `pending → ready` or `pending → failed`.

---

## Failure semantics — partial-success is the contract

Per `orchestrator.py` module docstring: **a render exception writes the
`failed` row and returns HTTP 200** with `{"ok": false, ...}`.

Why: the LangGraph driver on Vercel fans out one HTTP call per artifact.
A 5xx from the sidecar would force the graph to abort the whole run; a 200 +
`ok=false` lets sibling artifacts complete and powers TA2's per-artifact
retry button. The only paths that do return non-200 are malformed requests
(missing `project_id`/`artifact_kind`/`agent_output_payload` → 400).

The Flask handler wraps `render_artifact` in a try/except that catches every
exception class — the sidecar process never halts on a render bug.

---

## Mermaid pre-render (R-V21.02)

`recommendation_pdf` always runs `_pre_render_mermaid` before invoking
weasyprint. The walker rewrites any string containing
`flowchart | sequenceDiagram | graph TD | graph LR | stateDiagram` into a
base64-PNG `<img>` tag via `scripts/render-mermaid.sh` (mmdc CLI driving
system Chromium).

If mmdc fails for a diagram, the original mermaid source survives — the PDF
will show the source code block rather than crash. Other targets (HTML, PPTX,
JSON, XLSX) skip pre-render entirely.

---

## Local development

```bash
# From repo root
docker build -f services/python-sidecar/Dockerfile -t python-sidecar .

# Dry-run mode: skip Supabase writes + storage uploads.
docker run --rm -p 8080:8080 \
  -e SIDECAR_DRY_RUN=1 \
  -e GENERATORS_DIR=/app/generators \
  python-sidecar

# Sanity check
curl -s localhost:8080/healthz
curl -s localhost:8080/run-render \
  -H 'content-type: application/json' \
  -d '{"project_id":"00000000-0000-0000-0000-000000000000","artifact_kind":"hoq_xlsx","agent_output_payload":{ /* valid HoQ instance */ }}'
```

`SIDECAR_DRY_RUN=1` disables both `_upsert_artifact_row` and
`_upload_to_storage` so you can iterate against the registry + generators
without a Supabase backend.

### Tests

```bash
cd services/python-sidecar
pip install -r requirements.txt
pytest __tests__/  # registry + failure-semantics + dry-run upsert
```

---

## Deployment

### One-time IAM

```bash
# Sidecar runtime SA (writes to Storage + DB)
gcloud iam service-accounts create python-sidecar-runtime --project <PROJECT>
gcloud projects add-iam-policy-binding <PROJECT> \
  --member serviceAccount:python-sidecar-runtime@<PROJECT>.iam.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor

# Vercel-side caller (only this SA may invoke /run-render)
gcloud run services add-iam-policy-binding python-sidecar \
  --region us-central1 \
  --member serviceAccount:vercel-invoker@<PROJECT>.iam.gserviceaccount.com \
  --role roles/run.invoker

# Cloud Scheduler warm-up SA
gcloud iam service-accounts create warmup-invoker --project <PROJECT>
gcloud run services add-iam-policy-binding python-sidecar \
  --region us-central1 \
  --member serviceAccount:warmup-invoker@<PROJECT>.iam.gserviceaccount.com \
  --role roles/run.invoker
```

### Secrets (Secret Manager)

```bash
echo -n "$SUPABASE_URL"               | gcloud secrets create supabase-url --data-file=-
echo -n "$SUPABASE_SERVICE_ROLE_KEY"  | gcloud secrets create supabase-service-role-key --data-file=-
```

### Deploy

```bash
# Build + push
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/<PROJECT>/c1v/python-sidecar:latest \
  --config services/python-sidecar/Dockerfile

# Apply service config (cpu=2, mem=4Gi, conc=1, max=10)
gcloud run services replace services/python-sidecar/cloud-run.yaml \
  --region us-central1 --project <PROJECT>

# Apply Cloud Scheduler warm-up (after first deploy — needs the service URL)
gcloud scheduler jobs create http python-sidecar-warmup \
  --location us-central1 \
  --schedule "*/5 * * * *" \
  --uri "https://python-sidecar-<HASH>-uc.a.run.app/healthz" \
  --http-method GET \
  --oidc-service-account-email warmup-invoker@<PROJECT>.iam.gserviceaccount.com
```

### Sizing

`cloud-run.yaml`: cpu=2, memory=4Gi, timeoutSeconds=900, concurrency=1,
maxScale=10, minScale=0. Concurrency=1 because each request shells out to a
generator subprocess + tempdir; co-tenancy on a single instance has no
benefit and risks tempdir collisions. minScale=0 keeps idle cost ~$0; the
warm-up cron bounds first-request latency. If EC-V21-A.2 cold-start p95
still exceeds 15s after a week of warm-up cron, flip `minScale: 0 → 1`
(≈ $3/mo).

---

## Operator runbook

### "An artifact is stuck in `pending`"

1. Check Cloud Run logs for the project's `run_render` invocation:
   `gcloud run services logs read python-sidecar --region us-central1 --filter "textPayload:<project_id>"`
2. If no log line exists, the LangGraph node on Vercel never fired the call —
   investigate the Vercel function logs, NOT the sidecar.
3. If the log shows `generator timeout after 240s`, raise
   `GENERATOR_TIMEOUT_S` (in `cloud-run.yaml`) for the affected kind. The
   default 240s suits all 7 artifacts at expected payload sizes.
4. If the log shows `mmdc failed for diagram`, the artifact still rendered
   without the diagram (per Mermaid pre-render fallback). This is acceptable
   for v2.1; file a follow-up only if it recurs > 1% of PDFs.

### "Storage uploads are failing"

`SUPABASE_SERVICE_ROLE_KEY` rotated or `project-artifacts` bucket missing.
The sidecar uses `file_options={"upsert": "true"}` so re-uploads are
idempotent — once the secret is fixed, re-fire the synthesis run from the
UI.

### "I need to render one artifact manually"

`run-single-artifact.py` is the CLI shim used by Cloud Run Jobs and ad-hoc
ops. See its module docstring for invocation; it shares the same
`render_artifact` core path as the HTTP handler.

### "Cold-start is too slow"

In order of cost / impact:
1. Verify `warm-up.yaml` Scheduler job is running (`gcloud scheduler jobs list`).
2. Bump `cloud-run.yaml` minScale to 1 (~$3/mo).
3. Check Dockerfile layer-cache health — chromium + mmdc add ~700MB; if a
   recent change moved them above the pip layer, the image is rebuilding
   the heavy layer on every push.

---

## Boundary invariants (do NOT change without re-opening D-V21.24)

- **No LLM calls.** The sidecar must not import `langchain`, `anthropic`, or
  `openai`. If a generator needs LLM output, the orchestrating LangGraph
  node on Vercel computes it and passes the result in `agent_output_payload`.
- **No graph state.** The sidecar is stateless across requests beyond the
  Cloud Run instance lifecycle. No SQLite, no Redis, no in-process cache of
  project state.
- **Generators are read-only.** `scripts/artifact-generators/` is bind-copied
  into `/app/generators/` at image-build time. Never patch a generator from
  inside the sidecar — fix it upstream and rebuild.
- **Failure mode is row-level.** The HTTP handler must return 200 for any
  per-artifact error. 5xx from `/run-render` is reserved for malformed
  requests and unrecoverable infra errors (gunicorn worker crash).

---

## Cross-references

- Manifest contract (TA2 consumer surface): `plans/v21-outputs/ta3/manifest-contract.md`
- Wave-A verification report: `plans/v21-outputs/ta3/verification-report.md`
- TA3 spec: `.claude/plans/team-spawn-prompts-v2.1.md` §TA3
- Master plan: `plans/c1v-MIT-Crawley-Cornell.v2.md` §15 + v2.1 addendum
