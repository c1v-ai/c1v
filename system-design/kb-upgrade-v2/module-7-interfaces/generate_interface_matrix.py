#!/usr/bin/env python3
"""
generate_interface_matrix.py — Module 6 adapter for KB interface_matrix_from_json.py.

Reads interface_matrix.json and writes interface_matrix.xlsx alongside it via
the canonical KB generator.

Usage:
    python3 generate_interface_matrix.py
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

sys.path.insert(0, KB)

import interface_matrix_from_json as imfj  # type: ignore  # noqa: E402


def main() -> int:
    in_path = os.path.join(HERE, "interface_matrix.json")
    out_path = os.path.join(HERE, "interface_matrix.xlsx")

    spec = imfj.load_spec(in_path)
    errors = imfj.validate(spec)
    if errors:
        print("Validation errors:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    wb = imfj.build(spec, only=None)
    wb.save(out_path)

    n_tabs = len(wb.sheetnames) - 1  # minus Instructions
    print(f"Wrote: {out_path}")
    print(f"  Subsystems in spec: {len(spec.get('subsystems', []))}")
    print(f"  Tabs written: {n_tabs}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
