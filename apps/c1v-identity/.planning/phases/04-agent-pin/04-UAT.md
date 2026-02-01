---
status: complete
phase: 04-agent-pin
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-02-01T14:00:00Z
updated: 2026-02-01T14:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Create PIN against active contract
expected: POST `/api/v1/pins` with valid contract_id returns 201 with PIN containing id, pin (token.signature), scope, and 60-second TTL
result: pass

### 2. PIN creation rejected for inactive contract
expected: POST `/api/v1/pins` with contract_id for non-ACTIVE contract returns 400 with error_code CONTRACT_NOT_ACTIVE
result: pass

### 3. PIN creation rejected for non-party agent
expected: POST `/api/v1/pins` where authenticated agent is neither party_a nor party_b of the contract returns 403 with error_code NOT_CONTRACT_PARTY
result: pass

### 4. PIN creation rejected for scope exceeding contract
expected: POST `/api/v1/pins` with scope broader than contract's allowed scope returns 400 with error_code SCOPE_EXCEEDS_CONTRACT
result: pass

### 5. Validate PIN successfully
expected: POST `/api/v1/pins/{id}/validate` with correct pin value and valid scope returns 200 with valid=true and contract_id
result: pass

### 6. Validate expired PIN
expected: POST `/api/v1/pins/{id}/validate` after 60 seconds have passed returns 200 with valid=false, error_code=PIN_EXPIRED
result: pass

### 7. Single-use PIN consumed after first validation
expected: Validate a single_use=true PIN successfully, then validate again. Second validation returns valid=false, error_code=PIN_ALREADY_USED
result: pass

### 8. Validate PIN with scope mismatch
expected: POST `/api/v1/pins/{id}/validate` with requested_scope broader than PIN's scope returns valid=false, error_code=PIN_SCOPE_MISMATCH
result: pass

### 9. Validate PIN with invalid signature
expected: POST `/api/v1/pins/{id}/validate` with tampered or wrong pin value returns valid=false, error_code=PIN_INVALID
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
