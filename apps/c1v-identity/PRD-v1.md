# Product Requirements Document: id.c1v.ai

## Machine-to-Machine Consent Protocol

**Document Version:** 1.0
**Status:** Draft
**Owner:** Product Manager Agent
**Target Release:** v1.0.0
**Last Updated:** January 31, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users and Personas](#3-target-users-and-personas)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [API Specification](#7-api-specification)
8. [Success Metrics](#8-success-metrics)
9. [Out of Scope for v1](#9-out-of-scope-for-v1)
10. [Appendix](#appendix)

---

## 1. Executive Summary

### Product Vision

id.c1v.ai is the third product in the C1V platform (alongside prd.c1v.ai and sys.c1v.ai), providing the industry's first Machine-to-Machine Consent Protocol for AI agent governance.

### Core Value Proposition

**Unlike current agent authorization (unilateral - agent has API key, does whatever), id.c1v.ai enforces BILATERAL consent:**

| Current State | id.c1v.ai State |
|---------------|-----------------|
| Agent A has API key for System B | Both parties must agree before data flows |
| No visibility into what agent does | Every interaction logged by BOTH sides |
| Permanent or long-lived tokens | Short-lived authorization tokens (60s TTL) |
| No consent verification | Explicit consent contracts with signatures |

### Key Differentiators

1. **Vec2vec Resistant** - No embeddings stored, nothing to translate or invert (addresses Cornell NeurIPS 2025 attack vectors)
2. **Bilateral Consent** - Both requesting agent and data system must explicitly agree
3. **Dual Logging** - Both sides independently log every interaction
4. **Agent PIN** - Short-lived (60 second TTL) runtime authorization tokens

### Platform Context

```
+-----------------------------------------------------------+
|  prd.c1v.ai - Product Requirements Documentation          |
|  "PRD generator for products"                             |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
|  sys.c1v.ai - System Builder for Agents                   |
|  "Scope and configure agent systems"                      |
+----------------------------+------------------------------+
                             |
                             | Outputs deployment config
                             v
+-----------------------------------------------------------+
|  id.c1v.ai - Machine-to-Machine Consent Protocol          |
|  "Identity resolution + governance layer for agents"      |
|                                                           |
|  - Identity Resolution (c1v-id engine)                    |
|  - Consent Contracts (bilateral agreements)               |
|  - Agent PIN (runtime authorization)                      |
|  - Dual Audit Logging                                     |
+-----------------------------------------------------------+
```

---

## 2. Problem Statement

### The Fundamental Gap in Agent Authorization

Current approaches to AI agent authorization are fundamentally **unilateral**:

```
Agent A has Salesforce API key --> Agent A reads anything the key permits
```

**Nobody asks:** "Did Salesforce consent to THIS agent accessing THIS data for THIS purpose?"

### Specific Problems

#### 2.1 No Consent Verification

When an AI agent requests access to a system, there is no mechanism for:
- The data-holding system to verify the request is legitimate
- Both parties to agree on the scope and purpose of access
- Either party to revoke access in real-time

#### 2.2 Insufficient Audit Trails

Current logging approaches are one-sided:
- Only the requesting system logs the interaction
- The data-holding system has no independent record
- Compliance audits cannot verify what actually happened

#### 2.3 Long-Lived Credentials

API keys and OAuth tokens are problematic for agent-to-agent communication:
- Tokens are often long-lived (hours, days, or indefinite)
- Revocation is manual and often delayed
- Compromised credentials have extended impact windows

#### 2.4 Embedding Vulnerability (vec2vec Attack)

The Cornell NeurIPS 2025 paper "vec2vec" demonstrated that:
- All neural networks trained on the same modality converge to a universal latent space
- Embeddings can be translated between ANY two models without paired training data
- 0.96 cosine similarity to ground truth achieved
- 80% of Enron emails leaked sensitive information from embeddings

**Every identity resolution system using embeddings is now a liability.**

### Why This Matters Now

| Regulation | Effective Date | Relevant Requirement |
|------------|----------------|---------------------|
| CCPA ADMT | January 2026 | Automated decision-making transparency |
| EU AI Act | February 2026 | Human oversight for AI systems |
| GDPR Article 22 | Active | Right to human intervention |
| HIPAA | Active | Audit trails for PHI access |
| PHIPA | Active | Consent management for health data |
| 38 State AI Laws | 2025 | Deterministic, auditable algorithms |

**Agent PIN = compliance checkbox.** When regulators ask "how do you ensure Agent A had permission to access System B's data?", organizations need a verifiable answer.

---

## 3. Target Users and Personas

### 3.1 Primary Persona: AI Agent Developer

**Name:** Maya Chen
**Role:** Senior Software Engineer at a Series B healthcare startup
**Background:** Building AI-powered patient coordination tools

**Needs:**
- Simple API to add consent verification to agent workflows
- Audit logs for HIPAA compliance
- Real-time authorization (not batch)
- Python and TypeScript SDKs

**Pain Points:**
- "We built our own consent system but auditors don't trust it"
- "Managing API keys across 15 systems is a nightmare"
- "We need to prove our AI made authorized decisions"

**Quote:** "I need a consent layer I can add in a day, not a month."

### 3.2 Secondary Persona: Enterprise Systems Integrator

**Name:** James Rodriguez
**Role:** Solutions Architect at a healthcare IT consulting firm
**Background:** Deploying AI systems across hospital networks

**Needs:**
- Multi-tenant consent management
- Integration with existing IAM (Okta, Azure AD)
- Compliance documentation for client audits
- Enterprise SLAs and support

**Pain Points:**
- "Every client asks about AI governance, and we have no standard answer"
- "Our liability insurance requires documented consent trails"
- "We need to demonstrate HIPAA compliance for each deployment"

**Quote:** "I need to tell my clients their patient data is protected with a straight face."

### 3.3 Tertiary Persona: Security/Compliance Officer

**Name:** Dr. Sarah Kim
**Role:** Chief Information Security Officer at a dental services organization
**Background:** 15 years in healthcare IT security

**Needs:**
- Immutable audit trails
- Real-time revocation capabilities
- Compliance reporting dashboards
- Breach impact analysis tools

**Pain Points:**
- "I can't tell what our AI agents are actually doing with patient data"
- "If there's a breach, I have no forensic trail"
- "Auditors ask for consent verification and I have nothing to show"

**Quote:** "Show me the receipts for every data access decision."

---

## 4. User Stories

### Epic 1: Identity Resolution

| ID | Story | Priority |
|----|-------|----------|
| ID-001 | As an agent developer, I want to resolve duplicate records across my data sources so that my agent has a unified view of each entity | P0 |
| ID-002 | As an agent developer, I want to perform pairwise matching between two records so that I can determine if they represent the same entity | P0 |
| ID-003 | As an agent developer, I want to retrieve a golden record by its UID so that my agent can access the merged identity | P0 |
| ID-004 | As a systems integrator, I want to configure blocking strategies so that resolution performance scales with data volume | P1 |
| ID-005 | As a security officer, I want identity resolution to work without storing embeddings so that vec2vec attacks are not possible | P0 |

### Epic 2: Consent Contracts

| ID | Story | Priority |
|----|-------|----------|
| CC-001 | As an agent developer, I want to propose a consent contract to another party so that we can establish a governed relationship | P0 |
| CC-002 | As a data system owner, I want to review and sign consent contracts so that I explicitly authorize specific data access | P0 |
| CC-003 | As either party, I want to view the terms of an active contract so that I can verify what was agreed | P0 |
| CC-004 | As either party, I want to revoke a consent contract immediately so that access is terminated in real-time | P0 |
| CC-005 | As a compliance officer, I want contracts to include cryptographic signatures so that agreement is non-repudiable | P1 |
| CC-006 | As an agent developer, I want contracts to specify data types, actions, and purposes so that scope is clearly bounded | P0 |
| CC-007 | As a compliance officer, I want contracts to map to regulatory frameworks (HIPAA, PHIPA, GDPR) so that compliance is documented | P1 |

### Epic 3: Agent PIN (Runtime Authorization)

| ID | Story | Priority |
|----|-------|----------|
| AP-001 | As an agent, I want to request a PIN for a specific action so that I can make authorized requests | P0 |
| AP-002 | As a data system, I want to validate a PIN before fulfilling a request so that only authorized actions proceed | P0 |
| AP-003 | As either party, I want PINs to expire after 60 seconds so that long-lived credentials are eliminated | P0 |
| AP-004 | As a compliance officer, I want to query the audit trail for a specific PIN so that I can trace exactly what happened | P0 |
| AP-005 | As an agent developer, I want PIN requests to fail fast if the contract doesn't authorize the action so that errors are immediate | P1 |

### Epic 4: Dual Audit Logging

| ID | Story | Priority |
|----|-------|----------|
| AL-001 | As a requesting agent, I want to submit my log entry for every interaction so that my side is recorded | P0 |
| AL-002 | As a responding system, I want to submit my log entry for every interaction so that my side is recorded | P0 |
| AL-003 | As a compliance officer, I want to query logs by contract ID so that I can see all interactions under a specific agreement | P0 |
| AL-004 | As a compliance officer, I want to query logs by agent ID so that I can audit a specific agent's behavior | P0 |
| AL-005 | As a security officer, I want log entries to be immutable so that they cannot be tampered with | P1 |
| AL-006 | As a compliance officer, I want to detect log discrepancies between parties so that anomalies are flagged | P2 |

---

## 5. Functional Requirements

### 5.1 Identity Resolution

The system SHALL use the c1v-id engine (PyPI package v0.1.0) for identity resolution.

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| FR-IR-001 | The system SHALL provide batch identity resolution via POST /resolve | Enable resolving multiple records in a single request |
| FR-IR-002 | The system SHALL provide pairwise matching via POST /match | Enable real-time agent decisions on record pairs |
| FR-IR-003 | The system SHALL provide golden record retrieval via GET /golden/{uid} | Enable agents to fetch merged identity data |
| FR-IR-004 | The system SHALL NOT store or compute embeddings for identity resolution | Eliminate vec2vec attack surface |
| FR-IR-005 | The system SHALL use deterministic algorithms (blocking, scoring, clustering) | Enable auditable, explainable matching decisions |
| FR-IR-006 | The system SHALL support configurable blocking strategies (email_domain, phone_last7, name_fsa, email_exact) | Enable performance tuning for different data profiles |
| FR-IR-007 | The system SHALL return match confidence scores between 0.0 and 1.0 | Enable threshold-based decision making |
| FR-IR-008 | The system SHALL return match decisions (auto_merge, needs_review, no_match) based on configurable thresholds | Standardize resolution outcomes |

### 5.2 Consent Contracts

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| FR-CC-001 | The system SHALL allow creating a consent contract via POST /contracts | Enable proposing new governed relationships |
| FR-CC-002 | The system SHALL require both parties to sign before a contract is active | Enforce bilateral consent |
| FR-CC-003 | The system SHALL allow signing a contract via POST /contracts/{id}/sign | Enable accepting proposed contracts |
| FR-CC-004 | The system SHALL allow retrieving contract details via GET /contracts/{id} | Enable verification of terms |
| FR-CC-005 | The system SHALL allow revoking a contract via DELETE /contracts/{id} | Enable immediate access termination |
| FR-CC-006 | Contracts SHALL include: party_a, party_b, data_types[], actions[], purpose | Define scope of authorized access |
| FR-CC-007 | Contracts SHALL include: retention_days, geographic_scope[], expires_at | Define boundaries and lifecycle |
| FR-CC-008 | Contracts SHALL include cryptographic signatures from both parties | Enable non-repudiation |
| FR-CC-009 | Contracts SHALL map to compliance frameworks (HIPAA, PHIPA, GDPR, PIPEDA) | Document regulatory alignment |
| FR-CC-010 | Contract revocation SHALL take effect within 1 second | Enable real-time access termination |

### 5.3 Agent PIN

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| FR-AP-001 | The system SHALL allow requesting a PIN via POST /pins | Enable runtime authorization requests |
| FR-AP-002 | PIN requests SHALL specify contract_id and scope[] | Bound PIN to specific contract and actions |
| FR-AP-003 | PINs SHALL have a maximum TTL of 60 seconds | Eliminate long-lived credentials |
| FR-AP-004 | The system SHALL allow validating a PIN via POST /pins/{id}/validate | Enable receiving systems to verify authorization |
| FR-AP-005 | PIN validation SHALL fail if the PIN is expired | Enforce TTL |
| FR-AP-006 | PIN validation SHALL fail if the contract is revoked | Enforce real-time revocation |
| FR-AP-007 | PIN validation SHALL fail if the requested scope exceeds the contract | Enforce scope boundaries |
| FR-AP-008 | The system SHALL allow querying PIN audit trail via GET /pins/{id}/audit | Enable forensic analysis |
| FR-AP-009 | PINs SHALL include a cryptographic signature from id.c1v.ai | Enable verification without calling back to the service |
| FR-AP-010 | PIN issuance SHALL complete within 100ms P95 | Enable real-time agent workflows |

### 5.4 Dual Audit Logging

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| FR-AL-001 | The system SHALL accept log entries via POST /logs | Enable both parties to submit their records |
| FR-AL-002 | Log entries SHALL include: timestamp, agent_id, contract_id, pin_id, action, status | Provide complete audit context |
| FR-AL-003 | Log entries SHALL be immutable once submitted | Prevent tampering |
| FR-AL-004 | The system SHALL allow querying logs by contract_id via GET /logs?contract={id} | Enable contract-level audits |
| FR-AL-005 | The system SHALL allow querying logs by agent_id via GET /logs?agent={id} | Enable agent-level audits |
| FR-AL-006 | The system SHALL correlate log entries by pin_id | Enable matching requester and responder records |
| FR-AL-007 | The system SHALL flag log discrepancies when both parties submit for the same pin_id | Enable anomaly detection |
| FR-AL-008 | Log retention SHALL be configurable with a minimum of 7 years for compliance | Meet regulatory requirements |

---

## 6. Non-Functional Requirements

### 6.1 Security Requirements

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| NFR-SEC-001 | All API endpoints SHALL require authentication via API key or JWT | Prevent unauthorized access |
| NFR-SEC-002 | All API communication SHALL use TLS 1.3 | Protect data in transit |
| NFR-SEC-003 | PII stored at rest SHALL be encrypted using AES-256-GCM | Protect data at rest |
| NFR-SEC-004 | Cryptographic signatures SHALL use Ed25519 | Provide strong, efficient signatures |
| NFR-SEC-005 | The system SHALL NOT store raw PII in logs | Prevent PII exposure in audit trails |
| NFR-SEC-006 | API keys SHALL be hashable and rotatable without downtime | Enable credential hygiene |
| NFR-SEC-007 | The system SHALL implement rate limiting per API key (1000 req/min default) | Prevent abuse |
| NFR-SEC-008 | The system SHALL detect and block replay attacks on PINs | Prevent credential reuse |
| NFR-SEC-009 | Zero embeddings SHALL be stored or computed | Eliminate vec2vec attack surface |

### 6.2 Performance Requirements

| Req ID | Requirement | Target |
|--------|-------------|--------|
| NFR-PERF-001 | POST /resolve batch resolution | < 500ms P95 for 100 records |
| NFR-PERF-002 | POST /match pairwise matching | < 50ms P95 |
| NFR-PERF-003 | GET /golden/{uid} retrieval | < 30ms P95 |
| NFR-PERF-004 | POST /contracts creation | < 100ms P95 |
| NFR-PERF-005 | POST /pins issuance | < 100ms P95 |
| NFR-PERF-006 | POST /pins/{id}/validate validation | < 50ms P95 |
| NFR-PERF-007 | POST /logs ingestion | < 20ms P95 |
| NFR-PERF-008 | System uptime | 99.9% monthly |
| NFR-PERF-009 | Horizontal scalability | Linear to 10,000 req/sec |

### 6.3 Compliance Requirements

| Req ID | Requirement | Framework |
|--------|-------------|-----------|
| NFR-COMP-001 | The system SHALL support HIPAA-compliant configurations | HIPAA |
| NFR-COMP-002 | The system SHALL provide BAA (Business Associate Agreement) for healthcare customers | HIPAA |
| NFR-COMP-003 | The system SHALL support data residency in US, Canada, and EU regions | GDPR, PHIPA |
| NFR-COMP-004 | The system SHALL provide audit log exports in standard formats (JSON, CSV) | SOC2 |
| NFR-COMP-005 | The system SHALL support right-to-be-forgotten requests | GDPR, CCPA |
| NFR-COMP-006 | The system SHALL maintain SOC2 Type II certification | Enterprise requirement |
| NFR-COMP-007 | The system SHALL provide compliance reports on demand | Audit requirement |
| NFR-COMP-008 | The system SHALL log all administrative actions | SOC2, HIPAA |

### 6.4 Availability Requirements

| Req ID | Requirement | Rationale |
|--------|-------------|-----------|
| NFR-AVAIL-001 | The system SHALL have no single point of failure | Enable high availability |
| NFR-AVAIL-002 | The system SHALL support active-active multi-region deployment | Enable disaster recovery |
| NFR-AVAIL-003 | RTO (Recovery Time Objective) SHALL be < 15 minutes | Minimize downtime impact |
| NFR-AVAIL-004 | RPO (Recovery Point Objective) SHALL be < 1 minute | Minimize data loss |
| NFR-AVAIL-005 | The system SHALL degrade gracefully under load | Prevent cascading failures |

---

## 7. API Specification

### 7.1 Identity Resolution Endpoints

#### POST /resolve

Batch identity resolution across multiple records.

**Request:**
```json
{
  "records": [
    {
      "source": "crm",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "(555) 123-4567"
    },
    {
      "source": "marketing",
      "email": "johnd@example.com",
      "first_name": "Johnny",
      "last_name": "Doe",
      "phone": "555-123-4567"
    }
  ],
  "config": {
    "blocking": ["email_domain_last4", "phone_last7"],
    "thresholds": {
      "auto_merge": 0.9,
      "review": 0.7
    }
  }
}
```

**Response:**
```json
{
  "golden_records": [
    {
      "uid": "gr_a1b2c3d4",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "5551234567",
      "sources": ["crm", "marketing"],
      "record_count": 2,
      "confidence": 0.94
    }
  ],
  "resolution_stats": {
    "input_records": 2,
    "golden_records": 1,
    "auto_merged": 1,
    "needs_review": 0,
    "no_match": 0
  }
}
```

#### POST /match

Pairwise matching between two records.

**Request:**
```json
{
  "record1": {
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "(555) 123-4567"
  },
  "record2": {
    "email": "johnd@example.com",
    "first_name": "JOHN",
    "last_name": "DOE",
    "phone": "555-123-4567"
  }
}
```

**Response:**
```json
{
  "match": true,
  "confidence": 0.94,
  "decision": "auto_merge",
  "reason": "phone_exact_match",
  "score_breakdown": {
    "email": 0.75,
    "phone": 1.0,
    "name": 0.9
  }
}
```

#### GET /golden/{uid}

Retrieve a merged identity by UID.

**Response:**
```json
{
  "uid": "gr_a1b2c3d4",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "5551234567",
  "address": {
    "street": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postal_code": "M5V 1A1"
  },
  "sources": ["crm", "marketing", "support"],
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-31T15:30:00Z"
}
```

### 7.2 Consent Contract Endpoints

#### POST /contracts

Create a consent contract (propose).

**Request:**
```json
{
  "party_a": "agent_appointment_scheduler",
  "party_b": "system_ehr_east",
  "data_types": ["patient_demographics", "appointment_history"],
  "actions": ["read"],
  "purpose": "appointment_scheduling",
  "retention_days": 7,
  "geographic_scope": ["CA", "US"],
  "compliance": ["HIPAA", "PHIPA"],
  "expires_at": "2027-01-31T00:00:00Z"
}
```

**Response:**
```json
{
  "contract_id": "con_x7y8z9",
  "status": "pending_signature",
  "party_a": "agent_appointment_scheduler",
  "party_b": "system_ehr_east",
  "party_a_signed": true,
  "party_b_signed": false,
  "created_at": "2026-01-31T12:00:00Z",
  "expires_at": "2027-01-31T00:00:00Z"
}
```

#### POST /contracts/{id}/sign

Sign a consent contract (accept).

**Request:**
```json
{
  "party": "system_ehr_east",
  "signature": "ed25519_signature_base64..."
}
```

**Response:**
```json
{
  "contract_id": "con_x7y8z9",
  "status": "active",
  "party_a_signed": true,
  "party_b_signed": true,
  "activated_at": "2026-01-31T12:05:00Z"
}
```

#### GET /contracts/{id}

Get contract details.

**Response:**
```json
{
  "contract_id": "con_x7y8z9",
  "status": "active",
  "party_a": "agent_appointment_scheduler",
  "party_b": "system_ehr_east",
  "data_types": ["patient_demographics", "appointment_history"],
  "actions": ["read"],
  "purpose": "appointment_scheduling",
  "retention_days": 7,
  "geographic_scope": ["CA", "US"],
  "compliance": ["HIPAA", "PHIPA"],
  "party_a_signature": "ed25519_signature_base64...",
  "party_b_signature": "ed25519_signature_base64...",
  "created_at": "2026-01-31T12:00:00Z",
  "activated_at": "2026-01-31T12:05:00Z",
  "expires_at": "2027-01-31T00:00:00Z"
}
```

#### DELETE /contracts/{id}

Revoke a consent contract.

**Request:**
```json
{
  "party": "system_ehr_east",
  "reason": "security_concern",
  "signature": "ed25519_signature_base64..."
}
```

**Response:**
```json
{
  "contract_id": "con_x7y8z9",
  "status": "revoked",
  "revoked_by": "system_ehr_east",
  "revoked_at": "2026-01-31T14:00:00Z",
  "reason": "security_concern"
}
```

### 7.3 Agent PIN Endpoints

#### POST /pins

Request a PIN for authorized action.

**Request:**
```json
{
  "contract_id": "con_x7y8z9",
  "agent_id": "agent_appointment_scheduler",
  "scope": ["read:patient_demographics"]
}
```

**Response:**
```json
{
  "pin_id": "pin_7a3f2b",
  "contract_id": "con_x7y8z9",
  "agent_id": "agent_appointment_scheduler",
  "scope": ["read:patient_demographics"],
  "issued_at": "2026-01-31T12:00:00Z",
  "expires_at": "2026-01-31T12:01:00Z",
  "signature": "ed25519_signature_base64...",
  "ttl_seconds": 60
}
```

#### POST /pins/{id}/validate

Validate a PIN (called by receiving system).

**Request:**
```json
{
  "pin_id": "pin_7a3f2b",
  "requested_scope": ["read:patient_demographics"],
  "validator": "system_ehr_east"
}
```

**Response:**
```json
{
  "valid": true,
  "contract_id": "con_x7y8z9",
  "agent_id": "agent_appointment_scheduler",
  "authorized_scope": ["read:patient_demographics"],
  "expires_in_seconds": 45,
  "contract_status": "active"
}
```

**Error Response (expired):**
```json
{
  "valid": false,
  "error": "pin_expired",
  "message": "PIN expired at 2026-01-31T12:01:00Z"
}
```

#### GET /pins/{id}/audit

Get PIN usage audit trail.

**Response:**
```json
{
  "pin_id": "pin_7a3f2b",
  "contract_id": "con_x7y8z9",
  "agent_id": "agent_appointment_scheduler",
  "scope": ["read:patient_demographics"],
  "issued_at": "2026-01-31T12:00:00Z",
  "expires_at": "2026-01-31T12:01:00Z",
  "validations": [
    {
      "timestamp": "2026-01-31T12:00:05Z",
      "validator": "system_ehr_east",
      "result": "valid",
      "requested_scope": ["read:patient_demographics"]
    }
  ],
  "usage_count": 1
}
```

### 7.4 Audit Log Endpoints

#### POST /logs

Submit a dual log entry.

**Request:**
```json
{
  "timestamp": "2026-01-31T12:00:10Z",
  "party": "agent_appointment_scheduler",
  "role": "requester",
  "contract_id": "con_x7y8z9",
  "pin_id": "pin_7a3f2b",
  "action": "request",
  "target": "system_ehr_east",
  "scope": ["read:patient_demographics"],
  "status": "success",
  "records_affected": 1,
  "metadata": {
    "patient_uid": "gr_a1b2c3d4"
  }
}
```

**Response:**
```json
{
  "log_id": "log_9k8j7h",
  "accepted": true,
  "timestamp": "2026-01-31T12:00:10Z"
}
```

#### GET /logs?contract={id}

Query logs by contract.

**Response:**
```json
{
  "contract_id": "con_x7y8z9",
  "logs": [
    {
      "log_id": "log_9k8j7h",
      "timestamp": "2026-01-31T12:00:10Z",
      "party": "agent_appointment_scheduler",
      "role": "requester",
      "action": "request",
      "status": "success"
    },
    {
      "log_id": "log_6f5e4d",
      "timestamp": "2026-01-31T12:00:11Z",
      "party": "system_ehr_east",
      "role": "responder",
      "action": "fulfill",
      "status": "success",
      "records_returned": 1
    }
  ],
  "total_count": 2,
  "discrepancies": []
}
```

---

## 8. Success Metrics

### 8.1 Adoption Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|-------------------|
| Registered organizations | 100 | 500 |
| Active consent contracts | 500 | 5,000 |
| PINs issued per day | 10,000 | 100,000 |
| Monthly API calls | 1M | 10M |
| Paying customers | 10 | 50 |

### 8.2 Usage Metrics

| Metric | Target |
|--------|--------|
| Contract creation to activation (median) | < 24 hours |
| PIN validation success rate | > 99.5% |
| Dual log submission rate | > 99% (both parties log) |
| Log discrepancy rate | < 0.1% |

### 8.3 Performance Metrics

| Metric | Target |
|--------|--------|
| API availability | 99.9% monthly |
| PIN issuance latency P95 | < 100ms |
| PIN validation latency P95 | < 50ms |
| Identity resolution P95 (100 records) | < 500ms |

### 8.4 Business Metrics

| Metric | Target (12 months) |
|--------|-------------------|
| Annual Recurring Revenue (ARR) | $500K |
| Net Revenue Retention | > 120% |
| Customer Acquisition Cost (CAC) | < $5,000 |
| Logo churn rate | < 5% annually |

### 8.5 Compliance Metrics

| Metric | Target |
|--------|--------|
| SOC2 Type II certification | Achieved by Q3 2026 |
| HIPAA BAA availability | Available at launch |
| Audit request fulfillment time | < 24 hours |
| Security incident response time | < 1 hour |

---

## 9. Out of Scope for v1

The following capabilities are explicitly excluded from the v1 release:

### 9.1 Deferred Features

| Feature | Rationale | Target Release |
|---------|-----------|----------------|
| ML-powered matching | Deterministic algorithms sufficient for MVP; ML adds vec2vec risk | v2.0 |
| Real-time contract negotiation | Manual contract creation acceptable initially | v1.5 |
| Multi-party contracts (3+ parties) | Bilateral is core use case; multi-party adds complexity | v2.0 |
| Webhook notifications | Polling acceptable for v1 | v1.2 |
| GraphQL API | REST sufficient for v1 | v1.5 |
| Self-hosted deployment | Managed service only for v1 | v2.0 |
| Custom blocking strategies | Built-in strategies sufficient | v1.3 |
| Browser-based consent UI | API-first for v1 | v1.5 |

### 9.2 Integration Exclusions

| Integration | Rationale |
|-------------|-----------|
| Direct SSO integration (Okta, Azure AD) | API key auth sufficient for v1 |
| Native LangChain tool | SDK available; native tool for v1.2 |
| Native n8n node | REST API accessible from n8n |
| Terraform provider | Manual provisioning for v1 |

### 9.3 Compliance Exclusions

| Certification | Rationale |
|---------------|-----------|
| FedRAMP | Enterprise requirement; prioritize after SOC2 |
| ISO 27001 | Secondary to SOC2 for target market |
| PCI-DSS | Not handling payment data |

### 9.4 Analytics Exclusions

| Feature | Rationale |
|---------|-----------|
| Real-time dashboards | Log exports sufficient for v1 |
| Anomaly detection ML | Rule-based discrepancy detection for v1 |
| Predictive analytics | Not needed for core use case |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Agent PIN** | A short-lived (60s TTL) authorization token issued to an agent for a specific action |
| **Bilateral Consent** | Both requesting and responding parties must explicitly agree before data access |
| **Blocking Strategy** | Algorithm to reduce O(n^2) comparisons by grouping likely matches |
| **Consent Contract** | A signed agreement between two parties specifying authorized data access |
| **Dual Logging** | Both parties independently log every interaction |
| **Golden Record** | The merged, authoritative representation of an entity |
| **Identity Resolution** | Process of determining if records represent the same real-world entity |
| **vec2vec** | Attack technique to translate embeddings between models |

### B. Compliance Framework Mapping

| Requirement | HIPAA | GDPR | PHIPA | CCPA |
|-------------|-------|------|-------|------|
| Audit trails | 164.312(b) | Art. 30 | s.10 | 1798.185 |
| Access controls | 164.312(a) | Art. 25 | s.12 | - |
| Consent documentation | 164.508 | Art. 7 | s.18 | 1798.100 |
| Data minimization | 164.502(b) | Art. 5 | s.30 | - |
| Breach notification | 164.404 | Art. 33 | s.12.1 | 1798.82 |

### C. Technical Architecture

```
+------------------+     +------------------+     +------------------+
|   Agent A        |     |   id.c1v.ai      |     |   System B       |
|   (Requester)    |     |   (Protocol)     |     |   (Data Holder)  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         | 1. Request PIN         |                        |
         |----------------------->|                        |
         |                        |                        |
         | 2. Issue PIN (60s TTL) |                        |
         |<-----------------------|                        |
         |                        |                        |
         | 3. Present PIN + Request                        |
         |------------------------------------------------>|
         |                        |                        |
         |                        | 4. Validate PIN        |
         |                        |<-----------------------|
         |                        |                        |
         |                        | 5. Validation Result   |
         |                        |----------------------->|
         |                        |                        |
         | 6. Return Data                                  |
         |<------------------------------------------------|
         |                        |                        |
         | 7. Log (requester)     |                        |
         |----------------------->|                        |
         |                        | 8. Log (responder)     |
         |                        |<-----------------------|
         |                        |                        |
```

### D. Data Models

#### Contract Object

```typescript
interface ConsentContract {
  contract_id: string;          // Unique identifier
  status: 'pending_signature' | 'active' | 'revoked' | 'expired';

  party_a: string;              // Requesting party identifier
  party_b: string;              // Data-holding party identifier

  data_types: string[];         // e.g., ["patient_demographics"]
  actions: string[];            // e.g., ["read", "update"]
  purpose: string;              // e.g., "appointment_scheduling"

  retention_days: number;       // How long data can be held
  geographic_scope: string[];   // e.g., ["CA", "US"]
  compliance: string[];         // e.g., ["HIPAA", "PHIPA"]

  party_a_signature: string;    // Ed25519 signature
  party_b_signature: string;    // Ed25519 signature

  created_at: string;           // ISO 8601
  activated_at?: string;        // When both signed
  expires_at: string;           // Contract expiration
  revoked_at?: string;          // If revoked
  revoked_by?: string;          // Who revoked
}
```

#### Agent PIN Object

```typescript
interface AgentPIN {
  pin_id: string;               // Unique identifier
  contract_id: string;          // Governing contract
  agent_id: string;             // Authorized agent
  scope: string[];              // Authorized actions

  issued_at: string;            // ISO 8601
  expires_at: string;           // issued_at + 60 seconds

  signature: string;            // id.c1v.ai signature
}
```

#### Audit Log Entry

```typescript
interface AuditLogEntry {
  log_id: string;               // Unique identifier
  timestamp: string;            // ISO 8601

  party: string;                // Who submitted this log
  role: 'requester' | 'responder';

  contract_id: string;          // Related contract
  pin_id: string;               // Related PIN

  action: string;               // e.g., "request", "fulfill"
  target?: string;              // Target party (for requesters)
  source?: string;              // Source party (for responders)

  scope: string[];              // Requested/provided scope
  status: 'success' | 'failure' | 'partial';

  records_affected?: number;    // Data volume
  error_code?: string;          // If failed

  metadata: Record<string, any>; // Additional context
}
```

### E. References

1. Cornell NeurIPS 2025: "Harnessing the Universal Geometry of Embeddings" (vec2vec paper)
2. c1v-id PyPI package: https://pypi.org/project/c1v-id/ (v0.1.0)
3. HIPAA Security Rule: 45 CFR Part 164
4. GDPR: Regulation (EU) 2016/679
5. CCPA ADMT Rules: Effective January 2026
6. EU AI Act: Effective February 2026

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-31 | Product Manager Agent | Initial PRD |

---

*This PRD was generated by the Product Manager Agent for C1V.*
