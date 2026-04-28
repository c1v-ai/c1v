"""Schema loader + validator for artifact generators.

Resolves ``schemaRef`` against the generated JSON schemas in
``apps/product-helper/lib/langchain/schemas/generated/`` and validates the
``instanceJson`` payload before any rendering work begins.

Per v2 §15.3: validation failures raise and are reported with
``error.phase='validate'``.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

try:
    import jsonschema  # type: ignore
except ImportError as exc:  # pragma: no cover - surfaced at runtime
    raise RuntimeError(
        "jsonschema is required. Install via scripts/artifact-generators/requirements.txt"
    ) from exc


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_SCHEMA_ROOTS = [
    REPO_ROOT / "apps/product-helper/lib/langchain/schemas/generated",
    REPO_ROOT / "apps/product-helper/lib/langchain/schemas/generated/module-2",
    REPO_ROOT / "apps/product-helper/lib/langchain/schemas/generated/atlas",
]


class SchemaValidationError(Exception):
    """Raised when instanceJson does not conform to schemaRef."""

    def __init__(self, message: str, schema_ref: str, path: list[str] | None = None):
        super().__init__(message)
        self.schema_ref = schema_ref
        self.path = path or []


class SchemaNotFoundError(Exception):
    """Raised when schemaRef cannot be resolved under the known schema roots."""


def resolve_schema(schema_ref: str, extra_roots: list[Path] | None = None) -> Path:
    """Locate a schema file by name or relative path.

    Search order:
      1. ``schema_ref`` as an absolute path
      2. ``schema_ref`` resolved relative to each known schema root
      3. Recursive glob under each root matching the basename
    """
    roots: list[Path] = list(DEFAULT_SCHEMA_ROOTS)
    if extra_roots:
        roots = list(extra_roots) + roots

    p = Path(schema_ref)
    if p.is_absolute() and p.exists():
        return p

    for root in roots:
        direct = root / schema_ref
        if direct.exists():
            return direct

    basename = os.path.basename(schema_ref)
    for root in roots:
        if not root.exists():
            continue
        for hit in root.rglob(basename):
            return hit

    raise SchemaNotFoundError(
        f"Could not resolve schemaRef={schema_ref!r} under roots={[str(r) for r in roots]}"
    )


def load_schema(schema_ref: str, extra_roots: list[Path] | None = None) -> dict[str, Any]:
    path = resolve_schema(schema_ref, extra_roots=extra_roots)
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def validate_instance(instance: Any, schema_ref: str, extra_roots: list[Path] | None = None) -> None:
    """Validate ``instance`` against the schema addressed by ``schema_ref``.

    Raises :class:`SchemaValidationError` on validation failure.
    """
    try:
        schema = load_schema(schema_ref, extra_roots=extra_roots)
    except SchemaNotFoundError as exc:
        # Per v2 §15.3 this is still a validate-phase failure
        raise SchemaValidationError(str(exc), schema_ref=schema_ref) from exc

    validator_cls = jsonschema.validators.validator_for(schema)
    validator = validator_cls(schema)
    errors = sorted(validator.iter_errors(instance), key=lambda e: list(e.absolute_path))
    if errors:
        first = errors[0]
        path = [str(p) for p in first.absolute_path]
        msg_lines = [
            f"schema={schema_ref} validation failed ({len(errors)} error(s)):",
            f"  at /{'/'.join(path)}: {first.message}",
        ]
        for extra in errors[1:5]:
            extra_path = "/".join(str(p) for p in extra.absolute_path)
            msg_lines.append(f"  at /{extra_path}: {extra.message}")
        raise SchemaValidationError("\n".join(msg_lines), schema_ref=schema_ref, path=path)
