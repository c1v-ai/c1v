#!/usr/bin/env python3
"""gen-cost-curves.py — KB-9 Atlas cost-curve renderer.

Reads a ``decision_network.v1.json`` (winner + infra choices) and renders
log-log cost curves sourced from KB-9 Atlas entries.

Atlas location (post-T9):
  apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas/

Target:
  - svg : one log-log plot per infra choice, x=DAU, y=$/month.

Instance shape (loose — expects winner's infra selection + DAU range):
{
  "winner": "A1",
  "winnerInfra": [
    {"component": "database", "choice": "PostgreSQL", "company": "airbnb"}
  ],
  "dauRange": {"min": 1000, "max": 10000000}
}

Atlas cost-curve entry shape (per apps/product-helper/lib/langchain/schemas/generated/atlas/cost-curve.schema.json):
{
  "component": "database",
  "choice": "PostgreSQL",
  "points": [{"dau": 1000, "monthlyUsd": 50}, ...]
}

Falls back to stub linear curve + WARN if atlas entry not found.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common import extender_init  # noqa: F401,E402
from common.runner import run_generator  # noqa: E402

import matplotlib  # noqa: E402
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


_FONT = {"family": "DejaVu Sans"}
REPO_ROOT = Path(__file__).resolve().parents[2]

_ATLAS_ROOTS = [
    REPO_ROOT / "apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/9-stacks-atlas",
]


def _resolve_atlas_root(warnings: list[str]) -> Path | None:
    for i, root in enumerate(_ATLAS_ROOTS):
        if root.exists():
            if i > 0:
                warnings.append(
                    f"gen-cost-curves: atlas found at unexpected fallback path {root}"
                )
            return root
    warnings.append(
        "gen-cost-curves: atlas root not found at either new or pre-T9 locations; "
        "stub curves will be used"
    )
    return None


def _find_cost_curve(
    atlas_root: Path, component: str, choice: str, company: str | None,
    warnings: list[str],
) -> list[dict[str, float]] | None:
    """Search atlas tree for a cost-curve entry matching component+choice.

    Matching is permissive — atlas structure varies between companies. We walk
    any JSON file whose path contains ``companies/`` (or similar) and look for
    either:
      - a top-level ``costCurves`` array of entries with component+choice
      - a nested entry under ``stack`` with ``.costCurve.points``
    """
    candidates: list[Path] = []
    companies_dir = atlas_root / "companies"
    if companies_dir.exists():
        if company:
            for ext in ("json", "md"):
                cand = companies_dir / f"{company}.{ext}"
                if cand.exists():
                    candidates.append(cand)
        candidates.extend(list(companies_dir.rglob("*.json")))

    for path in candidates:
        try:
            with path.open("r", encoding="utf-8") as fh:
                data = json.load(fh)
        except Exception:
            continue
        points = _match_curve(data, component, choice)
        if points:
            return points

    warnings.append(
        f"gen-cost-curves: no atlas cost-curve for component={component!r} "
        f"choice={choice!r} company={company!r}; using stub"
    )
    return None


def _match_curve(obj: Any, component: str, choice: str) -> list[dict[str, float]] | None:
    if isinstance(obj, dict):
        comp = obj.get("component")
        ch = obj.get("choice")
        points = obj.get("points") or (obj.get("costCurve") or {}).get("points")
        if comp and ch and points and comp.lower() == component.lower() and ch.lower() == choice.lower():
            return points
        for v in obj.values():
            hit = _match_curve(v, component, choice)
            if hit:
                return hit
    elif isinstance(obj, list):
        for v in obj:
            hit = _match_curve(v, component, choice)
            if hit:
                return hit
    return None


def _stub_points(dau_min: float, dau_max: float) -> list[dict[str, float]]:
    # Simple linear $0.05 / DAU / month stub
    return [
        {"dau": dau_min, "monthlyUsd": max(1.0, dau_min * 0.05)},
        {"dau": dau_max, "monthlyUsd": max(1.0, dau_max * 0.05)},
    ]


def _save_svg(fig, path: Path) -> None:
    fig.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)


def _plot_curve(
    points: list[dict[str, float]], component: str, choice: str,
    is_stub: bool, out_path: Path,
) -> None:
    xs = [p["dau"] for p in points if p.get("dau") and p.get("monthlyUsd")]
    ys = [p["monthlyUsd"] for p in points if p.get("dau") and p.get("monthlyUsd")]
    fig, ax = plt.subplots(figsize=(7, 5))
    marker = "o" if not is_stub else "x"
    color = "#F18F01" if not is_stub else "#999"
    ax.plot(xs, ys, marker=marker, color=color, linewidth=2,
            markersize=7, markeredgecolor="#0B2C29")
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("DAU (log)", **_FONT)
    ax.set_ylabel("$ / month (log)", **_FONT)
    title = f"Cost curve: {component} — {choice}"
    if is_stub:
        title += " [STUB — atlas entry missing]"
    ax.set_title(title, **_FONT)
    ax.grid(True, which="both", linestyle="--", alpha=0.4)
    _save_svg(fig, out_path)


def render(instance, output_dir: Path, targets, options, warnings):
    if "svg" not in targets:
        warnings.append("gen-cost-curves: no svg target requested; nothing to do")
        return []

    infras = instance.get("winnerInfra") or []
    if not infras:
        warnings.append("gen-cost-curves: winnerInfra missing — nothing to plot")
        return []

    dau_range = instance.get("dauRange") or {"min": 1_000, "max": 10_000_000}
    atlas_root = _resolve_atlas_root(warnings)

    base = options.get("outputBasename") or "cost_curve"
    generated: list[dict[str, str]] = []

    for idx, infra in enumerate(infras):
        component = infra.get("component", f"component-{idx}")
        choice = infra.get("choice", "unknown")
        company = infra.get("company")
        points = None
        if atlas_root:
            points = _find_cost_curve(atlas_root, component, choice, company, warnings)
        is_stub = points is None
        if points is None:
            points = _stub_points(dau_range.get("min", 1_000), dau_range.get("max", 10_000_000))

        safe = "".join(ch if ch.isalnum() else "_" for ch in f"{component}_{choice}")
        out = output_dir / f"{base}.{safe}.svg"
        try:
            _plot_curve(points, component, choice, is_stub, out)
            generated.append({"target": "svg", "path": str(out)})
        except Exception as exc:
            warnings.append(
                f"gen-cost-curves: plot failed for {component}/{choice}: "
                f"{type(exc).__name__}: {exc}"
            )

    return generated


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-cost-curves", render_fn=render))
