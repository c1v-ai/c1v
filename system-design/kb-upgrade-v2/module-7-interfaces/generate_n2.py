#!/usr/bin/env python3
"""
generate_n2.py — Module 6 adapter for the KB n2_from_json.py generator.

Invokes the canonical KB generator against this module's n2_chart.json and
writes n2_chart.xlsx alongside it.

Usage:
    python3 generate_n2.py
"""

from __future__ import annotations

import os
import sys

HERE = os.path.abspath(os.path.dirname(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
KB = os.path.join(
    REPO,
    "apps",
    "product-helper",
    ".planning",
    "phases",
    "14-artifact-publishing-json-excel-ppt-pdf",
    "6-software-define-interface-LLM-kb",
)

# Make the KB importable
sys.path.insert(0, KB)

import n2_from_json  # type: ignore  # noqa: E402


def main() -> int:
    in_path = os.path.join(HERE, "n2_chart.json")
    out_path = os.path.join(HERE, "n2_chart.xlsx")

    spec = n2_from_json.load_spec(in_path)
    errors = n2_from_json.validate(spec)
    if errors:
        print("Validation errors:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    n2_from_json.build(spec, out_path)

    declared, target, drift = n2_from_json.endpoint_reconciliation(spec)
    print(f"Wrote: {out_path}")
    print(f"  Subsystems: {len(spec.subsystems)}")
    print(f"  Interfaces: {len(spec.interfaces)} internal + {len(spec.externals)} external")
    print(f"  Flows: {len(spec.flows)}  Control loops: {len(spec.loops)}")
    if target:
        print(f"  QFD endpoints: {declared} declared vs. {target} target ({drift:+.0f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
