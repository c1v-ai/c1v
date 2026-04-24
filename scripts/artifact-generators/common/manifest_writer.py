"""Atomic JSONL appender for artifacts.manifest.jsonl.

Strategy: POSIX O_APPEND is atomic for writes up to PIPE_BUF (≥512 bytes on
every POSIX system, 4096 on Linux). We (a) keep each manifest line compact
(<4 KiB in practice — the outputs array rarely exceeds a handful of small
entries) and (b) wrap the append with ``fcntl.flock`` as a belt-and-braces
guard against pathological oversize lines or non-POSIX filesystems (e.g. SMB).

Reference: https://man7.org/linux/man-pages/man7/pipe.7.html (PIPE_BUF)
"""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import fcntl  # POSIX-only; acceptable — generators run on Linux/macOS dev + CI
    HAS_FCNTL = True
except ImportError:  # pragma: no cover - Windows fallback
    HAS_FCNTL = False


MANIFEST_FILENAME = "artifacts.manifest.jsonl"


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def append_manifest_entry(output_dir: str | Path, entry: dict[str, Any]) -> Path:
    """Append ``entry`` to ``<output_dir>/artifacts.manifest.jsonl`` atomically.

    Creates the file (and parent dirs) if missing.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = out / MANIFEST_FILENAME

    line = json.dumps(entry, separators=(",", ":"), ensure_ascii=False) + "\n"
    data = line.encode("utf-8")

    # O_APPEND gives atomic per-write on POSIX for <PIPE_BUF; flock guards rest.
    flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND
    fd = os.open(manifest_path, flags, 0o644)
    try:
        if HAS_FCNTL:
            fcntl.flock(fd, fcntl.LOCK_EX)
        try:
            os.write(fd, data)
        finally:
            if HAS_FCNTL:
                fcntl.flock(fd, fcntl.LOCK_UN)
    finally:
        os.close(fd)

    return manifest_path


def build_entry(
    *,
    generator: str,
    instance_name: str,
    outputs: list[dict[str, Any]],
    ok: bool,
    elapsed_ms: int,
    error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    entry: dict[str, Any] = {
        "timestamp": iso_now(),
        "generator": generator,
        "instance": instance_name,
        "outputs": outputs,
        "ok": ok,
        "elapsedMs": elapsed_ms,
    }
    if error:
        entry["error"] = error
    return entry
