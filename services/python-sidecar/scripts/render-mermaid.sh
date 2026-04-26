#!/usr/bin/env bash
# render-mermaid.sh — pre-render a Mermaid source file to PNG via mmdc.
#
# Called by orchestrator.py before weasyprint to mitigate R-V21.02
# (raw <div class='mermaid'> reaching weasyprint silently drops the diagram).
#
# Usage:
#   render-mermaid.sh <input.mmd> <output.png>
#
# Notes:
#   - Uses Puppeteer-flagged sandbox-off because Cloud Run runs unprivileged.
#   - Background is the Porcelain brand color (#FBFCFC) per CLAUDE.md.
#   - If mmdc is missing, exits non-zero so the caller can fall back to
#     leaving the source intact (degraded but not silent).

set -euo pipefail

if [ "$#" -ne 2 ]; then
    echo "usage: $0 <input.mmd> <output.png>" >&2
    exit 64
fi

src="$1"
out="$2"

if ! command -v mmdc >/dev/null 2>&1; then
    echo "mmdc not on PATH; install @mermaid-js/mermaid-cli in Dockerfile" >&2
    exit 127
fi

# Puppeteer config: disable sandbox (Cloud Run lacks user-namespace privs).
puppeteer_cfg="$(mktemp -t puppeteer-cfg-XXXXXX.json)"
cat > "$puppeteer_cfg" <<'JSON'
{ "args": ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] }
JSON
trap 'rm -f "$puppeteer_cfg"' EXIT

mmdc \
    -i "$src" \
    -o "$out" \
    -b "#FBFCFC" \
    -p "$puppeteer_cfg" \
    --quiet >/dev/null
