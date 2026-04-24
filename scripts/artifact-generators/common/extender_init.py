"""Shared bootstrap for extender-owned generators.

Adds ``scripts/artifact-generators/common/schemas/`` to the schema_loader's
DEFAULT_SCHEMA_ROOTS so permissive stubs for Crawley artifacts whose canonical
schemas are still in-flight (T4b decision-network, T5 form-function-map) resolve
without failing validation.

Generators should import this BEFORE ``common.runner`` so root-mutation happens
prior to any schema lookup. Usage:

    from common import extender_init  # noqa: F401
    from common.runner import run_generator
"""
from __future__ import annotations

from pathlib import Path

from common import schema_loader as _sl

_STUB_ROOT = Path(__file__).resolve().parent / "schemas"
if _STUB_ROOT not in _sl.DEFAULT_SCHEMA_ROOTS:
    _sl.DEFAULT_SCHEMA_ROOTS.append(_STUB_ROOT)
