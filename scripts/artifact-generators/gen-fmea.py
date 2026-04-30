#!/usr/bin/env python3
"""gen-fmea.py — FMEA table + stoplight generator.

Consolidates (2→1 merge):
  - system-design/kb-upgrade-v2/module-8-risk/generate_fmea_xlsx.py
  - system-design/kb-upgrade-v2/module-8-risk/generate_stoplights.py

Targets: xlsx (fmea table), svg (stoplight matrix — standalone).

Instance shape (expected):
    {
      "fmea_table":     { ... },    # consumed by generate_fmea_xlsx.py
      "rating_scales":  { ... },
      "stoplight_charts": { ... }    # consumed by generate_stoplights.py
    }

The legacy scripts read these as sibling files. This wrapper materialises
them into a temp directory, runs the legacy scripts, then collects outputs.
Per v2 §15.4 the stoplight output is merged into the FMEA xlsx workbook
(additional sheet "Stoplights") while also being emitted standalone when
``'svg'`` is in ``targets``.
"""
from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common.runner import run_generator  # noqa: E402
from common.legacy_invoke import REPO_ROOT, run_legacy, move_into  # noqa: E402


FMEA_DIR = REPO_ROOT / "system-design/kb-upgrade-v2/module-8-risk"
LEGACY_XLSX = FMEA_DIR / "generate_fmea_xlsx.py"
LEGACY_STOPLIGHTS = FMEA_DIR / "generate_stoplights.py"


RATING_SCALES_FALLBACK = FMEA_DIR / "rating_scales.json"


def _materialise_instance(instance: dict, workdir: Path) -> None:
    required = ("fmea_table", "rating_scales", "stoplight_charts")
    missing = [k for k in required if k not in instance]
    if missing:
        raise ValueError(
            f"gen-fmea: instanceJson missing keys {missing}. Expected: {required}"
        )
    for key in required:
        (workdir / f"{key}.json").write_text(
            json.dumps(instance[key], ensure_ascii=False, indent=2), encoding="utf-8"
        )


# ---- variant='residual' adapter ----------------------------------------
#
# The residual artifact (module-8.fmea-residual.v1) is row-oriented like the
# legacy fmea_table.v1, but carries different fields (recoverability,
# weighted_rpn, predecessor_ref, form_refs, decision_anchor,
# mitigation_status, landed_controls). We map those into the legacy
# columnar shape so the existing xlsx renderer can produce a workbook
# without forking the legacy script. Stoplight matrices are computed from
# residual rows directly (severity/likelihood-pre = post since residual is
# a single re-scored snapshot).

_RESIDUAL_COL_ORDER = [
    "failure_mode_id", "subsystem", "failure_mode", "failure_effects",
    "possible_cause", "mmmme", "interface_ref",
    "severity", "likelihood", "rpn", "risk_criticality",
    "corrective_action",
    "adjusted_severity", "adjusted_likelihood", "adjusted_rpn", "adjusted_criticality",
    "corrective_action_effort",
    "detectability", "troubleshooting",
]


def _criticality_from_rpn(rpn: int) -> str:
    if rpn >= 15:
        return "HIGH"
    if rpn >= 9:
        return "MEDIUM HIGH"
    if rpn >= 5:
        return "MEDIUM"
    if rpn >= 3:
        return "MEDIUM LOW"
    return "LOW"


def _residual_to_table(residual: dict) -> dict:
    rows = []
    for fm in residual["failure_modes"]:
        target = fm["target_ref"]
        form_summary = "; ".join(
            f"{f['form_id']}({f['role']})" for f in fm.get("form_refs", [])
        )
        landed = "; ".join(
            f"[{c['kind']}:{c['ref']}] {c.get('summary','')}" for c in fm.get("landed_controls", [])
        ) or "(none)"
        decision = fm.get("decision_anchor")
        decision_str = (
            f"DN={decision['decision_node_id']}/{decision['alternative_id']}@{decision['architecture_vector_id']}"
            if decision else ""
        )
        subsystem = (
            "NEW (chosen-arch only)" if fm["predecessor_ref"] == "new"
            else f"surviving from {fm['predecessor_ref']}"
        )
        interface_ref = target["ref"] if target["kind"] == "interface" else ""
        # Residual rows are already post-mitigation. We mirror sev/likelihood
        # into adjusted_* so the legacy template renders consistently.
        row = {
            "failure_mode_id": fm["id"],
            "subsystem": f"{subsystem} | forms: {form_summary} | {decision_str}".strip(" |"),
            "failure_mode": fm["failure_mode"],
            "failure_effects": [fm["potential_effect"]],
            "possible_cause": fm["potential_cause"],
            "mmmme": "Method",
            "interface_ref": interface_ref,
            "severity": fm["severity"],
            "likelihood": fm["likelihood"],
            "rpn": fm["rpn"],
            "risk_criticality": fm["criticality_category"],
            "corrective_action": landed,
            "adjusted_severity": fm["severity"],
            "adjusted_likelihood": fm["likelihood"],
            "adjusted_rpn": fm["rpn"],
            "adjusted_criticality": fm["criticality_category"],
            "corrective_action_effort": fm.get("mitigation_status", "n/a"),
            "detectability": fm["detectability"],
            "troubleshooting": fm.get("open_residual_risk") or fm.get("notes", ""),
        }
        rows.append(row)
    return {
        "_schema": "fmea_master_table.v1",
        "_module": "Module 8 — FMEA-residual",
        "_produced_date": residual.get("produced_at", "")[:10],
        "_calibration_reference": "module-8.fmea-residual.v1 → adapted for legacy renderer",
        "_column_order": _RESIDUAL_COL_ORDER,
        "_row_count": len(rows),
        "_failure_mode_count": len(rows),
        "_subsystem_count": len({r["subsystem"] for r in rows}),
        "rows": rows,
    }


