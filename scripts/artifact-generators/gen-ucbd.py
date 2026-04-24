#!/usr/bin/env python3
"""gen-ucbd.py — Use-Case Block Diagram pptx generator.

Source (1 → 1, no dedup):
  apps/product-helper/.planning/.../2-dev-sys-reqs-for-kb-llm-software/generate_ucbd_pptx.py

Target: pptx.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common.runner import run_generator  # noqa: E402
from common.legacy_invoke import REPO_ROOT, run_legacy, move_into  # noqa: E402


LEGACY = (
    REPO_ROOT
    / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened"
    / "2-dev-sys-reqs-for-kb-llm-software/generate_ucbd_pptx.py"
)


def render(instance, output_dir: Path, targets, options, warnings):
    if "pptx" not in targets:
        warnings.append("gen-ucbd: no pptx target requested; nothing to do")
        return []

    if not LEGACY.exists():
        raise FileNotFoundError(f"legacy script missing: {LEGACY}")

    # Preserve the instance for traceability; legacy is hardcoded.
    (output_dir / "_ucbd_instance.json").write_text(
        json.dumps(instance, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    warnings.append(
        "gen-ucbd: legacy generate_ucbd_pptx.py reads internal constants; "
        "instanceJson validated but not yet parameterised into renderer."
    )

    run_legacy(LEGACY, [], cwd=LEGACY.parent)

    candidates = sorted(
        LEGACY.parent.glob("*UCBD*.pptx"), key=lambda p: p.stat().st_mtime, reverse=True
    )
    if not candidates:
        candidates = sorted(
            LEGACY.parent.glob("*.pptx"), key=lambda p: p.stat().st_mtime, reverse=True
        )
    if not candidates:
        raise RuntimeError("gen-ucbd: legacy script produced no .pptx")

    produced = candidates[0]
    moved = move_into(produced, output_dir, dest_name=options.get("outputFilename") or produced.name)
    return [{"target": "pptx", "path": str(moved)}]


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-ucbd", render_fn=render))
