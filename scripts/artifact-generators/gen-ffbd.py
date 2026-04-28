#!/usr/bin/env python3
"""gen-ffbd.py — Functional Flow Block Diagram generator.

Sources:
  - apps/product-helper/.planning/.../3-ffbd-llm-kb/create_ffbd_thg_v3.py
    (deepened KB; hardcoded THG data)

Note: The v2 migration matrix in plans/c1v-MIT-Crawley-Cornell.v2.md §15.4
lists ``create_ffbd_thg_v3.py`` in BOTH the v2 and deepened trees (×2 dedup),
but audit on 2026-04-24 shows the v2 copy at
``system-design/kb-upgrade-v2/module-3-ffbd/create_ffbd_thg_v3.py`` does NOT
exist — only the deepened-KB copy is present. This generator wraps the
extant copy. Dedup count: 1→1 (no duplication found). Reported in
``plans/t10-outputs/migration-report.md``.

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
    / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/3-ffbd-llm-kb"
    / "create_ffbd_thg_v3.py"
)


def render(instance, output_dir: Path, targets, options, warnings):
    if not LEGACY.exists():
        raise FileNotFoundError(f"legacy script missing: {LEGACY}")

    # The legacy script is hardcoded-THG; it reads no input file. Until a
    # follow-up refactor parameterises it, this wrapper preserves the I/O
    # contract and records that ``instance`` was ignored.
    warnings.append(
        "gen-ffbd: legacy create_ffbd_thg_v3.py is hardcoded-THG; "
        "instanceJson payload was validated but not yet parameterised into renderer."
    )

    # Persist the instance alongside outputs for traceability.
    instance_dump = output_dir / "_ffbd_instance.json"
    instance_dump.write_text(json.dumps(instance, ensure_ascii=False, indent=2), encoding="utf-8")

    # Run legacy script in its home directory; then sweep produced artifacts
    # into our output_dir.
    run_legacy(LEGACY, [], cwd=LEGACY.parent)

    outputs: list[dict] = []

    if "pptx" in targets:
        # Scan for the most recent *.pptx in legacy dir matching THG FFBD pattern.
        candidates = sorted(
            LEGACY.parent.glob("THG*FFBD*.pptx"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("pptxFilename") or produced.name
            )
            outputs.append({"target": "pptx", "path": str(moved)})
        else:
            warnings.append("gen-ffbd: pptx target requested but no THG*FFBD*.pptx produced")

    if "mmd" in targets:
        candidates = sorted(LEGACY.parent.glob("*.mmd"), key=lambda p: p.stat().st_mtime, reverse=True)
        if candidates:
            produced = candidates[0]
            moved = move_into(
                produced, output_dir, dest_name=options.get("mmdFilename") or produced.name
            )
            outputs.append({"target": "mmd", "path": str(moved)})
        else:
            warnings.append("gen-ffbd: mmd target requested but no *.mmd produced")

    return outputs


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-ffbd", render_fn=render))