def _residual_to_stoplight(residual: dict) -> dict:
    matrix = {f"L{i}": {f"S{j}": 0 for j in range(1, 5)} for i in range(1, 6)}
    crit_buckets: dict[str, list[str]] = {
        "HIGH": [], "MEDIUM HIGH": [], "MEDIUM": [], "MEDIUM LOW": [], "LOW": [],
    }
    for fm in residual["failure_modes"]:
        s, l = fm["severity"], fm["likelihood"]
        matrix[f"L{l}"][f"S{s}"] += 1
        crit_buckets.setdefault(fm["criticality_category"], []).append(fm["id"])
    crit_totals = {
        cat: {
            "rpn_range": rng,
            "count": len(crit_buckets[cat]),
            "rows": crit_buckets[cat],
        }
        for cat, rng in [
            ("HIGH", "15-20"),
            ("MEDIUM HIGH", "9-14"),
            ("MEDIUM", "5-8"),
            ("MEDIUM LOW", "3-4"),
            ("LOW", "1-2"),
        ]
    }
    snapshot = {
        "description": "Residual risk distribution after chosen architecture commits.",
        "matrix": matrix,
        "criticality_totals": crit_totals,
        "sum_check": len(residual["failure_modes"]),
    }
    # Legacy stoplight script expects before/after — feed identical snapshots
    # since residual is a single post-commit view.
    return {
        "_schema": "fmea_stoplight_charts.v1",
        "_module": "Module 8 — FMEA-residual",
        "_produced_date": residual.get("produced_at", "")[:10],
        "_source_table": "fmea_residual.v1.json",
        "_total_cause_rows": len(residual["failure_modes"]),
        "_matrix_convention": "y = Likelihood (1..5, bottom-to-top), x = Severity (1..4)",
        "before_corrective_actions": snapshot,
        "after_corrective_actions": snapshot,
    }


def _residual_to_legacy_bundle(residual: dict, options: dict) -> dict:
    rating_scales = options.get("ratingScales")
    if rating_scales is None:
        if not RATING_SCALES_FALLBACK.exists():
            raise FileNotFoundError(
                f"variant='residual' needs options.ratingScales or {RATING_SCALES_FALLBACK}"
            )
        rating_scales = json.loads(RATING_SCALES_FALLBACK.read_text(encoding="utf-8"))
    return {
        "fmea_table": _residual_to_table(residual),
        "rating_scales": rating_scales,
        "stoplight_charts": _residual_to_stoplight(residual),
    }


def _early_to_table(early: dict) -> dict:
    rows = []
    for fm in early["failure_modes"]:
        mitigations = "; ".join(
            f"[{m.get('id', '?')}] {m.get('summary', '')}"
            for m in fm.get("candidate_mitigation", [])
        )
        target = fm["target_ref"]
        rows.append({
            "failure_mode_id": fm["id"],
            "subsystem": f"{target['kind']}:{target['ref']}",
            "failure_mode": fm["failure_mode"],
            "failure_effects": [fm["potential_effect"]],
            "possible_cause": fm["potential_cause"],
            "mmmme": "Method",
            "interface_ref": target["ref"] if target["kind"] == "interface" else "",
            "severity": fm["severity"],
            "likelihood": fm["likelihood"],
            "rpn": fm["rpn"],
            "risk_criticality": fm["criticality_category"],
            "corrective_action": mitigations,
            "adjusted_severity": fm["severity"],
            "adjusted_likelihood": fm["likelihood"],
            "adjusted_rpn": fm["rpn"],
            "adjusted_criticality": fm["criticality_category"],
            "corrective_action_effort": "option",
            "detectability": fm["detectability"],
            "troubleshooting": fm.get("notes", ""),
        })
    return {
        "_schema": "fmea_master_table.v1",
        "_module": "Module 8 — FMEA-early",
        "_produced_date": early.get("produced_at", "")[:10],
        "_calibration_reference": "module-8.fmea-early.v1 → adapted for legacy renderer",
        "_column_order": _RESIDUAL_COL_ORDER,
        "_row_count": len(rows),
        "_failure_mode_count": len(rows),
        "_subsystem_count": len({r["subsystem"] for r in rows}),
        "rows": rows,
    }


