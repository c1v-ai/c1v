#!/usr/bin/env python3
"""gen-n2.py — N-Squared (N2) interface chart generator.

Consolidates (3→1):
  - system-design/kb-upgrade-v2/module-7-interfaces/generate_n2.py (adapter)
  - apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/n2_from_json.py (core)
  - apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/create_n2_chart.py (hardcoded THG)

Data-driven path delegates to ``n2_from_json.py`` (the canonical KB impl).
Legacy-hardcoded path is accessible via ``options.legacyMode='thg'`` which
runs ``create_n2_chart.py`` as-is — provided for round-trip verification only
and will be removed once all callers migrate to JSON-driven input.

Targets: xlsx (always), pptx (optional via future extension).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common.runner import run_generator  # noqa: E402
from common.legacy_invoke import REPO_ROOT, run_legacy, move_into  # noqa: E402


KB_DIR = (
    REPO_ROOT
    / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened"
    / "6-software-define-interface-LLM-kb"
)
LEGACY_N2_FROM_JSON = KB_DIR / "n2_from_json.py"
LEGACY_CREATE_N2 = KB_DIR / "create_n2_chart.py"


def render(instance, output_dir: Path, targets, options, warnings):
    outputs: list[dict] = []
    legacy_mode = options.get("legacyMode")

    # Write instance to a temp JSON the legacy script can consume.
    scratch = output_dir / "_n2_input.json"
    with scratch.open("w", encoding="utf-8") as fh:
        json.dump(instance, fh, ensure_ascii=False)

    out_xlsx_name = options.get("outputFilename") or "n2_chart.xlsx"
    out_xlsx = output_dir / out_xlsx_name

    if "xlsx" in targets:
        if legacy_mode == "thg":
            # hardcoded-data variant — kept for round-trip only
            if not LEGACY_CREATE_N2.exists():
                raise FileNotFoundError(f"legacy script missing: {LEGACY_CREATE_N2}")
            run_legacy(LEGACY_CREATE_N2, [], cwd=output_dir)
            produced = output_dir / "THG_N2_Chart_v2.xlsx"
            if not produced.exists():
                raise RuntimeError(
                    f"legacyMode=thg: expected {produced} after running {LEGACY_CREATE_N2.name}"
                )
            move_into(produced, output_dir, dest_name=out_xlsx_name)
        else:
            if not LEGACY_N2_FROM_JSON.exists():
                raise FileNotFoundError(f"legacy script missing: {LEGACY_N2_FROM_JSON}")
            run_legacy(LEGACY_N2_FROM_JSON, [str(scratch), str(out_xlsx)])
        outputs.append({"target": "xlsx", "path": str(out_xlsx)})

    if "pptx" in targets:
        warnings.append(
            "gen-n2: pptx target not yet implemented in migrator; tracked as extender scope"
        )

    if scratch.exists():
        scratch.unlink()
    return outputs


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-n2", render_fn=render))
