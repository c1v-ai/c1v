"""c1v Cloud Run sidecar — per-artifact rendering only.

Boundary (D-V21.24, locked 2026-04-25 19:50 EDT):
    Vercel hosts LangGraph orchestration + all LLM calls.
    Cloud Run sidecar receives `POST /run-render` per artifact and renders via
    canonical Python generators under `scripts/artifact-generators/`. NO graph
    orchestration on the sidecar.

Request shape:
    POST /run-render
    {
      "project_id":           "uuid",
      "artifact_kind":        "recommendation_html" | "recommendation_pdf" | ...,
      "agent_output_payload": <pre-computed JSON instance the generator expects>
    }

Project_artifacts writer contract (TA1 owns the table; TA3 owns this writer
pattern):

    upsert ON CONFLICT (project_id, artifact_kind) DO UPDATE
      synthesis_status: 'pending' (created upstream) -> 'ready' | 'failed'
      synthesized_at:   timestamp on terminal state
      sha256:           hex digest of bytes (ready only)
      format:           'json' | 'html' | 'pdf' | 'pptx' | 'xlsx' | 'zip'
      storage_path:     Supabase Storage bucket key (ready only)
      failure_reason:   short string (failed only)

Failure semantics: per-artifact try/except. A render exception writes the
'failed' row with `failure_reason` and returns 200 with body
`{"ok": false, "failure_reason": ...}`. The sidecar process MUST NOT halt — the
LangGraph driver on Vercel fans out one HTTP call per artifact, and partial
success is the contract that powers TA2's per-artifact retry button.

Mermaid + weasyprint: `recommendation_pdf` always pre-renders Mermaid blocks via
`scripts/render-mermaid.sh` (mmdc → PNG) before invoking weasyprint, mitigating
R-V21.02 (raw `<div class='mermaid'>` reaching weasyprint silently drops the
diagram).
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import subprocess
import sys
import tempfile
import time
import traceback
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("python-sidecar")

GENERATORS_DIR = Path(os.environ.get("GENERATORS_DIR", "/app/generators")).resolve()
RENDER_MERMAID_SH = Path(__file__).resolve().parent / "scripts" / "render-mermaid.sh"
STORAGE_BUCKET = os.environ.get("ARTIFACT_STORAGE_BUCKET", "project-artifacts")

# Map artifact_kind -> (generator script, render target, schemaRef, file ext, mime)
# Generator names match scripts/artifact-generators/gen-*.py (canonical, do NOT modify).
ARTIFACT_REGISTRY: dict[str, dict[str, str]] = {
    "recommendation_json": {
        "generator": "gen-arch-recommendation.py",
        "target": "json-enriched",
        "schema_ref": "synthesis/architecture-recommendation.schema.json",
        "ext": "json",
        "format": "json",
    },
    "recommendation_html": {
        "generator": "gen-arch-recommendation.py",
        "target": "html",
        "schema_ref": "synthesis/architecture-recommendation.schema.json",
        "ext": "html",
        "format": "html",
    },
    "recommendation_pdf": {
        "generator": "gen-arch-recommendation.py",
        "target": "pdf",
        "schema_ref": "synthesis/architecture-recommendation.schema.json",
        "ext": "pdf",
        "format": "pdf",
    },
    "recommendation_pptx": {
        "generator": "gen-arch-recommendation.py",
        "target": "pptx",
        "schema_ref": "synthesis/architecture-recommendation.schema.json",
        "ext": "pptx",
        "format": "pptx",
    },
    "hoq_xlsx": {
        "generator": "gen-qfd.py",
        "target": "xlsx",
        "schema_ref": "module-5-hoq/hoq.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    "fmea_early_xlsx": {
        "generator": "gen-fmea.py",
        "target": "xlsx",
        "schema_ref": "module-8-risk/fmea.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    "fmea_residual_xlsx": {
        "generator": "gen-fmea.py",
        "target": "xlsx",
        "schema_ref": "module-8-risk/fmea.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    # ── Wave-E UI export gap (2026-04-29) ───────────────────────────────
    # Optional artifact kinds. The Vercel pre-create on synthesis kickoff
    # does NOT include these in EXPECTED_ARTIFACT_KINDS — they're added on
    # demand by the sidecar when the generator produces them. UI surfacing
    # via DownloadDropdown picks them up automatically.
    #
    # gen-n2.py: pptx target is explicitly NOT implemented; do not add
    # n2_matrix_pptx until gen-n2.py emits it. xlsx is supported via the
    # legacy n2_from_json.py adapter the migrator wraps.
    "n2_matrix_xlsx": {
        "generator": "gen-n2.py",
        "target": "xlsx",
        "schema_ref": "n2-matrix.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    "decision_network_xlsx": {
        "generator": "gen-decision-net.py",
        "target": "xlsx",
        "schema_ref": "decision-network.stub.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    "decision_network_svg": {
        "generator": "gen-decision-net.py",
        "target": "svg",
        "schema_ref": "decision-network.stub.schema.json",
        "ext": "svg",
        "format": "svg",
    },
    "form_function_map_xlsx": {
        "generator": "gen-form-function.py",
        "target": "xlsx",
        "schema_ref": "form-function-map.stub.schema.json",
        "ext": "xlsx",
        "format": "xlsx",
    },
    "form_function_map_svg": {
        "generator": "gen-form-function.py",
        "target": "svg",
        "schema_ref": "form-function-map.stub.schema.json",
        "ext": "svg",
        "format": "svg",
    },
    "form_function_map_mmd": {
        "generator": "gen-form-function.py",
        "target": "mmd",
        "schema_ref": "form-function-map.stub.schema.json",
        "ext": "mmd",
        "format": "mmd",
    },
}


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _supabase_client():
    """Service-role Supabase client. Bypasses RLS for writes only.

    Lazy-imported so unit tests can run without the dependency installed.
    """
    from supabase import create_client  # type: ignore

    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


def _upsert_artifact_row(
    *,
    project_id: str,
    artifact_kind: str,
    status: str,
    sha256: str | None = None,
    storage_path: str | None = None,
    format: str | None = None,
    failure_reason: str | None = None,
) -> None:
    row: dict[str, Any] = {
        "project_id": project_id,
        "artifact_kind": artifact_kind,
        "synthesis_status": status,
        "synthesized_at": "now()",
    }
    if sha256 is not None:
        row["sha256"] = sha256
    if storage_path is not None:
        row["storage_path"] = storage_path
    if format is not None:
        row["format"] = format
    if failure_reason is not None:
        row["failure_reason"] = failure_reason

    if os.environ.get("SIDECAR_DRY_RUN") == "1":
        log.info("DRY_RUN upsert project_artifacts: %s", row)
        return

    client = _supabase_client()
    client.table("project_artifacts").upsert(
        row, on_conflict="project_id,artifact_kind"
    ).execute()


def _upload_to_storage(*, project_id: str, artifact_kind: str, file_path: Path, ext: str) -> str:
    """Upload to Supabase Storage; return storage_path key."""
    storage_path = f"{project_id}/{artifact_kind}.{ext}"
    if os.environ.get("SIDECAR_DRY_RUN") == "1":
        log.info("DRY_RUN upload to %s/%s", STORAGE_BUCKET, storage_path)
        return storage_path

    client = _supabase_client()
    with file_path.open("rb") as fh:
        client.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=fh.read(),
            file_options={"upsert": "true"},
        )
    return storage_path


def _pre_render_mermaid(instance: dict[str, Any], work_dir: Path) -> None:
    """Pre-render any Mermaid blocks to PNG so weasyprint never sees raw mmd.

    Walks the agent_output_payload for `.mermaid` strings and rewrites them to
    base64-PNG `<img>` tags via mmdc. Conservative: only invoked for the PDF
    target. R-V21.02 mitigation.
    """
    if not RENDER_MERMAID_SH.exists():
        log.warning("render-mermaid.sh missing at %s; skipping pre-render", RENDER_MERMAID_SH)
        return

    def _walk(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {k: _walk(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_walk(v) for v in obj]
        if isinstance(obj, str) and any(
            kw in obj for kw in ("flowchart", "sequenceDiagram", "graph TD", "graph LR", "stateDiagram")
        ):
            return _mmd_to_png_data_uri(obj, work_dir)
        return obj

    pre_rendered = _walk(instance)
    instance.clear()
    instance.update(pre_rendered)


def _mmd_to_png_data_uri(mmd: str, work_dir: Path) -> str:
    src = work_dir / f"diag-{abs(hash(mmd))}.mmd"
    out = src.with_suffix(".png")
    src.write_text(mmd, encoding="utf-8")
    try:
        subprocess.run(
            [str(RENDER_MERMAID_SH), str(src), str(out)],
            check=True,
            capture_output=True,
            timeout=60,
        )
    except subprocess.CalledProcessError as exc:
        log.warning("mmdc failed for diagram: %s", exc.stderr.decode("utf-8", "replace")[:500])
        return mmd  # leave original; PDF will show the source code block
    import base64
    data = base64.b64encode(out.read_bytes()).decode("ascii")
    return f'<img alt="diagram" src="data:image/png;base64,{data}" />'


def render_artifact(
    *,
    project_id: str,
    artifact_kind: str,
    agent_output_payload: dict[str, Any],
) -> dict[str, Any]:
    """Invoke the canonical generator for one artifact.

    Returns {"ok": True, ...} or {"ok": False, "failure_reason": ...}.
    Always upserts the project_artifacts row.
    """
    spec = ARTIFACT_REGISTRY.get(artifact_kind)
    if spec is None:
        reason = f"unknown artifact_kind: {artifact_kind}"
        _upsert_artifact_row(
            project_id=project_id,
            artifact_kind=artifact_kind,
            status="failed",
            failure_reason=reason,
        )
        return {"ok": False, "failure_reason": reason}

    generator_path = GENERATORS_DIR / spec["generator"]
    if not generator_path.exists():
        reason = f"generator missing: {generator_path}"
        _upsert_artifact_row(
            project_id=project_id,
            artifact_kind=artifact_kind,
            status="failed",
            failure_reason=reason,
        )
        return {"ok": False, "failure_reason": reason}

    with tempfile.TemporaryDirectory(prefix=f"sidecar-{artifact_kind}-") as tmp:
        work_dir = Path(tmp)
        instance = dict(agent_output_payload)

        if artifact_kind == "recommendation_pdf":
            try:
                _pre_render_mermaid(instance, work_dir)
            except Exception as exc:
                log.warning("mermaid pre-render swallowed: %s", exc)

        gen_input = {
            "schemaRef": spec["schema_ref"],
            "instanceJson": instance,
            "outputDir": str(work_dir),
            "targets": [spec["target"]],
            "options": {"instanceName": f"{artifact_kind}-{project_id}"},
        }
        input_path = work_dir / "input.json"
        input_path.write_text(json.dumps(gen_input), encoding="utf-8")

        t0 = time.monotonic()
        try:
            proc = subprocess.run(
                ["python3", str(generator_path), str(input_path)],
                capture_output=True,
                timeout=int(os.environ.get("GENERATOR_TIMEOUT_S", "240")),
            )
        except subprocess.TimeoutExpired:
            reason = f"generator timeout after {os.environ.get('GENERATOR_TIMEOUT_S', '240')}s"
            log.error("%s: %s", artifact_kind, reason)
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
            return {"ok": False, "failure_reason": reason}

        elapsed_ms = int((time.monotonic() - t0) * 1000)
        if proc.returncode != 0:
            reason = (
                f"generator exit={proc.returncode} stderr={proc.stderr.decode('utf-8', 'replace')[:500]}"
            )
            log.error("%s render failed in %dms: %s", artifact_kind, elapsed_ms, reason)
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
            return {"ok": False, "failure_reason": reason}

        try:
            envelope = json.loads(proc.stdout.decode("utf-8").strip().splitlines()[-1])
        except Exception as exc:
            reason = f"could not parse generator stdout: {exc}"
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
            return {"ok": False, "failure_reason": reason}

        if not envelope.get("ok"):
            reason = f"generator reported error: {envelope.get('error', {}).get('message', 'unknown')}"
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
            return {"ok": False, "failure_reason": reason}

        # Find the produced file matching our target.
        produced = next(
            (g for g in envelope.get("generated", []) if g.get("target") == spec["target"]),
            None,
        )
        if produced is None:
            reason = f"generator did not emit target={spec['target']}"
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
            return {"ok": False, "failure_reason": reason}

        produced_path = Path(produced["path"])
        sha = produced.get("sha256") or _sha256_file(produced_path)
        storage_path = _upload_to_storage(
            project_id=project_id,
            artifact_kind=artifact_kind,
            file_path=produced_path,
            ext=spec["ext"],
        )
        _upsert_artifact_row(
            project_id=project_id,
            artifact_kind=artifact_kind,
            status="ready",
            sha256=sha,
            storage_path=storage_path,
            format=spec["format"],
        )
        log.info("%s ready in %dms (sha=%s)", artifact_kind, elapsed_ms, sha[:12])
        return {
            "ok": True,
            "sha256": sha,
            "storage_path": storage_path,
            "elapsed_ms": elapsed_ms,
        }


# --------------------------------------------------------------- Flask app --

app = Flask(__name__)


@app.get("/healthz")
def healthz():
    return jsonify({"ok": True, "service": "python-sidecar"}), 200


@app.post("/run-render")
def run_render():
    payload = request.get_json(silent=True) or {}
    project_id = payload.get("project_id")
    artifact_kind = payload.get("artifact_kind")
    agent_output_payload = payload.get("agent_output_payload")

    if not project_id or not artifact_kind or agent_output_payload is None:
        return (
            jsonify({"ok": False, "failure_reason": "project_id, artifact_kind, agent_output_payload required"}),
            400,
        )

    try:
        result = render_artifact(
            project_id=project_id,
            artifact_kind=artifact_kind,
            agent_output_payload=agent_output_payload,
        )
    except Exception as exc:  # circuit-breaker: never bubble to Cloud Run
        log.exception("unhandled render error for %s/%s", project_id, artifact_kind)
        reason = f"{type(exc).__name__}: {exc}"
        try:
            _upsert_artifact_row(
                project_id=project_id,
                artifact_kind=artifact_kind,
                status="failed",
                failure_reason=reason,
            )
        except Exception:
            log.error("failed to record failure row: %s", traceback.format_exc())
        return jsonify({"ok": False, "failure_reason": reason}), 200

    return jsonify(result), 200


def main() -> int:
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
