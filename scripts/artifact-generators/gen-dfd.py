#!/usr/bin/env python3
"""gen-dfd.py — Data Flow Diagram generator.

Source (1→1, no dedup):
  apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_dfd_thg_v2.py

Targets: pptx, mmd.
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
    / "6-software-define-interface-LLM-kb/create_dfd_thg_v2.py"
)


def render(instance, output_dir: Path, targets, options, warnings):
    if not LEGACY.exists():
        raise FileNotFoundError(f"legacy script missing: {LEGACY}")

    (output_dir / "_dfd_instance.json").write_text(
        json.dumps(instance, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    warnings.append(
        "gen-dfd: legacy create_dfd_thg_v2.py is hardcoded-THG; "
        "instanceJson validated but not yet parameterised into renderer."
    )

    run_legacy(LEGACY, [], cwd=LEGACY.parent)

    outputs: list[dict] = []
    if "pptx" in targets:
        candidates = sorted(
            LEGACY.parent.glob("*DFD*.pptx"), key=lambda p: p.stat().st_mtime, reverse=True
        )
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("pptxFilename") or produced.name
            )
            outputs.append({"target": "pptx", "path": str(moved)})
        else:
            warnings.append("gen-dfd: pptx target requested but none produced")

    if "mmd" in targets:
        candidates = sorted(
            LEGACY.parent.glob("*DFD*.mmd"), key=lambda p: p.stat().st_mtime, reverse=True
        )
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("mmdFilename") or produced.name
            )
            outputs.append({"target": "mmd", "path": str(moved)})
        else:
            warnings.append("gen-dfd: mmd target requested but none produced")
    return outputs


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-dfd", render_fn=render))
