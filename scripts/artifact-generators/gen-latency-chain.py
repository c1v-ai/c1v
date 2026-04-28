#!/usr/bin/env python3
"""gen-latency-chain.py — M7.b interface latency-budget renderer.

Reads ``interface_specs.v1.json`` (M7.b) and emits a stacked bar chart showing
p50 / p95 / p99 / p99.99 budget allocation per interface.

Schema: ``interfaces.schema.json`` (existing). Missing latency fields per
interface are treated as zero with a WARN.

Instance shape (relevant fields):
{
  "interfaces": [
    {
      "id": "I1", "name": "auth -> db",
      "latencyBudget": {
        "p50Ms": 5, "p95Ms": 20, "p99Ms": 80, "p9999Ms": 400
      }
    }
  ]
}
"""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common import extender_init  # noqa: F401,E402
from common.runner import run_generator  # noqa: E402

import matplotlib  # noqa: E402
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402  (ships with matplotlib)


_FONT = {"family": "DejaVu Sans"}

_TIERS = [
    ("p50Ms", "p50", "#5998C5"),
    ("p95Ms", "p95", "#F18F01"),
    ("p99Ms", "p99", "#C74E4E"),
    ("p9999Ms", "p99.99", "#0B2C29"),
]


def _save_svg(fig, path: Path) -> None:
    fig.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)


def _render_stacked_bar(instance: dict, out_path: Path, warnings: list[str]) -> bool:
    interfaces = instance.get("interfaces") or []
    if not interfaces:
        warnings.append("gen-latency-chain: no interfaces present; nothing to plot")
        return False

    labels = [iface.get("name", iface.get("id", f"I{i}"))
              for i, iface in enumerate(interfaces)]

    # Build per-tier DELTAS for stacking (tiers are cumulative budgets).
    previous = np.zeros(len(interfaces))
    tier_values: list[tuple[str, str, np.ndarray, np.ndarray]] = []
    for field, tier_label, color in _TIERS:
        raw = np.array(
            [
                float((iface.get("latencyBudget") or {}).get(field) or 0.0)
                for iface in interfaces
            ]
        )
        delta = np.maximum(raw - previous, 0.0)
        missing = [
            labels[i] for i, iface in enumerate(interfaces)
            if not (iface.get("latencyBudget") or {}).get(field)
        ]
        if missing:
            warnings.append(
                f"gen-latency-chain: {tier_label} missing for "
                f"{', '.join(missing[:5])}{'...' if len(missing) > 5 else ''}"
            )
        tier_values.append((tier_label, color, raw, delta))
        previous = np.maximum(previous, raw)

    fig, ax = plt.subplots(figsize=(max(7, 0.7 * len(interfaces)), 5.5))
    bottoms = np.zeros(len(interfaces))
    for tier_label, color, _raw, delta in tier_values:
        ax.bar(labels, delta, bottom=bottoms, color=color,
               edgecolor="#0B2C29", linewidth=0.4, label=tier_label)
        bottoms = bottoms + delta

    ax.set_ylabel("Latency budget (ms)", **_FONT)
    ax.set_title("Per-Interface Latency Budget (p50 → p99.99)", **_FONT)
    ax.legend(loc="upper right", frameon=True)
    ax.grid(True, axis="y", linestyle="--", alpha=0.4)
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right", **_FONT)
    _save_svg(fig, out_path)
    return True


def render(instance, output_dir: Path, targets, options, warnings):
    if "svg" not in targets:
        warnings.append("gen-latency-chain: no svg target requested; nothing to do")
        return []
    base = options.get("outputBasename") or "latency_chain"
    out = output_dir / f"{base}.stacked.svg"
    if _render_stacked_bar(instance, out, warnings):
        return [{"target": "svg", "path": str(out)}]
    return []


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-latency-chain", render_fn=render))
