# Forwarding pointer — canonical sidecar Dockerfile lives at
# services/python-sidecar/Dockerfile. This file exists so build pipelines that
# expect everything-in-infra/docker/ resolve correctly.
#
#   docker build -f services/python-sidecar/Dockerfile -t python-sidecar .
#
# Do NOT duplicate Dockerfile content here — keep one source of truth.