def _early_to_stoplight(early: dict) -> dict:
    matrix = {f"L{i}": {f"S{j}": 0 for j in range(1, 5)} for i in range(1, 6)}
    crit_buckets: dict[str, list[str]] = {
        "HIGH": [], "MEDIUM HIGH": [], "MEDIUM": [], "MEDIUM LOW": [], "LOW": [],
    }
    for fm in early["failure_modes"]:
        s, l = fm["severity"], fm["likelihood"]
        matrix[f"L{l}"][f"S{s}"] += 1
        crit_buckets.setdefault(fm["criticality_category"], []).append(fm["id"])
    crit_totals = {
        cat: {
            "rpn_range": rng,
            "count": len(crit_buckets[cat]),
            "rows": crit_buckets[cat],
        }
        for cat, rng in [
            ("HIGH", "15-20"),
            ("MEDIUM HIGH", "9-14"),
            ("MEDIUM", "5-8"),
            ("MEDIUM LOW", "3-4"),
            ("LOW", "1-2"),
        ]
    }
    snapshot = {
        "description": "Early FMEA risk distribution before committed mitigations.",
        "matrix": matrix,
        "criticality_totals": crit_totals,
        "sum_check": len(early["failure_modes"]),
    }
    return {
        "_schema": "fmea_stoplight_charts.v1",
        "_module": "Module 8 — FMEA-early",
        "_produced_date": early.get("produced_at", "")[:10],
        "_source_table": "fmea_early.v1.json",
        "_total_cause_rows": len(early["failure_modes"]),
        "_matrix_convention": "y = Likelihood (1..5, bottom-to-top), x = Severity (1..4)",
        "before_corrective_actions": snapshot,
        "after_corrective_actions": snapshot,
    }


def _early_to_legacy_bundle(early: dict, options: dict) -> dict:
    rating_scales = options.get("ratingScales")
    if rating_scales is None:
        if not RATING_SCALES_FALLBACK.exists():
            raise FileNotFoundError(
                f"variant='early' needs options.ratingScales or {RATING_SCALES_FALLBACK}"
            )
        rating_scales = json.loads(RATING_SCALES_FALLBACK.read_text(encoding="utf-8"))
    return {
        "fmea_table": _early_to_table(early),
        "rating_scales": rating_scales,
        "stoplight_charts": _early_to_stoplight(early),
    }


def render(instance, output_dir: Path, targets, options, warnings):
    if not LEGACY_XLSX.exists() or not LEGACY_STOPLIGHTS.exists():
        raise FileNotFoundError(
            f"legacy FMEA scripts missing under {FMEA_DIR}"
        )

    outputs: list[dict] = []

    variant = (options or {}).get("variant", "early")
    if variant == "residual":
        if instance.get("_schema") != "module-8.fmea-residual.v1":
            raise ValueError(
                f"gen-fmea variant='residual' expects _schema=module-8.fmea-residual.v1, got {instance.get('_schema')!r}"
            )
        instance = _residual_to_legacy_bundle(instance, options or {})
    elif instance.get("_schema") == "module-8.fmea-early.v1":
        instance = _early_to_legacy_bundle(instance, options or {})

    with tempfile.TemporaryDirectory(prefix="gen-fmea-") as tmp:
        tmp_path = Path(tmp)
        _materialise_instance(instance, tmp_path)

        # The legacy scripts read HERE-relative sibling files. We need to
        # point them at our temp dir. Simplest: copy legacy script content
        # into tmp and exec via our python; but simpler still is to copy
        # legacy scripts beside the materialised JSON and run them there.
        shutil.copy2(LEGACY_XLSX, tmp_path / LEGACY_XLSX.name)
        shutil.copy2(LEGACY_STOPLIGHTS, tmp_path / LEGACY_STOPLIGHTS.name)

        if "xlsx" in targets:
            run_legacy(tmp_path / LEGACY_XLSX.name, [], cwd=tmp_path)
            produced = tmp_path / "fmea_table.xlsx"
            if not produced.exists():
                raise RuntimeError("gen-fmea: expected fmea_table.xlsx not produced")
            moved = move_into(
                produced, output_dir, dest_name=options.get("xlsxFilename") or "fmea_table.xlsx"
            )
            outputs.append({"target": "xlsx", "path": str(moved)})

        if "svg" in targets or "png" in targets:
            run_legacy(tmp_path / LEGACY_STOPLIGHTS.name, [], cwd=tmp_path)
            renders = tmp_path / "renders"
            if not renders.exists():
                warnings.append("gen-fmea: stoplight 'renders' dir not produced")
            else:
                # Legacy emits PNG; svg target acceptable because v2 matrix
                # allows either vector or raster for this artifact.
                for produced in sorted(renders.iterdir()):
                    if produced.suffix.lower() not in {".png", ".svg"}:
                        continue
                    target = produced.suffix.lstrip(".").lower()
                    moved = move_into(produced, output_dir, dest_name=produced.name)
                    outputs.append({"target": target, "path": str(moved)})

    return outputs


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-fmea", render_fn=render))
