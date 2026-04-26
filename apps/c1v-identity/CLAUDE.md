<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# c1v-identity

AI-native Customer Data Platform (CDP) — Python/FastAPI backend for identity resolution, data quality gating, synthetic data generation, and natural-language data querying.

## Status

Scaffold stage. Not yet integrated with the product-helper Next.js app or shared monorepo infrastructure. See root `CLAUDE.md` "Current Reality" section.

## Tech Stack (intended)

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Purpose modules:** `ask_data/` (NL→SQL), `identity/` (resolution), `dq_gate/` (data quality), `gen/` (synthetic data), `serve/` (FastAPI app), `demo/` (Streamlit UI)

## Quick Start (once scaffolded)

```bash
cd apps/c1v-identity
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.serve.api:app --reload --port 8000
```

## Conventions

- Python deps in `requirements.txt` / `pyproject.toml` (not package.json)
- Tests: `pytest` from app root
- Do NOT cross-import with `apps/product-helper/` without explicit owner approval — apps intentionally isolated until `packages/` shared layer exists
