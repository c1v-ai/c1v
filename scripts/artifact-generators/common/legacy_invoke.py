"""Helper to invoke a legacy generator script as a subprocess.

Used by migrator wrappers to delegate rendering to the original scripts
(living under ``system-design/kb-upgrade-v2/`` or the deepened-KB tree)
without copy-pasting thousands of LOC. The wrapper validates the input,
writes a temp JSON in the shape the legacy script expects, runs it, and
collects the produced files.

This is explicitly a migration-era bridge. Extender and future cleanup
passes can unlift the core rendering into in-tree Python modules.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def repo_path(rel: str) -> Path:
    return (REPO_ROOT / rel).resolve()


def run_legacy(script: Path, args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    """Run a legacy script with the active Python interpreter.

    Raises subprocess.CalledProcessError on non-zero exit.
    """
    cmd = ["python3", str(script), *args]
    return subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        check=True,
        capture_output=True,
        text=True,
    )


def move_into(src: Path, dest_dir: Path, dest_name: str | None = None) -> Path:
    """Move ``src`` into ``dest_dir`` (creating it if needed)."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    target = dest_dir / (dest_name or src.name)
    if target.resolve() == src.resolve():
        return target
    if target.exists():
        target.unlink()
    shutil.move(str(src), str(target))
    return target


def collect_existing(*candidates: Path) -> list[Path]:
    return [p for p in candidates if p.exists()]


def os_path(p: Path) -> str:
    return os.fspath(p)
