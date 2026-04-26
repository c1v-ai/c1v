# c1v Cloud Run sidecar — per-artifact rendering only (D-V21.24).
#
# Hosts the canonical Python generators from scripts/artifact-generators/.
# weasyprint (D-V21.05) + python-pptx (D-V21.06) + mmdc (D-V21.07 + R-V21.02
# mitigation) + chromium-headless for mmdc Puppeteer driver.
#
# Build context: repo root.
#   docker build -f services/python-sidecar/Dockerfile -t python-sidecar .

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    NODE_VERSION=20 \
    PUPPETEER_SKIP_DOWNLOAD=1

# System deps: weasyprint native libs, fonts, chromium for mmdc, node for npm.
# Order: largest-stable layer first (apt) → npm → pip → app code (cache-friendly).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg \
        # weasyprint runtime
        libpango-1.0-0 libpangoft2-1.0-0 libcairo2 libgdk-pixbuf-2.0-0 \
        libffi-dev shared-mime-info \
        # mmdc / puppeteer
        chromium fonts-liberation fonts-dejavu-core \
        libnss3 libxss1 libasound2 libgbm1 libxshmfence1 \
        # build essentials for any wheels missing precompiled
        build-essential \
 && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && npm install -g @mermaid-js/mermaid-cli@10.9.1 \
 && apt-get purge -y build-essential \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use system chromium (we skipped its download above).
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# --- python deps ---
# Reuse the canonical generator requirements + add sidecar-only deps.
COPY scripts/artifact-generators/requirements.txt /tmp/gen-requirements.txt
COPY services/python-sidecar/requirements.txt /tmp/sidecar-requirements.txt
RUN pip install --no-cache-dir -r /tmp/gen-requirements.txt \
 && pip install --no-cache-dir -r /tmp/sidecar-requirements.txt

# --- canonical generators (read-only; do NOT modify per TA3 guardrail) ---
COPY scripts/artifact-generators/ /app/generators/

# --- sidecar code ---
COPY services/python-sidecar/orchestrator.py /app/orchestrator.py
COPY services/python-sidecar/run-single-artifact.py /app/run-single-artifact.py
COPY services/python-sidecar/scripts/ /app/scripts/
RUN chmod +x /app/scripts/render-mermaid.sh

ENV GENERATORS_DIR=/app/generators \
    PORT=8080

EXPOSE 8080

# Cloud Run gunicorn: 1 worker (concurrency=1 in cloud-run.yaml), 4 threads.
# Single worker because subprocess + tempdir handling is per-request heavy.
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "4", \
     "--timeout", "300", "orchestrator:app"]
