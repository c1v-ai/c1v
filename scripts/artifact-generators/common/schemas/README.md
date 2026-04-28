# Extender stub schemas

Permissive JSON-Schema stubs used by gen-decision-net.py and gen-form-function.py
while downstream T4b/T5 schema work is in flight.

Each stub is `{"type": "object", "additionalProperties": true}` so any instance
shape passes validation. Generators that load these stubs append a WARN to the
`warnings` array so operators see stub use in manifest and stdout.

When canonical schemas land under
`apps/product-helper/lib/langchain/schemas/generated/{decision-network,form-function-map}.schema.json`,
callers should pass the canonical `schemaRef` and stubs become orphaned — safe to
delete in a follow-up cleanup.
