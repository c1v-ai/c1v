#!/usr/bin/env python3
"""gen-sequence.py — Sequence diagram generator.

Consolidates (2→1):
  - system-design/kb-upgrade-v2/module-7-interfaces/generate_pptx.py (seq chart impl)
  - apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_sequence_thg.py

Targets: pptx, mmd.

Both legacy scripts are hardcoded-THG-data generators. This wrapper preserves
the I/O contract, validates instanceJson, and delegates to the deepened-KB
script which produces richer output (1383 LOC vs 1197). Callers that need
the v2 variant can pass ``options.legacyVariant='v2'``.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common.runner import run_generator  # noqa: E402
from common.legacy_invoke import REPO_ROOT, run_legacy, move_into  # noqa: E402


LEGACY_DEEPENED = (
    REPO_ROOT
    / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened"
    / "6-software-define-interface-LLM-kb/create_sequence_thg.py"
)
LEGACY_V2 = (
    REPO_ROOT / "system-design/kb-upgrade-v2/module-7-interfaces/generate_pptx.py"
)


def render(instance, output_dir: Path, targets, options, warnings):
    variant = options.get("legacyVariant") or "deepened"
    legacy = LEGACY_V2 if variant == "v2" else LEGACY_DEEPENED
    if not legacy.exists():
        raise FileNotFoundError(f"legacy script missing: {legacy}")

    (output_dir / "_sequence_instance.json").write_text(
        json.dumps(instance, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    warnings.append(
        f"gen-sequence: delegating to {legacy.name} (hardcoded-data); "
        "instanceJson validated but not yet parameterised into renderer."
    )

    run_legacy(legacy, [], cwd=legacy.parent)

    outputs: list[dict] = []

    if "pptx" in targets:
        candidates = sorted(
            legacy.parent.glob("*[Ss]eq*.pptx"), key=lambda p: p.stat().st_mtime, reverse=True
        )
        if not candidates:
            candidates = sorted(
                legacy.parent.glob("*.pptx"), key=lambda p: p.stat().st_mtime, reverse=True
            )
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("pptxFilename") or produced.name
            )
            outputs.append({"target": "pptx", "path": str(moved)})
        else:
            warnings.append("gen-sequence: pptx target requested but no .pptx produced")

    if "mmd" in targets:
        candidates = sorted(
            legacy.parent.glob("*[Ss]eq*.mmd"), key=lambda p: p.stat().st_mtime, reverse=True
        )
        if not candidates:
            candidates = sorted(
                legacy.parent.glob("*.mmd"), key=lambda p: p.stat().st_mtime, reverse=True
            )
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("mmdFilename") or produced.name
            )
            outputs.append({"target": "mmd", "path": str(moved)})
        else:
            warnings.append("gen-sequence: mmd target requested but no .mmd produced")

    return outputs


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-sequence", render_fn=render))
