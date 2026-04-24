#!/usr/bin/env python3
"""gen-arch-recommendation.py — final architecture recommendation bundle.

Reads ``architecture_recommendation.v1.json`` plus sibling module outputs in
``outputDir`` and renders a self-contained deliverable.

Targets:
  - html           : single-file viewer. All CSS inline, SVGs/MMDs inlined via
                     base64 data-uris. Opens correctly via file://. NO CDN deps.
  - pdf            : via weasyprint (pinned v62.x) from the same HTML.
  - json-enriched  : denormalized bundle (recommendation + inlined module
                     outputs + manifest digests) for downstream CLI tools.

Schema: existing ``architecture-recommendation.schema.json`` under
``generated/synthesis/``.

Instance shape (truncated):
{
  "projectName": "c1v",
  "summary": "...",
  "winningAlternative": "A1",
  "rationale": "...",
  "moduleReferences": [
    {"module": "M2", "artifact": "requirements-table.xlsx"},
    {"module": "M7.b", "artifact": "interface_specs.v1.json"}
  ],
  "risks": [{"id": "R1", "description": "..."}],
  "tradeoffs": [{"dimension": "cost", "accepted": "higher $/DAU for p99 < 40ms"}]
}
"""
from __future__ import annotations

import base64
import json
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common import extender_init  # noqa: F401,E402
from common.runner import run_generator  # noqa: E402


# -------------------------------------------------------------------- HTML --

_INLINE_CSS = """
  html, body { margin: 0; padding: 0; background: #FBFCFC; color: #0B2C29;
               font-family: Consolas, 'Courier New', monospace; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  h1, h2, h3 { font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
               color: #0B2C29; letter-spacing: -0.01em; }
  h1 { font-size: 2rem; border-bottom: 2px solid #F18F01; padding-bottom: .5rem; }
  h2 { font-size: 1.35rem; margin-top: 2rem; }
  h3 { font-size: 1.05rem; margin-top: 1.25rem; color: #5998C5; }
  .meta { color: #5998C5; font-size: .85rem; margin-top: -.25rem; }
  .callout { background: #0B2C29; color: #FBFCFC; padding: 1rem 1.25rem;
             border-left: 4px solid #F18F01; margin: 1rem 0; border-radius: 2px; }
  table { border-collapse: collapse; width: 100%; margin: .75rem 0; font-size: .9rem; }
  th, td { border: 1px solid #dcdcdc; padding: .45rem .6rem; text-align: left; vertical-align: top; }
  th { background: #F0F4F7; }
  .fig { margin: 1rem 0; padding: .5rem; background: #ffffff; border: 1px solid #e3e3e3; }
  .fig figcaption { font-size: .8rem; color: #5998C5; margin-top: .35rem; }
  code, pre { background: #F0F4F7; padding: .15rem .35rem; border-radius: 2px; }
  pre { padding: .75rem; overflow: auto; }
  ul { padding-left: 1.25rem; }
  .tag { display: inline-block; background: #F18F01; color: #0B2C29;
         padding: .1rem .45rem; border-radius: 2px; font-size: .75rem; font-weight: 700; }
"""


def _b64_data_uri(path: Path, mime: str) -> str:
    data = path.read_bytes()
    return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"


def _inline_svg(path: Path) -> str:
    # Embed raw SVG inline so it renders without extra HTTP fetch.
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return f"<!-- failed to inline {path} -->"


def _render_html(
    instance: dict, output_dir: Path, warnings: list[str],
) -> str:
    project = instance.get("projectName") or "Architecture Recommendation"
    summary = instance.get("summary") or ""
    winner = instance.get("winningAlternative") or "(not specified)"
    rationale = instance.get("rationale") or ""
    modules = instance.get("moduleReferences") or []
    risks = instance.get("risks") or []
    tradeoffs = instance.get("tradeoffs") or []

    # Collect sibling artifacts in outputDir for inline embedding
    artifact_sections: list[str] = []
    for svg_path in sorted(output_dir.glob("*.svg")):
        name = svg_path.stem
        artifact_sections.append(
            f'<figure class="fig">{_inline_svg(svg_path)}'
            f'<figcaption>{name}.svg</figcaption></figure>'
        )
    for mmd_path in sorted(output_dir.glob("*.mmd")):
        try:
            src = mmd_path.read_text(encoding="utf-8")
        except Exception:
            continue
        artifact_sections.append(
            f'<figure class="fig"><pre><code>{_escape(src)}</code></pre>'
            f'<figcaption>{mmd_path.name} (Mermaid source — render externally)</figcaption></figure>'
        )

    if not artifact_sections:
        warnings.append(
            "gen-arch-recommendation: no sibling svg/mmd artifacts found in outputDir; "
            "html will lack embedded figures"
        )

    module_rows = "\n".join(
        f"<tr><td>{_escape(m.get('module', ''))}</td><td>{_escape(m.get('artifact', ''))}</td></tr>"
        for m in modules
    ) or "<tr><td colspan='2'>(none)</td></tr>"

    risk_rows = "\n".join(
        f"<tr><td>{_escape(r.get('id', ''))}</td><td>{_escape(r.get('description', ''))}</td></tr>"
        for r in risks
    ) or "<tr><td colspan='2'>(none)</td></tr>"

    tradeoff_rows = "\n".join(
        f"<tr><td>{_escape(t.get('dimension', ''))}</td><td>{_escape(t.get('accepted', ''))}</td></tr>"
        for t in tradeoffs
    ) or "<tr><td colspan='2'>(none)</td></tr>"

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{_escape(project)} — Architecture Recommendation</title>
<style>{_INLINE_CSS}</style>
</head>
<body>
<div class="wrap">
  <h1>{_escape(project)}</h1>
  <div class="meta">Architecture Recommendation — generated by gen-arch-recommendation</div>

  <div class="callout">
    <strong>Winning alternative:</strong> <span class="tag">{_escape(winner)}</span>
    <p style="margin:.5rem 0 0">{_escape(summary)}</p>
  </div>

  <h2>Rationale</h2>
  <p>{_escape(rationale)}</p>

  <h2>Referenced module outputs</h2>
  <table>
    <thead><tr><th>Module</th><th>Artifact</th></tr></thead>
    <tbody>{module_rows}</tbody>
  </table>

  <h2>Key risks</h2>
  <table>
    <thead><tr><th>ID</th><th>Description</th></tr></thead>
    <tbody>{risk_rows}</tbody>
  </table>

  <h2>Tradeoffs accepted</h2>
  <table>
    <thead><tr><th>Dimension</th><th>Accepted</th></tr></thead>
    <tbody>{tradeoff_rows}</tbody>
  </table>

  <h2>Embedded figures</h2>
  {''.join(artifact_sections) if artifact_sections else '<p><em>No sibling artifacts found in outputDir.</em></p>'}
