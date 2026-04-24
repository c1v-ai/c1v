#!/usr/bin/env python3
"""Render before/after stoplight charts as PNG heatmaps.

Mirrors M4/M5 render conventions.

Usage: python3 generate_stoplights.py
"""
from __future__ import annotations

import json
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    import numpy as np
except ImportError:
    raise SystemExit("matplotlib + numpy required: pip install matplotlib numpy")

HERE = Path(__file__).parent
STOPLIGHTS = json.loads((HERE / "stoplight_charts.json").read_text())
SCALES = json.loads((HERE / "rating_scales.json").read_text())
OUT_DIR = HERE / "renders"
OUT_DIR.mkdir(exist_ok=True)

CELL_COLOR = {}
for r in SCALES["criticality_ranges"]:
    for rpn in range(r["rpn_min"], r["rpn_max"] + 1):
        color = r["color"]
        CELL_COLOR[rpn] = color if color.startswith("#") else "#" + color

L_AXIS = ["L=5 Frequent", "L=4 Likely", "L=3 Possible", "L=2 Unlikely", "L=1 Remote"]
S_AXIS = ["S=1 Negligible", "S=2 Marginal", "S=3 Critical", "S=4 Catastrophic"]


def render(chart: dict, title: str, filename: str) -> None:
    counts = np.zeros((5, 4), dtype=int)
    for i, L in enumerate(("L5", "L4", "L3", "L2", "L1")):
        for j, S in enumerate(("S1", "S2", "S3", "S4")):
            counts[i, j] = chart["matrix"][L][S]

    fig, ax = plt.subplots(figsize=(8, 6))
    for i, L in enumerate(("L5", "L4", "L3", "L2", "L1")):
        L_val = int(L[1])
        for j, S in enumerate(("S1", "S2", "S3", "S4")):
            S_val = int(S[1])
            rpn = S_val * L_val
            ax.add_patch(plt.Rectangle((j, 4 - i), 1, 1, facecolor=CELL_COLOR[rpn], edgecolor="white", linewidth=2))
            c = counts[i, j]
            if c > 0:
                ax.text(j + 0.5, 4 - i + 0.5, str(c), ha="center", va="center",
                        fontsize=22, fontweight="bold", color="white")
            ax.text(j + 0.5, 4 - i + 0.12, f"RPN {rpn}", ha="center", va="center",
                    fontsize=8, color="white", alpha=0.7)
    ax.set_xlim(0, 4)
    ax.set_ylim(0, 5)
    ax.set_xticks([i + 0.5 for i in range(4)])
    ax.set_xticklabels(S_AXIS, fontsize=9)
    ax.set_yticks([i + 0.5 for i in range(5)])
    ax.set_yticklabels(list(reversed(L_AXIS)), fontsize=9)
    ax.set_aspect("equal")
    ax.set_title(title, fontsize=12, fontweight="bold", pad=14)
    ax.tick_params(length=0)
    for spine in ax.spines.values():
        spine.set_visible(False)
    plt.tight_layout()
    plt.savefig(OUT_DIR / filename, dpi=160, bbox_inches="tight")
    plt.close()
    print(f"Wrote {OUT_DIR / filename}")


def main() -> None:
    render(STOPLIGHTS["before_corrective_actions"],
           "c1v FMEA — Stoplight BEFORE corrective actions (n=42)",
           "stoplight_before.png")
    render(STOPLIGHTS["after_corrective_actions"],
           "c1v FMEA — Stoplight AFTER corrective actions (n=42)",
           "stoplight_after.png")


if __name__ == "__main__":
    main()
