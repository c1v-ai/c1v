# id.c1v.ai API Specification

## Machine-to-Machine Consent Protocol

**Version:** 1.0.0
**Base URL:** `https://id.c1v.ai/api/v1`
**Last Updated:** 2026-01-31

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Codes](#error-codes)
5. [Data Models (Pydantic Schemas)](#data-models-pydantic-schemas)
6. [API Endpoints](#api-endpoints)
   - [Identity Resolution](#identity-resolution)
   - [Consent Contracts](#consent-contracts)
   - [Agent PIN](#agent-pin)
   - [Audit Logs](#audit-logs)
7. [Database Schema](#database-schema)
8. [Security Considerations](#security-considerations)
9. [OpenAPI Spec Structure](#openapi-spec-structure)

---

## Overview

The id.c1v.ai API provides a Machine-to-Machine (M2M) Consent Protocol for secure identity resolution between autonomous agents. The protocol ensures:

- **Verified Identity**: Agents resolve identities through the c1v-id package
- **Explicit Consent**: All data access requires a signed consent contract
- **Time-Bounded Access**: Agent PINs have 60-second TTL for minimal exposure
- **Dual Audit Trail**: Both parties independently log all interactions

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Consent Contract** | A cryptographically signed agreement between two parties specifying allowed data types, actions, and purposes |
| **Agent PIN** | A short-lived token (60s TTL) that grants an agent access to data under a specific contract |
| **Dual Logging** | Both requester and provider independently log all operations for audit compliance |
| **Golden Record** | The merged, deduplicated identity record produced by identity resolution |

---

## Authentication

All API endpoints require authentication via API key.

### API Key Authentication

```
Authorization: Bearer <api_key>
X-Agent-ID: <agent_identifier>
```

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with API key |
| `X-Agent-ID` | Yes | Unique identifier for the calling agent |
| `X-Request-ID` | No | Client-provided request ID for tracing |
| `X-Idempotency-Key` | No | For POST requests - prevents duplicate operations |

### API Key Structure

```python
# API keys are issued per-organization
# Format: c1v_<environment>_<random_32_chars>
# Example: c1v_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Agent Registration

Agents must be registered before making API calls:

```http
POST /api/v1/agents/register
Content-Type: application/json

{
  "agent_id": "agent-healthcare-intake-v1",
  "organization_id": "org_12345",
  "name": "Healthcare Intake Agent",
  "description": "Collects patient information for onboarding",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "allowed_data_types": ["pii.name", "pii.email", "pii.phone"],
  "callback_url": "https://agent.example.com/webhook"
}
```

---

## Rate Limiting

| Endpoint Category | Rate Limit | Burst |
|-------------------|------------|-------|
| Identity Resolution | 100 req/min | 20 |
| Contract Creation | 30 req/min | 5 |
| PIN Validation | 500 req/min | 100 |
| Audit Logs | 200 req/min | 50 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706745600
Retry-After: 30
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Valid key but insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists or state conflict |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Application Error Codes

```json
{
  "error": {
    "code": "CONTRACT_EXPIRED",
    "message": "The consent contract has expired",
    "details": {
      "contract_id": "ctr_12345",
      "expired_at": "2026-01-30T12:00:00Z"
    },
    "request_id": "req_abc123",
    "documentation_url": "https://docs.c1v.ai/errors/CONTRACT_EXPIRED"
  }
}
```

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is invalid or revoked |
| `AGENT_NOT_REGISTERED` | 403 | Agent ID not found in registry |
| `CONTRACT_NOT_FOUND` | 404 | Consent contract does not exist |
| `CONTRACT_EXPIRED` | 403 | Contract has passed its expiration date |
| `CONTRACT_REVOKED` | 403 | Contract was explicitly revoked |
| `CONTRACT_UNSIGNED` | 403 | Contract requires additional signatures |
| `PIN_EXPIRED` | 403 | Agent PIN has expired (60s TTL) |
| `PIN_INVALID` | 403 | PIN is malformed or does not exist |
| `PIN_SCOPE_MISMATCH` | 403 | Requested action not in PIN scope |
| `SIGNATURE_INVALID` | 400 | Cryptographic signature verification failed |
| `SIGNATURE_REQUIRED` | 400 | Request requires cryptographic signature |
| `IDENTITY_NOT_FOUND` | 404 | Golden record UID does not exist |
| `RESOLUTION_FAILED` | 500 | Identity resolution pipeline error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DUAL_LOG_REQUIRED` | 400 | Both parties must submit audit logs |

---

## Data Models (Pydantic Schemas)

### Core Identity Models

```python
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, constr

# ============================================================
# Enums
# ============================================================

class DataType(str, Enum):
    """Standardized data type categories for consent"""
    PII_NAME = "pii.name"
    PII_EMAIL = "pii.email"
    PII_PHONE = "pii.phone"
    PII_ADDRESS = "pii.address"
    PII_SSN = "pii.ssn"
    PII_DOB = "pii.dob"
    FINANCIAL_ACCOUNT = "financial.account"
    FINANCIAL_TRANSACTION = "financial.transaction"
    HEALTH_RECORD = "health.record"
    HEALTH_DIAGNOSIS = "health.diagnosis"
    BEHAVIORAL_PREFERENCE = "behavioral.preference"
    BEHAVIORAL_HISTORY = "behavioral.history"

class ConsentAction(str, Enum):
    """Allowed actions under a consent contract"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    SHARE = "share"
    PROCESS = "process"
    STORE = "store"

class ContractStatus(str, Enum):
    """Lifecycle states for consent contracts"""
    DRAFT = "draft"
    PENDING_SIGNATURE = "pending_signature"
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

class AuditAction(str, Enum):
    """Actions recorded in audit logs"""
    CONTRACT_CREATED = "contract.created"
    CONTRACT_SIGNED = "contract.signed"
    CONTRACT_REVOKED = "contract.revoked"
    PIN_REQUESTED = "pin.requested"
    PIN_VALIDATED = "pin.validated"
    PIN_EXPIRED = "pin.expired"
    IDENTITY_RESOLVED = "identity.resolved"
    IDENTITY_MATCHED = "identity.matched"
    DATA_ACCESSED = "data.accessed"
    DATA_SHARED = "data.shared"

class AuditStatus(str, Enum):
    """Outcome status for audit entries"""
    SUCCESS = "success"
    FAILURE = "failure"
    DENIED = "denied"
    EXPIRED = "expired"

# ============================================================
# Identity Resolution Models (wraps c1v-id)
# ============================================================

class IdentityRecord(BaseModel):
    """A single identity record for resolution"""
    source: str = Field(..., description="Source system identifier")
    source_id: str = Field(..., description="Record ID within source")
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[\d\s\-\(\)]+$")
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=2, description="ISO 3166-1 alpha-2")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    updated_at: Optional[datetime] = None

class ResolveRequest(BaseModel):
    """Batch identity resolution request"""
    records: List[IdentityRecord] = Field(..., min_length=1, max_length=1000)
    contract_id: str = Field(..., description="Valid consent contract ID")
    pin: str = Field(..., description="Valid agent PIN")
    options: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "blocking_rules": ["email_exact", "phone_last7", "name_fsa"],
            "threshold_auto_merge": 0.9,
            "threshold_needs_review": 0.7,
            "include_scores": True
        }
    )

class ResolvedIdentity(BaseModel):
    """A resolved/merged golden identity"""
    uid: str = Field(..., description="Universal identifier (SHA256)")
    email: Optional[str] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    sources: List[str] = Field(default_factory=list)
    source_ids: List[tuple] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0)
    cluster_size: int = Field(..., ge=1)
    created_at: datetime
    updated_at: datetime

class ResolveResponse(BaseModel):
    """Batch identity resolution response"""
    request_id: str
    golden_records: List[ResolvedIdentity]
    metrics: Dict[str, Any] = Field(
        default_factory=lambda: {
            "total_records": 0,
            "golden_records": 0,
            "compression_ratio": 1.0,
            "auto_merge_count": 0,
            "needs_review_count": 0
        }
    )
    processing_time_ms: int

class MatchRequest(BaseModel):
    """Pairwise identity matching request"""
    record1: IdentityRecord
    record2: IdentityRecord
    contract_id: str
    pin: str

class MatchResponse(BaseModel):
    """Pairwise identity matching response"""
    match: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    reason: str
    field_scores: Dict[str, float] = Field(default_factory=dict)

class GoldenRecordResponse(BaseModel):
    """Single golden record retrieval response"""
    uid: str
    record: ResolvedIdentity
    audit_summary: Dict[str, int] = Field(
        default_factory=lambda: {"access_count": 0, "last_accessed": None}
    )

# ============================================================
# Consent Contract Models
# ============================================================

class ContractParty(BaseModel):
    """A party to a consent contract"""
    agent_id: str = Field(..., description="Registered agent identifier")
    organization_id: str
    name: str
    role: str = Field(..., description="'requester' or 'provider'")
    public_key: str = Field(..., description="PEM-encoded public key")

class ContractTerms(BaseModel):
    """Terms and conditions of consent"""
    data_types: List[DataType] = Field(..., min_length=1)
    actions: List[ConsentAction] = Field(..., min_length=1)
    purpose: str = Field(..., min_length=10, max_length=1000)
    retention_days: int = Field(default=90, ge=1, le=3650)
    geographic_restrictions: Optional[List[str]] = Field(
        None, description="ISO 3166-1 alpha-2 country codes"
    )
    third_party_sharing: bool = Field(default=False)
    special_category_data: bool = Field(
        default=False, description="GDPR Article 9 special categories"
    )

class ContractSignature(BaseModel):
    """Cryptographic signature on a contract"""
    agent_id: str
    signature: str = Field(..., description="Base64-encoded Ed25519 signature")
    signed_at: datetime
    public_key_fingerprint: str = Field(
        ..., description="SHA256 fingerprint of signing key"
    )

class ConsentContractCreate(BaseModel):
    """Request to create a new consent contract"""
    party_a: ContractParty = Field(..., description="Requesting party")
    party_b: ContractParty = Field(..., description="Providing party")
    terms: ContractTerms
    expires_at: datetime
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ConsentContract(BaseModel):
    """Complete consent contract with signatures"""
    id: str = Field(..., description="Contract ID (ctr_...)")
    version: int = Field(default=1)
    party_a: ContractParty
    party_b: ContractParty
    terms: ContractTerms
    status: ContractStatus
    signatures: List[ContractSignature] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    revoked_by: Optional[str] = None
    revocation_reason: Optional[str] = None
    content_hash: str = Field(
        ..., description="SHA256 hash of contract content for integrity"
    )

class ContractSignRequest(BaseModel):
    """Request to sign a contract"""
    agent_id: str
    signature: str = Field(..., description="Base64-encoded Ed25519 signature")
    public_key_fingerprint: str

class ContractRevokeRequest(BaseModel):
    """Request to revoke a contract"""
    agent_id: str
    reason: str = Field(..., min_length=10, max_length=500)
    signature: str

# ============================================================
# Agent PIN Models
# ============================================================

class PINScope(BaseModel):
    """Scope of operations allowed under a PIN"""
    data_types: List[DataType]
    actions: List[ConsentAction]
    target_uids: Optional[List[str]] = Field(
        None, description="Specific UIDs if limited scope"
    )
    max_records: int = Field(default=100, ge=1, le=10000)

class AgentPINRequest(BaseModel):
    """Request for a new agent PIN"""
    contract_id: str
    agent_id: str
    scope: PINScope
    signature: str = Field(
        ..., description="Signature proving agent identity"
    )

class AgentPIN(BaseModel):
    """Issued agent PIN"""
    pin_id: str = Field(..., description="PIN ID (pin_...)")
    pin: str = Field(..., description="The actual PIN token")
    contract_id: str
    agent_id: str
    scope: PINScope
    issued_at: datetime
    expires_at: datetime = Field(
        ..., description="60 seconds from issued_at"
    )
    signature: str = Field(
        ..., description="Server signature for PIN verification"
    )
    used: bool = Field(default=False)
    used_at: Optional[datetime] = None

class PINValidateRequest(BaseModel):
    """Request to validate a PIN"""
    pin: str
    agent_id: str
    intended_action: ConsentAction
    intended_data_type: DataType
    target_uid: Optional[str] = None

class PINValidateResponse(BaseModel):
    """PIN validation response"""
    valid: bool
    pin_id: str
    contract_id: str
    remaining_ttl_seconds: int
    scope_match: bool
    reason: Optional[str] = None

class PINAuditResponse(BaseModel):
    """PIN usage audit trail"""
    pin_id: str
    contract_id: str
    agent_id: str
    issued_at: datetime
    expires_at: datetime
    used: bool
    used_at: Optional[datetime]
    validation_attempts: List[Dict[str, Any]]
    actions_performed: List[Dict[str, Any]]

# ============================================================
# Audit Log Models
# ============================================================

class AuditLogEntry(BaseModel):
    """A single audit log entry"""
    id: Optional[str] = Field(None, description="Assigned by server")
    timestamp: datetime
    agent_id: str
    organization_id: str
    contract_id: Optional[str] = None
    pin_id: Optional[str] = None
    action: AuditAction
    target_type: str = Field(..., description="Type of target (identity, contract, pin)")
    target_id: Optional[str] = None
    status: AuditStatus
    details: Dict[str, Any] = Field(default_factory=dict)
    request_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    signature: str = Field(
        ..., description="Agent signature for log integrity"
    )

class DualLogSubmission(BaseModel):
    """Dual audit log submission from both parties"""
    requester_log: AuditLogEntry
    provider_log: Optional[AuditLogEntry] = Field(
        None, description="Provider submits asynchronously"
    )
    correlation_id: str = Field(
        ..., description="Shared ID linking both logs"
    )

class AuditLogQuery(BaseModel):
    """Query parameters for audit log search"""
    contract_id: Optional[str] = None
    agent_id: Optional[str] = None
    pin_id: Optional[str] = None
    action: Optional[AuditAction] = None
    status: Optional[AuditStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)

class AuditLogResponse(BaseModel):
    """Paginated audit log response"""
    logs: List[AuditLogEntry]
    total: int
    limit: int
    offset: int
    has_more: bool
```

---

## API Endpoints

### Identity Resolution

#### POST /resolve - Batch Identity Resolution

Resolves multiple identity records into golden records using the c1v-id package.

```http
POST /api/v1/resolve
Authorization: Bearer <api_key>
X-Agent-ID: agent-crm-sync-v1
Content-Type: application/json

{
  "records": [
    {
      "source": "salesforce",
      "source_id": "sf_001",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "first_name": "John",
      "last_name": "Doe",
      "postal_code": "94107"
    },
    {
      "source": "hubspot",
      "source_id": "hs_001",
      "email": "j.doe@example.com",
      "phone": "5551234567",
      "first_name": "Johnny",
      "last_name": "Doe",
      "postal_code": "94107"
    }
  ],
  "contract_id": "ctr_abc123",
  "pin": "pin_xyz789_1706745600_sig",
  "options": {
    "blocking_rules": ["email_exact", "phone_last7", "name_fsa"],
    "threshold_auto_merge": 0.9,
    "threshold_needs_review": 0.7,
    "include_scores": true
  }
}
```

**Response:**

```json
{
  "request_id": "req_1706745601_abc",
  "golden_records": [
    {
      "uid": "sha256_a1b2c3d4...",
      "email": "john.doe@example.com",
      "phone": "5551234567",
      "first_name": "John",
      "last_name": "Doe",
      "postal_code": "94107",
      "sources": ["salesforce", "hubspot"],
      "source_ids": [["salesforce", "sf_001"], ["hubspot", "hs_001"]],
      "confidence": 0.95,
      "cluster_size": 2,
      "created_at": "2026-01-31T10:00:00Z",
      "updated_at": "2026-01-31T10:00:00Z"
    }
  ],
  "metrics": {
    "total_records": 2,
    "golden_records": 1,
    "compression_ratio": 2.0,
    "auto_merge_count": 1,
    "needs_review_count": 0
  },
  "processing_time_ms": 145
}
```

---

#### POST /match - Pairwise Matching

Compares two records and returns match probability.

```http
POST /api/v1/match
Authorization: Bearer <api_key>
X-Agent-ID: agent-dedup-v1
Content-Type: application/json

{
  "record1": {
    "source": "crm",
    "source_id": "crm_001",
    "email": "jane.smith@company.com",
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "record2": {
    "source": "marketing",
    "source_id": "mkt_001",
    "email": "j.smith@company.com",
    "first_name": "Janet",
    "last_name": "Smith"
  },
  "contract_id": "ctr_abc123",
  "pin": "pin_xyz789_1706745600_sig"
}
```

**Response:**

```json
{
  "match": false,
  "confidence": 0.65,
  "reason": "name_mismatch",
  "field_scores": {
    "email": 0.7,
    "name": 0.5,
    "phone": 0.0
  }
}
```

---

#### GET /golden/{uid} - Retrieve Golden Record

```http
GET /api/v1/golden/sha256_a1b2c3d4e5f6g7h8
Authorization: Bearer <api_key>
X-Agent-ID: agent-lookup-v1
X-Contract-ID: ctr_abc123
X-PIN: pin_xyz789_1706745600_sig
```

**Response:**

```json
{
  "uid": "sha256_a1b2c3d4e5f6g7h8",
  "record": {
    "uid": "sha256_a1b2c3d4e5f6g7h8",
    "email": "john.doe@example.com",
    "phone": "5551234567",
    "first_name": "John",
    "last_name": "Doe",
    "sources": ["salesforce", "hubspot"],
    "confidence": 0.95,
    "cluster_size": 2,
    "created_at": "2026-01-31T10:00:00Z",
    "updated_at": "2026-01-31T10:00:00Z"
  },
  "audit_summary": {
    "access_count": 15,
    "last_accessed": "2026-01-31T09:45:00Z"
  }
}
```

---

### Consent Contracts

#### POST /contracts - Create Contract

```http
POST /api/v1/contracts
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
Content-Type: application/json

{
  "party_a": {
    "agent_id": "agent-healthcare-v1",
    "organization_id": "org_health_123",
    "name": "Healthcare Intake Agent",
    "role": "requester",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMC..."
  },
  "party_b": {
    "agent_id": "agent-insurance-v1",
    "organization_id": "org_insurance_456",
    "name": "Insurance Verification Agent",
    "role": "provider",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMC..."
  },
  "terms": {
    "data_types": ["pii.name", "pii.dob", "health.record"],
    "actions": ["read", "process"],
    "purpose": "Verify patient insurance eligibility for scheduled medical procedures",
    "retention_days": 30,
    "geographic_restrictions": ["US"],
    "third_party_sharing": false,
    "special_category_data": true
  },
  "expires_at": "2026-02-28T23:59:59Z",
  "metadata": {
    "workflow": "patient_onboarding",
    "compliance_framework": "HIPAA"
  }
}
```

**Response:**

```json
{
  "id": "ctr_h3alth_2026013101",
  "version": 1,
  "party_a": { ... },
  "party_b": { ... },
  "terms": { ... },
  "status": "pending_signature",
  "signatures": [],
  "created_at": "2026-01-31T10:00:00Z",
  "updated_at": "2026-01-31T10:00:00Z",
  "expires_at": "2026-02-28T23:59:59Z",
  "content_hash": "sha256_contract_content_hash"
}
```

---

#### POST /contracts/{id}/sign - Sign Contract

```http
POST /api/v1/contracts/ctr_h3alth_2026013101/sign
Authorization: Bearer <api_key>
X-Agent-ID: agent-insurance-v1
Content-Type: application/json

{
  "agent_id": "agent-insurance-v1",
  "signature": "base64_encoded_ed25519_signature",
  "public_key_fingerprint": "sha256_of_public_key"
}
```

**Response:**

```json
{
  "id": "ctr_h3alth_2026013101",
  "status": "active",
  "signatures": [
    {
      "agent_id": "agent-healthcare-v1",
      "signature": "base64_...",
      "signed_at": "2026-01-31T10:00:00Z",
      "public_key_fingerprint": "sha256_..."
    },
    {
      "agent_id": "agent-insurance-v1",
      "signature": "base64_...",
      "signed_at": "2026-01-31T10:01:00Z",
      "public_key_fingerprint": "sha256_..."
    }
  ],
  "updated_at": "2026-01-31T10:01:00Z"
}
```

---

#### GET /contracts/{id} - Get Contract

```http
GET /api/v1/contracts/ctr_h3alth_2026013101
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
```

---

#### DELETE /contracts/{id} - Revoke Contract

```http
DELETE /api/v1/contracts/ctr_h3alth_2026013101
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
Content-Type: application/json

{
  "agent_id": "agent-healthcare-v1",
  "reason": "Patient has withdrawn consent for data sharing with insurance provider",
  "signature": "base64_encoded_revocation_signature"
}
```

**Response:**

```json
{
  "id": "ctr_h3alth_2026013101",
  "status": "revoked",
  "revoked_at": "2026-01-31T12:00:00Z",
  "revoked_by": "agent-healthcare-v1",
  "revocation_reason": "Patient has withdrawn consent for data sharing with insurance provider"
}
```

---

### Agent PIN

#### POST /pins - Request PIN

Requires a valid, active consent contract.

```http
POST /api/v1/pins
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
Content-Type: application/json

{
  "contract_id": "ctr_h3alth_2026013101",
  "agent_id": "agent-healthcare-v1",
  "scope": {
    "data_types": ["pii.name", "pii.dob"],
    "actions": ["read"],
    "target_uids": null,
    "max_records": 10
  },
  "signature": "base64_proof_of_agent_identity"
}
```

**Response:**

```json
{
  "pin_id": "pin_h3alth_1706788800",
  "pin": "pin_abc123def456_1706788800_sig789",
  "contract_id": "ctr_h3alth_2026013101",
  "agent_id": "agent-healthcare-v1",
  "scope": {
    "data_types": ["pii.name", "pii.dob"],
    "actions": ["read"],
    "target_uids": null,
    "max_records": 10
  },
  "issued_at": "2026-01-31T12:00:00Z",
  "expires_at": "2026-01-31T12:01:00Z",
  "signature": "server_signature_for_verification",
  "used": false,
  "used_at": null
}
```

---

#### POST /pins/{id}/validate - Validate PIN

```http
POST /api/v1/pins/pin_h3alth_1706788800/validate
Authorization: Bearer <api_key>
X-Agent-ID: agent-insurance-v1
Content-Type: application/json

{
  "pin": "pin_abc123def456_1706788800_sig789",
  "agent_id": "agent-healthcare-v1",
  "intended_action": "read",
  "intended_data_type": "pii.name",
  "target_uid": null
}
```

**Response:**

```json
{
  "valid": true,
  "pin_id": "pin_h3alth_1706788800",
  "contract_id": "ctr_h3alth_2026013101",
  "remaining_ttl_seconds": 45,
  "scope_match": true,
  "reason": null
}
```

---

#### GET /pins/{id}/audit - PIN Audit Trail

```http
GET /api/v1/pins/pin_h3alth_1706788800/audit
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
```

**Response:**

```json
{
  "pin_id": "pin_h3alth_1706788800",
  "contract_id": "ctr_h3alth_2026013101",
  "agent_id": "agent-healthcare-v1",
  "issued_at": "2026-01-31T12:00:00Z",
  "expires_at": "2026-01-31T12:01:00Z",
  "used": true,
  "used_at": "2026-01-31T12:00:30Z",
  "validation_attempts": [
    {
      "timestamp": "2026-01-31T12:00:30Z",
      "validator_agent": "agent-insurance-v1",
      "action": "read",
      "result": "valid"
    }
  ],
  "actions_performed": [
    {
      "timestamp": "2026-01-31T12:00:31Z",
      "action": "read",
      "data_type": "pii.name",
      "record_count": 5
    }
  ]
}
```

---

### Audit Logs

#### POST /logs - Submit Dual Log Entry

Both parties must submit logs for compliance.

```http
POST /api/v1/logs
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
Content-Type: application/json

{
  "requester_log": {
    "timestamp": "2026-01-31T12:00:31Z",
    "agent_id": "agent-healthcare-v1",
    "organization_id": "org_health_123",
    "contract_id": "ctr_h3alth_2026013101",
    "pin_id": "pin_h3alth_1706788800",
    "action": "data.accessed",
    "target_type": "identity",
    "target_id": "sha256_a1b2c3d4",
    "status": "success",
    "details": {
      "data_types": ["pii.name", "pii.dob"],
      "record_count": 5,
      "purpose": "patient_verification"
    },
    "request_id": "req_1706788831_abc",
    "ip_address": "10.0.0.1",
    "user_agent": "HealthcareAgent/1.0",
    "signature": "base64_log_signature"
  },
  "correlation_id": "corr_1706788831_xyz"
}
```

**Response:**

```json
{
  "id": "log_1706788831_001",
  "correlation_id": "corr_1706788831_xyz",
  "requester_log_id": "log_1706788831_req",
  "provider_log_id": null,
  "status": "pending_provider",
  "created_at": "2026-01-31T12:00:32Z"
}
```

---

#### GET /logs - Query Audit Logs

```http
GET /api/v1/logs?contract_id=ctr_h3alth_2026013101&action=data.accessed&limit=50
Authorization: Bearer <api_key>
X-Agent-ID: agent-healthcare-v1
```

**Response:**

```json
{
  "logs": [
    {
      "id": "log_1706788831_001",
      "timestamp": "2026-01-31T12:00:31Z",
      "agent_id": "agent-healthcare-v1",
      "organization_id": "org_health_123",
      "contract_id": "ctr_h3alth_2026013101",
      "pin_id": "pin_h3alth_1706788800",
      "action": "data.accessed",
      "target_type": "identity",
      "target_id": "sha256_a1b2c3d4",
      "status": "success",
      "details": { ... },
      "signature": "base64_..."
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

---

## Database Schema

### PostgreSQL Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ORGANIZATIONS & AGENTS
-- ============================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    api_key_hash VARCHAR(64) NOT NULL,  -- SHA256 of API key
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,  -- External identifier
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    public_key TEXT NOT NULL,  -- PEM-encoded
    public_key_fingerprint VARCHAR(64) NOT NULL,  -- SHA256
    allowed_data_types JSONB DEFAULT '[]'::JSONB,
    callback_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',  -- active, suspended, revoked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_id_format CHECK (agent_id ~ '^[a-z0-9\-]+$')
);

CREATE INDEX idx_agents_org ON agents(organization_id);
CREATE INDEX idx_agents_status ON agents(status);

-- ============================================================
-- CONSENT CONTRACTS
-- ============================================================

CREATE TABLE consent_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id VARCHAR(50) UNIQUE NOT NULL,  -- External ID (ctr_...)
    version INT DEFAULT 1,

    -- Parties
    party_a_agent_id UUID REFERENCES agents(id),
    party_a_role VARCHAR(20) NOT NULL,
    party_b_agent_id UUID REFERENCES agents(id),
    party_b_role VARCHAR(20) NOT NULL,

    -- Terms
    data_types JSONB NOT NULL,  -- Array of DataType enum values
    actions JSONB NOT NULL,  -- Array of ConsentAction enum values
    purpose TEXT NOT NULL,
    retention_days INT DEFAULT 90,
    geographic_restrictions JSONB,  -- Array of country codes
    third_party_sharing BOOLEAN DEFAULT FALSE,
    special_category_data BOOLEAN DEFAULT FALSE,

    -- Status
    status VARCHAR(30) DEFAULT 'draft',
    content_hash VARCHAR(64) NOT NULL,  -- SHA256 of contract content

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES agents(id),
    revocation_reason TEXT,

    CONSTRAINT valid_expiry CHECK (expires_at > created_at),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'revoked'))
);

CREATE INDEX idx_contracts_status ON consent_contracts(status);
CREATE INDEX idx_contracts_expires ON consent_contracts(expires_at);
CREATE INDEX idx_contracts_party_a ON consent_contracts(party_a_agent_id);
CREATE INDEX idx_contracts_party_b ON consent_contracts(party_b_agent_id);

CREATE TABLE contract_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES consent_contracts(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    signature TEXT NOT NULL,  -- Base64-encoded Ed25519 signature
    public_key_fingerprint VARCHAR(64) NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(contract_id, agent_id)
);

-- ============================================================
-- AGENT PINS
-- ============================================================

CREATE TABLE agent_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pin_id VARCHAR(50) UNIQUE NOT NULL,  -- External ID (pin_...)
    pin_hash VARCHAR(64) NOT NULL,  -- SHA256 of actual PIN

    contract_id UUID REFERENCES consent_contracts(id),
    agent_id UUID REFERENCES agents(id),

    -- Scope
    scope_data_types JSONB NOT NULL,
    scope_actions JSONB NOT NULL,
    scope_target_uids JSONB,  -- Optional: specific UIDs
    scope_max_records INT DEFAULT 100,

    -- Server signature
    server_signature TEXT NOT NULL,

    -- Timestamps
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,  -- issued_at + 60 seconds

    -- Usage
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,

    CONSTRAINT valid_ttl CHECK (expires_at = issued_at + INTERVAL '60 seconds')
);

CREATE INDEX idx_pins_contract ON agent_pins(contract_id);
CREATE INDEX idx_pins_agent ON agent_pins(agent_id);
CREATE INDEX idx_pins_expires ON agent_pins(expires_at);
CREATE INDEX idx_pins_used ON agent_pins(used);

-- Automatic cleanup of expired PINs (via pg_cron or similar)
-- DELETE FROM agent_pins WHERE expires_at < NOW() - INTERVAL '1 hour';

-- ============================================================
-- GOLDEN RECORDS (Identity Resolution Results)
-- ============================================================

CREATE TABLE golden_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(64) UNIQUE NOT NULL,  -- SHA256 identifier

    -- Core fields (nullable - may be masked or unavailable)
    email VARCHAR(255),
    email_normalized VARCHAR(255),  -- For matching
    phone VARCHAR(50),
    phone_normalized VARCHAR(20),  -- Digits only
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    country CHAR(2),  -- ISO 3166-1 alpha-2

    -- Metadata
    sources JSONB NOT NULL DEFAULT '[]'::JSONB,  -- Array of source names
    source_ids JSONB NOT NULL DEFAULT '[]'::JSONB,  -- Array of [source, id] tuples
    confidence DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    cluster_size INT NOT NULL DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX idx_golden_email ON golden_records(email_normalized);
CREATE INDEX idx_golden_phone ON golden_records(phone_normalized);
CREATE INDEX idx_golden_updated ON golden_records(updated_at);

-- ============================================================
-- AUDIT LOGS (Append-Only)
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Context
    correlation_id VARCHAR(50),  -- Links requester + provider logs
    agent_id UUID REFERENCES agents(id),
    organization_id UUID REFERENCES organizations(id),
    contract_id UUID REFERENCES consent_contracts(id),
    pin_id UUID REFERENCES agent_pins(id),

    -- Action
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    status VARCHAR(20) NOT NULL,

    -- Details
    details JSONB DEFAULT '{}'::JSONB,
    request_id VARCHAR(50),
    ip_address INET,
    user_agent TEXT,

    -- Integrity
    signature TEXT NOT NULL,  -- Agent signature
    previous_log_hash VARCHAR(64),  -- Hash chain for integrity
    log_hash VARCHAR(64) NOT NULL,  -- SHA256(all fields + previous_log_hash)

    -- Timestamp (immutable)
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_correlation ON audit_logs(correlation_id);
CREATE INDEX idx_audit_contract ON audit_logs(contract_id);
CREATE INDEX idx_audit_agent ON audit_logs(agent_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================
-- RATE LIMITING
-- ============================================================

CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id),
    endpoint_category VARCHAR(50) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT DEFAULT 0,

    UNIQUE(agent_id, endpoint_category, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON rate_limits(agent_id, endpoint_category, window_start);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON consent_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_golden_records_updated_at
    BEFORE UPDATE ON golden_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Contract status auto-update on signature
CREATE OR REPLACE FUNCTION update_contract_status_on_signature()
RETURNS TRIGGER AS $$
DECLARE
    sig_count INT;
BEGIN
    SELECT COUNT(*) INTO sig_count
    FROM contract_signatures
    WHERE contract_id = NEW.contract_id;

    -- Both parties signed = active
    IF sig_count >= 2 THEN
        UPDATE consent_contracts
        SET status = 'active', updated_at = NOW()
        WHERE id = NEW.contract_id;
    ELSIF sig_count = 1 THEN
        UPDATE consent_contracts
        SET status = 'pending_signature', updated_at = NOW()
        WHERE id = NEW.contract_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_signature_status_update
    AFTER INSERT ON contract_signatures
    FOR EACH ROW EXECUTE FUNCTION update_contract_status_on_signature();

-- Expire contracts automatically (run via pg_cron)
CREATE OR REPLACE FUNCTION expire_contracts()
RETURNS void AS $$
BEGIN
    UPDATE consent_contracts
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Security Considerations

### Cryptographic Requirements

| Component | Algorithm | Key Size |
|-----------|-----------|----------|
| API Key | Secure random | 256 bits |
| Contract Signature | Ed25519 | 256 bits |
| PIN Signature | HMAC-SHA256 | 256 bits |
| Content Hash | SHA256 | 256 bits |
| UID Generation | SHA256 | 256 bits |

### Signature Verification Flow

```
1. Agent generates Ed25519 key pair
2. Public key registered with agent profile
3. For each signed request:
   a. Agent signs (message || timestamp || nonce) with private key
   b. Server verifies signature against registered public key
   c. Server checks timestamp within 5-minute window
   d. Server checks nonce not replayed
```

### PIN Security

- 60-second TTL limits exposure window
- PIN contains: `pin_<random>_<expiry_timestamp>_<server_signature>`
- Server signature prevents forgery
- Single-use PINs available via `single_use: true` option
- PINs bound to specific contract and scope

### Audit Log Integrity

- Append-only table (no updates/deletes in application)
- Hash chain: each log includes hash of previous log
- Agent signature on each log entry
- Dual logging: both parties must log independently
- Logs are immutable after creation

---

## OpenAPI Spec Structure

```yaml
openapi: 3.1.0
info:
  title: id.c1v.ai - Machine-to-Machine Consent Protocol
  version: 1.0.0
  description: |
    Secure identity resolution with consent management for autonomous agents.
  contact:
    name: C1V API Support
    email: api@c1v.ai
    url: https://docs.c1v.ai
  license:
    name: Proprietary
    url: https://c1v.ai/terms

servers:
  - url: https://id.c1v.ai/api/v1
    description: Production
  - url: https://staging.id.c1v.ai/api/v1
    description: Staging
  - url: http://localhost:8000/api/v1
    description: Local Development

security:
  - BearerAuth: []
  - AgentAuth: []

tags:
  - name: Identity
    description: Identity resolution operations
  - name: Contracts
    description: Consent contract management
  - name: PINs
    description: Agent PIN lifecycle
  - name: Audit
    description: Audit logging and queries

paths:
  /resolve:
    post:
      tags: [Identity]
      summary: Batch identity resolution
      operationId: resolveIdentities
      # ... full spec continues

  /match:
    post:
      tags: [Identity]
      summary: Pairwise identity matching
      operationId: matchRecords

  /golden/{uid}:
    get:
      tags: [Identity]
      summary: Retrieve golden record
      operationId: getGoldenRecord

  /contracts:
    post:
      tags: [Contracts]
      summary: Create consent contract
      operationId: createContract

  /contracts/{id}:
    get:
      tags: [Contracts]
      summary: Get contract details
      operationId: getContract
    delete:
      tags: [Contracts]
      summary: Revoke contract
      operationId: revokeContract

  /contracts/{id}/sign:
    post:
      tags: [Contracts]
      summary: Sign contract
      operationId: signContract

  /pins:
    post:
      tags: [PINs]
      summary: Request agent PIN
      operationId: requestPIN

  /pins/{id}/validate:
    post:
      tags: [PINs]
      summary: Validate PIN
      operationId: validatePIN

  /pins/{id}/audit:
    get:
      tags: [PINs]
      summary: PIN audit trail
      operationId: getPINAudit

  /logs:
    post:
      tags: [Audit]
      summary: Submit audit log
      operationId: submitLog
    get:
      tags: [Audit]
      summary: Query audit logs
      operationId: queryLogs

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: API Key
    AgentAuth:
      type: apiKey
      in: header
      name: X-Agent-ID

  schemas:
    # All Pydantic models converted to JSON Schema
    IdentityRecord:
      type: object
      properties:
        source:
          type: string
        source_id:
          type: string
        email:
          type: string
          format: email
        # ... continues for all models

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Authentication required
    Forbidden:
      description: Insufficient permissions
    NotFound:
      description: Resource not found
    RateLimited:
      description: Rate limit exceeded
      headers:
        Retry-After:
          schema:
            type: integer
```

---

## Appendix: Implementation Notes

### FastAPI Router Structure

```
src/
├── api/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app factory
│   ├── dependencies.py         # Shared dependencies (auth, db)
│   ├── middleware.py           # Rate limiting, logging
│   └── v1/
│       ├── __init__.py
│       ├── router.py           # Main v1 router
│       ├── identity.py         # /resolve, /match, /golden
│       ├── contracts.py        # /contracts/*
│       ├── pins.py             # /pins/*
│       └── audit.py            # /logs
├── core/
│   ├── config.py               # Settings via pydantic-settings
│   ├── security.py             # Crypto operations
│   └── exceptions.py           # Custom exceptions
├── models/
│   ├── __init__.py
│   ├── domain.py               # Pydantic models (from this spec)
│   └── db.py                   # SQLAlchemy/Drizzle models
├── services/
│   ├── identity.py             # c1v-id integration
│   ├── contracts.py            # Contract lifecycle
│   ├── pins.py                 # PIN management
│   └── audit.py                # Audit logging
└── db/
    ├── session.py              # Database connection
    └── repositories/           # Data access layer
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/c1v_identity
API_SECRET_KEY=<32-byte-hex>  # For PIN signing
SIGNING_PRIVATE_KEY=<Ed25519 private key PEM>

# Optional
LOG_LEVEL=INFO
CORS_ORIGINS=https://app.c1v.ai
RATE_LIMIT_ENABLED=true
SENTRY_DSN=https://...
```

---

**End of Specification**
