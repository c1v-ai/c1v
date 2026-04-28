"""Shared harness: load input, validate, invoke render callable, emit output.

Each generator script is a thin wrapper:

    from common.runner import run_generator

    def render(instance, output_dir, targets, options, warnings) -> list[GeneratedArtifact]:
        ...

    if __name__ == '__main__':
        run_generator(generator_name='gen-ffbd', render_fn=render)

The render callable receives already-validated ``instance`` data and must
return a list of ``{'target': str, 'path': str}`` dicts. The runner
computes sha256 + bytes, appends the manifest line, and writes the
ArtifactGeneratorOutput JSON to stdout (per v2 §15.3).
"""
from __future__ import annotations

import json
import os
import sys
import time
import traceback
from pathlib import Path
from typing import Any, Callable

# Allow generator scripts to ``from common.runner import ...`` when invoked as
# ``python3 scripts/artifact-generators/gen-foo.py <input.json>`` from any cwd.
_HERE = Path(__file__).resolve().parent
_ROOT = _HERE.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from common.manifest_writer import append_manifest_entry, build_entry, sha256_file  # noqa: E402
from common.schema_loader import SchemaValidationError, validate_instance  # noqa: E402


RenderFn = Callable[
    [Any, Path, list[str], dict[str, Any], list[str]],
    list[dict[str, Any]],
]


def _emit(output: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(output, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def run_generator(*, generator_name: str, render_fn: RenderFn) -> int:
    """Entry point for every generator script.

    Returns a process exit code (0 on success, 1 on failure).
    """
    t0 = time.monotonic()
    partial: list[dict[str, str]] = []

    if len(sys.argv) < 2:
        _emit({
            "ok": False,
            "error": {
                "code": "USAGE",
                "message": f"Usage: {generator_name}.py <input.json>",
                "phase": "validate",
            },
            "partial": [],
        })
        return 1

    input_path = Path(sys.argv[1])
    instance_name_default = input_path.name
    output_dir_for_manifest = input_path.parent  # best-effort pre-parse

    try:
        with input_path.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
    except Exception as exc:
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        err = {
            "code": "INPUT_READ_ERROR",
            "message": f"Could not read input file {input_path}: {exc}",
            "phase": "validate",
        }
        try:
            append_manifest_entry(
                output_dir_for_manifest,
                build_entry(
                    generator=generator_name,
                    instance_name=instance_name_default,
                    outputs=[],
                    ok=False,
                    elapsed_ms=elapsed_ms,
                    error=err,
                ),
            )
        except Exception:
            pass
        _emit({"ok": False, "error": err, "partial": []})
        return 1

    schema_ref = payload.get("schemaRef")
    instance = payload.get("instanceJson")
    output_dir = Path(payload.get("outputDir") or input_path.parent).resolve()
    targets = payload.get("targets") or []
    options = payload.get("options") or {}
    instance_name = options.get("instanceName") or instance_name_default

    # ---- validate phase --------------------------------------------------
    try:
        if not schema_ref:
            raise SchemaValidationError(
                "schemaRef is required on ArtifactGeneratorInput",
                schema_ref="",
            )
        if instance is None:
            raise SchemaValidationError(
                "instanceJson is required on ArtifactGeneratorInput",
                schema_ref=schema_ref,
            )
        validate_instance(instance, schema_ref)
    except SchemaValidationError as exc:
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        err = {
            "code": "SCHEMA_VALIDATION_FAILED",
            "message": str(exc),
            "phase": "validate",
        }
        append_manifest_entry(
            output_dir,
            build_entry(
                generator=generator_name,
                instance_name=instance_name,
                outputs=[],
                ok=False,
                elapsed_ms=elapsed_ms,
                error=err,
            ),
        )
        _emit({"ok": False, "error": err, "partial": []})
        return 1

    # ---- render phase ----------------------------------------------------
    output_dir.mkdir(parents=True, exist_ok=True)
    warnings: list[str] = []
    try:
        rendered = render_fn(instance, output_dir, targets, options, warnings)
    except Exception as exc:
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        err = {
            "code": "RENDER_FAILED",
            "message": f"{type(exc).__name__}: {exc}",
            "phase": "render",
            "stack": traceback.format_exc(),
        }
        append_manifest_entry(
            output_dir,
            build_entry(
                generator=generator_name,
                instance_name=instance_name,
                outputs=[{"target": p["target"], "path": p["path"]} for p in partial],
                ok=False,
                elapsed_ms=elapsed_ms,
                error={"code": err["code"], "message": err["message"], "phase": "render"},
            ),
        )
        _emit({"ok": False, "error": err, "partial": partial})
        return 1

    # ---- write/hash phase ------------------------------------------------
    try:
        generated: list[dict[str, Any]] = []
        for item in rendered:
            target = item["target"]
            path = str(item["path"])
            size = os.path.getsize(path)
            digest = sha256_file(path)
            generated.append({
                "target": target,
                "path": path,
                "bytes": size,
                "sha256": digest,
            })
    except Exception as exc:
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        err = {
            "code": "WRITE_OR_HASH_FAILED",
            "message": f"{type(exc).__name__}: {exc}",
            "phase": "write",
            "stack": traceback.format_exc(),
        }
        append_manifest_entry(
            output_dir,
            build_entry(
                generator=generator_name,
                instance_name=instance_name,
                outputs=[{"target": p["target"], "path": p["path"]} for p in partial],
                ok=False,
                elapsed_ms=elapsed_ms,
                error={"code": err["code"], "message": err["message"], "phase": "write"},
            ),
        )
        _emit({"ok": False, "error": err, "partial": partial})
        return 1

    elapsed_ms = int((time.monotonic() - t0) * 1000)
    append_manifest_entry(
        output_dir,
        build_entry(
            generator=generator_name,
            instance_name=instance_name,
            outputs=[
                {
                    "target": g["target"],
                    "path": g["path"],
                    "sha256": g["sha256"],
                    "bytes": g["bytes"],
                }
                for g in generated
            ],
            ok=True,
            elapsed_ms=elapsed_ms,
        ),
    )
    _emit({
        "ok": True,
        "generated": generated,
        "warnings": warnings,
        "elapsedMs": elapsed_ms,
    })
    return 0