</div>
</body>
</html>
"""


def _escape(s: Any) -> str:
    if s is None:
        return ""
    return (str(s)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;"))


# -------------------------------------------------------------------- PDF --

def _render_pdf(html: str, out_path: Path, warnings: list[str]) -> bool:
    try:
        from weasyprint import HTML  # type: ignore
    except Exception as exc:
        warnings.append(
            f"gen-arch-recommendation: weasyprint import failed ({exc}); "
            "pdf skipped. Install weasyprint==62.3 per requirements.txt"
        )
        return False
    try:
        HTML(string=html).write_pdf(str(out_path))
        return True
    except Exception as exc:
        warnings.append(f"gen-arch-recommendation: pdf render failed: {type(exc).__name__}: {exc}")
        return False


# ------------------------------------------------------ json-enriched bundle

def _render_enriched_json(
    instance: dict, output_dir: Path, warnings: list[str],
) -> dict:
    # Walk sibling artifacts and inline (for svg/mmd/json) or reference-by-hash
    # (for binary xlsx/pdf).
    import hashlib

    embedded: list[dict[str, Any]] = []
    for p in sorted(output_dir.iterdir()):
        if not p.is_file():
            continue
        if p.suffix == ".json" and p.name == "architecture_recommendation.json-enriched.json":
            # Skip self to avoid recursion / growth
            continue
        rec: dict[str, Any] = {"name": p.name, "ext": p.suffix}
        if p.suffix in (".svg", ".mmd", ".json"):
            try:
                rec["content"] = p.read_text(encoding="utf-8")
            except Exception as exc:
                rec["error"] = f"read failed: {exc}"
        else:
            try:
                data = p.read_bytes()
                rec["sha256"] = hashlib.sha256(data).hexdigest()
                rec["bytes"] = len(data)
            except Exception as exc:
                rec["error"] = f"hash failed: {exc}"
        embedded.append(rec)

    manifest_path = output_dir / "artifacts.manifest.jsonl"
    manifest_lines: list[dict[str, Any]] = []
    if manifest_path.exists():
        try:
            with manifest_path.open("r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if line:
                        manifest_lines.append(json.loads(line))
        except Exception as exc:
            warnings.append(
                f"gen-arch-recommendation: manifest parse failed: {exc}"
            )

    return {
        "recommendation": instance,
        "embeddedArtifacts": embedded,
        "manifest": manifest_lines,
    }


# -------------------------------------------------------------- render ----

def render(instance, output_dir: Path, targets, options, warnings):
    base = options.get("outputBasename") or "architecture_recommendation"
    generated: list[dict[str, str]] = []

    html_text = _render_html(instance, output_dir, warnings)

    if "html" in targets:
        out = output_dir / f"{base}.html"
        out.write_text(html_text, encoding="utf-8")
        generated.append({"target": "html", "path": str(out)})

    if "pdf" in targets:
        out = output_dir / f"{base}.pdf"
        if _render_pdf(html_text, out, warnings):
            generated.append({"target": "pdf", "path": str(out)})

    if "json-enriched" in targets:
        out = output_dir / f"{base}.json-enriched.json"
        bundle = _render_enriched_json(instance, output_dir, warnings)
        out.write_text(
            json.dumps(bundle, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        generated.append({"target": "json-enriched", "path": str(out)})

    if not generated:
        warnings.append("gen-arch-recommendation: no outputs produced (check targets)")
    return generated


if __name__ == "__main__":
    raise SystemExit(run_generator(generator_name="gen-arch-recommendation", render_fn=render))
