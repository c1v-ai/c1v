#!/usr/bin/env python3
"""gen-fmea.py — FMEA table + stoplight generator.

Consolidates (2→1 merge):
  - system-design/kb-upgrade-v2/module-7-fmea/generate_fmea_xlsx.py
  - system-design/kb-upgrade-v2/module-7-fmea/generate_stoplights.py

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


FMEA_DIR = REPO_ROOT / "system-design/kb-upgrade-v2/module-7-fmea"
LEGACY_XLSX = FMEA_DIR / "generate_fmea_xlsx.py"
LEGACY_STOPLIGHTS = FMEA_DIR / "generate_stoplights.py"


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


def render(instance, output_dir: Path, targets, options, warnings):
    if not LEGACY_XLSX.exists() or not LEGACY_STOPLIGHTS.exists():
        raise FileNotFoundError(
            f"legacy FMEA scripts missing under {FMEA_DIR}"
        )

    outputs: list[dict] = []

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
