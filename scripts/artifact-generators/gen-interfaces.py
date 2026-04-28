#!/usr/bin/env python3
"""gen-interfaces.py — Interface matrix (formal specs) generator.

Consolidates (2→1):
  - system-design/kb-upgrade-v2/module-7-interfaces/generate_interface_matrix.py (adapter)
  - apps/product-helper/.planning/.../6-software-define-interface-LLM-kb/interface_matrix_from_json.py (core)

Target: xlsx.

Variants (options.variant):
  - 'formal-specs'  (DEFAULT) — owner-tab layout with Value/Units/Estimate?/Dates/etc.
                     Uses interface_matrix_from_json.py.
  - 'informal-n2'   — routes to gen-n2.py instead (informal N2 matrix).
                     Callers should prefer invoking gen-n2.py directly.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common.runner import run_generator  # noqa: E402
from common.legacy_invoke import REPO_ROOT, run_legacy  # noqa: E402


KB_DIR = (
    REPO_ROOT
    / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened"
    / "6-software-define-interface-LLM-kb"
)
LEGACY_FORMAL = KB_DIR / "interface_matrix_from_json.py"


def render(instance, output_dir: Path, targets, options, warnings):
    variant = options.get("variant") or "formal-specs"

    if variant == "informal-n2":
        warnings.append(
            "gen-interfaces: variant=informal-n2 — delegate to gen-n2.py for N2 matrix output"
        )
        return []

    if variant != "formal-specs":
        raise ValueError(
            f"gen-interfaces: unsupported options.variant={variant!r}. "
            "Expected 'formal-specs' or 'informal-n2'."
        )

    if "xlsx" not in targets:
        warnings.append("gen-interfaces: no xlsx target requested; nothing to do")
        return []

    if not LEGACY_FORMAL.exists():
        raise FileNotFoundError(f"legacy script missing: {LEGACY_FORMAL}")

    scratch = output_dir / "_interfaces_input.json"
    with scratch.open("w", encoding="utf-8") as fh:
        json.dump(instance, fh, ensure_ascii=False)

    out_name = options.get("outputFilename") or "interface_matrix.xlsx"
    out_path = output_dir / out_name

    args = [str(scratch), str(out_path)]
    only = options.get("onlySubsystem")
    if only:
        args += ["--only", str(only)]
    run_legacy(LEGACY_FORMAL, args)

    scratch.unlink(missing_ok=True)
    return [{"target": "xlsx", "path": str(out_path)}]


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-interfaces", render_fn=render))
