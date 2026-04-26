"""Per-artifact retry entrypoint (Cloud Run task variant).

Invoked by the Vercel-side `/api/projects/[id]/artifacts/[kind]/retry` route
(TB1 owns the route; TA3 ships this Cloud Run task per Wave-A scaffold). No
BullMQ — Cloud Run Gen2 task semantics handle retry.

Difference from POST /run-render: this script is a Cloud Run **task** (CLI),
not an HTTP handler. It pulls the latest agent_output_payload from the DB
(TA1's project_runs table OR project_artifacts.input_payload column — TA1's
writer contract; falls back to a CLI-supplied --payload-file when set), then
re-invokes `render_artifact` from orchestrator.py.

Usage:
    python3 run-single-artifact.py --project-id <uuid> --artifact-kind <kind>
    python3 run-single-artifact.py --project-id <uuid> --artifact-kind <kind> \\
        --payload-file /tmp/payload.json
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from orchestrator import render_artifact, _supabase_client  # noqa: E402

log = logging.getLogger("run-single-artifact")
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


def _load_payload_from_db(*, project_id: str, artifact_kind: str) -> dict[str, Any] | None:
    """Re-fetch the agent_output_payload that produced the prior (failed) row.

    TA1's project_artifacts table is expected to persist `input_payload jsonb`
    alongside the status row so retry never re-triggers LangGraph. If the
    column is absent or null, return None — caller must supply --payload-file.
    """
    if os.environ.get("SIDECAR_DRY_RUN") == "1":
        return None
    try:
        client = _supabase_client()
        resp = (
            client.table("project_artifacts")
            .select("input_payload")
            .eq("project_id", project_id)
            .eq("artifact_kind", artifact_kind)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        log.error("DB lookup failed: %s", exc)
        return None

    rows = resp.data or []
    if not rows:
        return None
    return rows[0].get("input_payload")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Cloud Run task: retry one artifact render")
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--artifact-kind", required=True)
    parser.add_argument(
        "--payload-file",
        help="Local JSON file with agent_output_payload (overrides DB lookup)",
    )
    args = parser.parse_args(argv)

    if args.payload_file:
        payload = json.loads(Path(args.payload_file).read_text(encoding="utf-8"))
    else:
        payload = _load_payload_from_db(
            project_id=args.project_id, artifact_kind=args.artifact_kind
        )
        if payload is None:
            log.error(
                "no agent_output_payload available for %s/%s; supply --payload-file",
                args.project_id,
                args.artifact_kind,
            )
            return 2

    result = render_artifact(
        project_id=args.project_id,
        artifact_kind=args.artifact_kind,
        agent_output_payload=payload,
    )
    log.info("retry result: %s", json.dumps({k: v for k, v in result.items() if k != "elapsed_ms"}))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
