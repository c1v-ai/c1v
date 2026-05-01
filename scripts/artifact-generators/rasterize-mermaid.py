#!/usr/bin/env python3
"""rasterize-mermaid.py — convert .mmd files or Markdown-embedded mermaid
blocks into PNGs via the mmdc CLI.

Used by the self-application deck assembler. Output theme is neutral
(white background, black/grey palette) — exports carry no brand styling
per project convention.

Prereq: `mmdc` (Mermaid CLI) on PATH. Install globally:
  npm install -g @mermaid-js/mermaid-cli

Contract:
  python3 scripts/artifact-generators/rasterize-mermaid.py \\
    --input <path-to-mmd-or-md> \\
    --output-dir <dir> \\
    --prefix <basename> \\
    [--theme neutral|default|dark|forest] \\
    [--background white|transparent] \\
    [--width 1600] [--height 1200]

Single .mmd file: writes <output-dir>/<prefix>.png
Markdown file:    writes <output-dir>/<prefix>-NN.png (1-indexed per block)

Stdout protocol: prints a JSON manifest line per rendered PNG.

All subprocess invocations use argv-array form (no shell=True), which
makes shell injection structurally impossible.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import List

MERMAID_BLOCK_RE = re.compile(r"^```mermaid\s*\n(.*?)\n```", re.MULTILINE | re.DOTALL)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Rasterize Mermaid sources to PNG")
    p.add_argument("--input", required=True, help="path to .mmd or .md")
    p.add_argument("--output-dir", required=True, help="directory to write PNGs")
    p.add_argument("--prefix", required=True, help="basename prefix for emitted PNGs")
    p.add_argument("--theme", default="neutral",
                   choices=["neutral", "default", "dark", "forest"])
    p.add_argument("--background", default="white")
    p.add_argument("--width", type=int, default=1600)
    p.add_argument("--height", type=int, default=1200)
    return p.parse_args()


def extract_mermaid_blocks(md: str) -> List[str]:
    return [m.group(1) for m in MERMAID_BLOCK_RE.finditer(md)]


def run_mmdc(src: Path, dst: Path, args: argparse.Namespace) -> None:
    cmd = [
        "mmdc",
        "--input", str(src),
        "--output", str(dst),
        "--theme", args.theme,
        "--backgroundColor", args.background,
        "--width", str(args.width),
        "--height", str(args.height),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        sys.stderr.write(f"mmdc failed for {src}\n")
        if result.stdout:
            sys.stderr.write(result.stdout)
        if result.stderr:
            sys.stderr.write(result.stderr)
        sys.exit(result.returncode or 1)


def emit(record: dict) -> None:
    print(json.dumps(record), flush=True)


def main() -> None:
    args = parse_args()
    src_path = Path(args.input).resolve()
    out_dir = Path(args.output_dir).resolve()

    if not src_path.exists():
        sys.stderr.write(f"input not found: {src_path}\n")
        sys.exit(3)

    out_dir.mkdir(parents=True, exist_ok=True)
    ext = src_path.suffix.lower()

    if ext == ".mmd":
        dst = out_dir / f"{args.prefix}.png"
        run_mmdc(src_path, dst, args)
        emit({"source": str(src_path), "output": str(dst), "blocks_rendered": 1})
        return

    if ext in (".md", ".markdown"):
        md = src_path.read_text(encoding="utf-8")
        blocks = extract_mermaid_blocks(md)
        if not blocks:
            sys.stderr.write(f"no ```mermaid blocks found in {src_path}\n")
            sys.exit(4)
        with tempfile.TemporaryDirectory(prefix="rasterize-mermaid-") as tmp:
            tmp_dir = Path(tmp)
            for i, block in enumerate(blocks, start=1):
                idx = f"{i:02d}"
                src_tmp = tmp_dir / f"block-{idx}.mmd"
                dst = out_dir / f"{args.prefix}-{idx}.png"
                src_tmp.write_text(block, encoding="utf-8")
                run_mmdc(src_tmp, dst, args)
                emit({"source": str(src_path), "block_index": i, "output": str(dst)})
        return

    sys.stderr.write(f"unsupported input extension: {ext} (expected .mmd or .md)\n")
    sys.exit(5)


if __name__ == "__main__":
    main()
