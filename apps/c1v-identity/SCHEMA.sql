-- =============================================================================
-- C1V Machine-to-Machine (M2M) Consent Protocol - PostgreSQL Schema
-- =============================================================================
-- Version: 1.0.0
-- Description: Database schema for id.c1v.ai consent management platform
--
-- This schema supports:
--   - Bilateral consent contracts between systems/agents
--   - Short-lived authorization tokens (Agent PINs)
--   - Immutable audit logging
--   - Golden record identity storage (from c1v-id)
--   - API key authentication
--
-- Design Principles:
--   1. All tables have created_at/updated_at timestamps
--   2. Audit logs are append-only (enforced via trigger)
--   3. UUIDs for all primary keys (distributed-safe)
--   4. JSONB for flexible schema fields
--   5. Proper indexing for common query patterns
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

-- Contract lifecycle status
-- proposed: Initial state, awaiting signatures
-- active: Both parties signed, contract is enforceable
-- revoked: Manually terminated by either party
-- expired: Past expires_at timestamp
CREATE TYPE contract_status AS ENUM (
    'proposed',
    'active',
    'revoked',
    'expired'
);

-- Audit log action types
-- request: Outbound request initiated
-- response: Response received from target
-- error: Error occurred during operation
-- validation: Consent validation check
-- revocation: Contract or PIN revoked
CREATE TYPE audit_action AS ENUM (
    'request',
    'response',
    'error',
    'validation',
    'revocation'
);

-- Audit log outcome status
-- sent: Request successfully sent
-- received: Response successfully received
-- denied: Access denied (consent not valid)
-- error: Operation failed with error
-- expired: Token or contract was expired
CREATE TYPE audit_status AS ENUM (
    'sent',
    'received',
    'denied',
    'error',
    'expired'
);

-- -----------------------------------------------------------------------------
-- TABLE: golden_records
-- -----------------------------------------------------------------------------
-- Merged identity records from c1v-id identity resolution system.
-- Represents the "single source of truth" for an individual across sources.
--
-- Query patterns:
--   - Lookup by uid (primary)
--   - Search by email/phone for identity resolution
--   - Filter by confidence threshold
-- -----------------------------------------------------------------------------
CREATE TABLE golden_records (
    -- Primary identifier for the merged identity
    uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Core identity fields (nullable - not all records have all fields)
    email TEXT,
    phone TEXT,
    name TEXT,

    -- Identity resolution metadata
    source_count INTEGER NOT NULL DEFAULT 1
        CHECK (source_count >= 1),
    confidence DECIMAL(5,4) NOT NULL DEFAULT 0.0000
        CHECK (confidence >= 0 AND confidence <= 1),

    -- Flexible metadata storage for source-specific data
    -- Example: {"sources": ["crm", "billing"], "merge_history": [...]}
    metadata JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE golden_records IS
    'Merged identity records from c1v-id resolution. Single source of truth for individuals.';
COMMENT ON COLUMN golden_records.uid IS
    'Universal identifier for this golden record';
COMMENT ON COLUMN golden_records.source_count IS
    'Number of source records merged into this golden record';
COMMENT ON COLUMN golden_records.confidence IS
    'Confidence score (0-1) of identity resolution accuracy';
COMMENT ON COLUMN golden_records.metadata IS
    'Flexible JSON storage for merge history, source details, etc.';

-- -----------------------------------------------------------------------------
-- TABLE: api_keys
-- -----------------------------------------------------------------------------
-- API keys for system authentication. Keys are hashed using bcrypt.
-- Supports scoped access control and rate limiting.
--
-- Query patterns:
--   - Lookup by key_hash (authentication)
--   - Filter by owner_id for management
--   - Check expiration status
-- -----------------------------------------------------------------------------
CREATE TABLE api_keys (
    -- Primary identifier
    key_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication (bcrypt hashed, never store plaintext)
    key_hash TEXT NOT NULL,

    -- Key metadata
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,  -- External system/organization identifier

    -- Access control
    -- Example: ["contracts:read", "contracts:write", "pins:issue"]
    scopes JSONB NOT NULL DEFAULT '[]',

    -- Rate limiting (requests per minute, 0 = unlimited)
    rate_limit INTEGER NOT NULL DEFAULT 100
        CHECK (rate_limit >= 0),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,  -- NULL = never expires
    last_used_at TIMESTAMPTZ,

    -- Soft delete support
    revoked_at TIMESTAMPTZ,

    -- Ensure unique key hashes
    CONSTRAINT api_keys_key_hash_unique UNIQUE (key_hash)
);

COMMENT ON TABLE api_keys IS
    'API keys for system authentication with scoped access control';
COMMENT ON COLUMN api_keys.key_hash IS
    'Bcrypt hash of the API key (never store plaintext)';
COMMENT ON COLUMN api_keys.owner_id IS
    'External identifier for the system/organization owning this key';
COMMENT ON COLUMN api_keys.scopes IS
    'JSON array of permission scopes granted to this key';
COMMENT ON COLUMN api_keys.rate_limit IS
    'Max requests per minute (0 = unlimited)';

-- -----------------------------------------------------------------------------
-- TABLE: consent_contracts
-- -----------------------------------------------------------------------------
-- Bilateral consent agreements between two parties (systems/agents).
-- Defines what data can be shared, for what purpose, under what constraints.
--
-- Key concepts:
--   - party_a/party_b: System identifiers (URIs or registered names)
--   - Requires both signatures for activation
--   - Geographic and temporal constraints
--
-- Query patterns:
--   - Lookup active contracts between two parties
--   - Find all contracts for a party
--   - Filter by status, expiration
-- -----------------------------------------------------------------------------
CREATE TABLE consent_contracts (
    -- Primary identifier
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contracting parties (system/agent identifiers)
    -- Example: "system:acme-healthcare" or "agent:appointment-scheduler"
    party_a TEXT NOT NULL,
    party_b TEXT NOT NULL,

    -- What data types are covered
    -- Example: ["patient_record", "appointment", "billing"]
    data_types JSONB NOT NULL DEFAULT '[]',

    -- What actions are permitted
    -- Example: ["read", "update", "delete"]
    actions JSONB NOT NULL DEFAULT '[]',

    -- Business purpose for consent (required for GDPR compliance)
    purpose TEXT NOT NULL,

    -- Data retention constraint (days, NULL = indefinite)
    retention_days INTEGER CHECK (retention_days IS NULL OR retention_days > 0),

    -- Geographic constraints (ISO 3166 codes)
    -- Example: ["US", "CA", "EU"]
    geographic_scope JSONB NOT NULL DEFAULT '[]',

    -- Cryptographic signatures (C1V proof format)
    -- NULL until signed by respective party
    party_a_signature TEXT,
    party_b_signature TEXT,

    -- Contract lifecycle
    status contract_status NOT NULL DEFAULT 'proposed',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at TIMESTAMPTZ,      -- When both signatures received
    expires_at TIMESTAMPTZ,     -- NULL = no expiration
    revoked_at TIMESTAMPTZ,     -- Set when status -> revoked
    revoked_by TEXT,            -- Which party initiated revocation
    revocation_reason TEXT,     -- Optional explanation

    -- Business rules
    CONSTRAINT consent_contracts_parties_different
        CHECK (party_a != party_b),
    CONSTRAINT consent_contracts_revocation_consistency
        CHECK (
            (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL)
            OR
            (status != 'revoked' AND revoked_at IS NULL)
        ),
    CONSTRAINT consent_contracts_signature_status
        CHECK (
            (status = 'active' AND party_a_signature IS NOT NULL AND party_b_signature IS NOT NULL)
            OR
            (status != 'active')
        )
);

COMMENT ON TABLE consent_contracts IS
    'Bilateral consent agreements between systems/agents defining data sharing terms';
COMMENT ON COLUMN consent_contracts.party_a IS
    'First party system identifier (URI or registered name)';
COMMENT ON COLUMN consent_contracts.party_b IS
    'Second party system identifier (URI or registered name)';
COMMENT ON COLUMN consent_contracts.data_types IS
    'JSON array of data types covered by this contract';
COMMENT ON COLUMN consent_contracts.actions IS
    'JSON array of permitted actions (read, update, delete, etc.)';
COMMENT ON COLUMN consent_contracts.purpose IS
    'Business purpose for data sharing (GDPR requirement)';
COMMENT ON COLUMN consent_contracts.retention_days IS
    'Maximum data retention in days (NULL = indefinite)';
COMMENT ON COLUMN consent_contracts.geographic_scope IS
    'JSON array of ISO 3166 country/region codes where consent applies';
COMMENT ON COLUMN consent_contracts.party_a_signature IS
    'C1V cryptographic signature from party A';
COMMENT ON COLUMN consent_contracts.party_b_signature IS
    'C1V cryptographic signature from party B';

-- -----------------------------------------------------------------------------
-- TABLE: agent_pins
-- -----------------------------------------------------------------------------
-- Short-lived authorization tokens for agent operations.
-- Issued against an active consent contract with narrowed scope.
-- Default TTL: 60 seconds (configurable at issuance).
--
-- Security properties:
--   - Single-use by default (used_at tracking)
--   - Can be revoked before expiration
--   - Cryptographically signed by C1V
--
-- Query patterns:
--   - Validate PIN (by pin_id, check expiration/revocation)
--   - Find PINs for a contract
--   - Find PINs issued to an agent
-- -----------------------------------------------------------------------------
CREATE TABLE agent_pins (
    -- Primary identifier
    pin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Parent contract (must be active)
    contract_id UUID NOT NULL,

    -- Agent receiving authorization
    agent_id TEXT NOT NULL,

    -- Narrowed scope (must be subset of contract scope)
    -- Example: {"actions": ["read"], "data_types": ["appointment"]}
    scope JSONB NOT NULL DEFAULT '{}',

    -- C1V cryptographic signature proving PIN validity
    signature TEXT NOT NULL,

    -- Timestamps (default 60 second TTL)
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 seconds'),

    -- Usage tracking
    used_at TIMESTAMPTZ,  -- NULL = unused

    -- Revocation
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Foreign key to contract
    CONSTRAINT agent_pins_contract_fk
        FOREIGN KEY (contract_id)
        REFERENCES consent_contracts(contract_id)
        ON DELETE RESTRICT,  -- Don't allow contract deletion with active PINs

    -- Business rules
    CONSTRAINT agent_pins_expiry_after_issue
        CHECK (expires_at > issued_at),
    CONSTRAINT agent_pins_revocation_consistency
        CHECK (
            (revoked = TRUE AND revoked_at IS NOT NULL)
            OR
            (revoked = FALSE AND revoked_at IS NULL)
        ),
    CONSTRAINT agent_pins_usage_timing
        CHECK (used_at IS NULL OR used_at >= issued_at)
);

COMMENT ON TABLE agent_pins IS
    'Short-lived authorization tokens for agent operations (default 60s TTL)';
COMMENT ON COLUMN agent_pins.pin_id IS
    'Unique identifier for this authorization token';
COMMENT ON COLUMN agent_pins.contract_id IS
    'Reference to the consent contract this PIN is issued under';
COMMENT ON COLUMN agent_pins.agent_id IS
    'Identifier of the agent receiving authorization';
COMMENT ON COLUMN agent_pins.scope IS
    'Narrowed permissions (must be subset of contract permissions)';
COMMENT ON COLUMN agent_pins.signature IS
    'C1V cryptographic signature proving PIN validity';
COMMENT ON COLUMN agent_pins.used_at IS
    'Timestamp when PIN was first used (NULL if unused)';
COMMENT ON COLUMN agent_pins.revoked IS
    'Whether this PIN has been explicitly revoked';

-- -----------------------------------------------------------------------------
-- TABLE: audit_logs
-- -----------------------------------------------------------------------------
-- Immutable audit trail for all consent operations.
-- APPEND-ONLY: Updates and deletes are blocked by trigger.
--
-- Captures:
--   - All consent validation requests/responses
--   - Contract lifecycle events
--   - PIN issuance and usage
--   - Errors and denied access attempts
--
-- Query patterns:
--   - Timeline for a contract
--   - All activity for an agent
--   - Filter by action type, status
--   - Compliance reporting
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    -- Primary identifier
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event timestamp (use server time, not client time)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Related entities (nullable - not all events have all references)
    contract_id UUID,
    pin_id UUID,
    agent_id TEXT,

    -- Event classification
    action audit_action NOT NULL,
    status audit_status NOT NULL,

    -- Target of the operation
    target_system TEXT,

    -- What was being accessed/modified
    -- Example: {"data_types": ["appointment"], "record_id": "..."}
    scope JSONB NOT NULL DEFAULT '{}',

    -- Additional event metadata
    -- Example: {"error_code": "EXPIRED", "request_id": "...", "duration_ms": 45}
    metadata JSONB NOT NULL DEFAULT '{}',

    -- Which party created this log entry
    source TEXT NOT NULL,

    -- Request tracing
    request_id TEXT,  -- For correlating request/response pairs

    -- IP and geographic info (for compliance)
    source_ip INET,
    geo_location TEXT,  -- ISO 3166 code

    -- Hash-chain fields for tamper detection
    -- Each agent maintains an independent hash chain
    prev_hash TEXT,  -- NULL only for genesis entry in agent's chain
    entry_hash TEXT NOT NULL,  -- SHA256 of canonical content

    -- Foreign keys (soft - don't block inserts if references missing)
    CONSTRAINT audit_logs_contract_fk
        FOREIGN KEY (contract_id)
        REFERENCES consent_contracts(contract_id)
        ON DELETE SET NULL,
    CONSTRAINT audit_logs_pin_fk
        FOREIGN KEY (pin_id)
        REFERENCES agent_pins(pin_id)
        ON DELETE SET NULL
);

COMMENT ON TABLE audit_logs IS
    'Immutable audit trail for consent operations (append-only, no updates/deletes)';
COMMENT ON COLUMN audit_logs.timestamp IS
    'Server timestamp when event occurred';
COMMENT ON COLUMN audit_logs.action IS
    'Type of action: request, response, error, validation, revocation';
COMMENT ON COLUMN audit_logs.status IS
    'Outcome: sent, received, denied, error, expired';
COMMENT ON COLUMN audit_logs.target_system IS
    'System that was the target of this operation';
COMMENT ON COLUMN audit_logs.scope IS
    'What data/actions were involved in this operation';
COMMENT ON COLUMN audit_logs.metadata IS
    'Flexible JSON storage for error details, timings, etc.';
COMMENT ON COLUMN audit_logs.source IS
    'Which party/system created this log entry';
COMMENT ON COLUMN audit_logs.request_id IS
    'Correlation ID for linking request/response pairs';
COMMENT ON COLUMN audit_logs.prev_hash IS
    'SHA256 hash of previous entry in this agent''s chain (NULL for genesis)';
COMMENT ON COLUMN audit_logs.entry_hash IS
    'SHA256 hash of this entry''s canonical content for tamper detection';

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

-- golden_records indexes
CREATE INDEX idx_golden_records_email ON golden_records(email)
    WHERE email IS NOT NULL;
CREATE INDEX idx_golden_records_phone ON golden_records(phone)
    WHERE phone IS NOT NULL;
CREATE INDEX idx_golden_records_confidence ON golden_records(confidence DESC);
CREATE INDEX idx_golden_records_updated_at ON golden_records(updated_at DESC);

-- api_keys indexes
CREATE INDEX idx_api_keys_owner_id ON api_keys(owner_id);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at)
    WHERE expires_at IS NOT NULL AND revoked_at IS NULL;
CREATE INDEX idx_api_keys_active ON api_keys(key_id)
    WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());

-- consent_contracts indexes
CREATE INDEX idx_consent_contracts_party_a ON consent_contracts(party_a);
CREATE INDEX idx_consent_contracts_party_b ON consent_contracts(party_b);
CREATE INDEX idx_consent_contracts_status ON consent_contracts(status);
CREATE INDEX idx_consent_contracts_expires_at ON consent_contracts(expires_at)
    WHERE expires_at IS NOT NULL;
-- Composite index for finding active contracts between parties
CREATE INDEX idx_consent_contracts_parties_active ON consent_contracts(party_a, party_b, status)
    WHERE status = 'active';
-- GIN index for JSONB data_types searching
CREATE INDEX idx_consent_contracts_data_types ON consent_contracts USING GIN (data_types);
CREATE INDEX idx_consent_contracts_actions ON consent_contracts USING GIN (actions);

-- agent_pins indexes
CREATE INDEX idx_agent_pins_contract_id ON agent_pins(contract_id);
CREATE INDEX idx_agent_pins_agent_id ON agent_pins(agent_id);
CREATE INDEX idx_agent_pins_expires_at ON agent_pins(expires_at);
-- Composite index for PIN validation (most common query)
CREATE INDEX idx_agent_pins_valid ON agent_pins(pin_id, expires_at, revoked)
    WHERE revoked = FALSE;
-- Index for finding unused PINs (cleanup)
CREATE INDEX idx_agent_pins_unused ON agent_pins(issued_at)
    WHERE used_at IS NULL AND revoked = FALSE;

-- audit_logs indexes (optimized for read-heavy compliance queries)
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_contract_id ON audit_logs(contract_id)
    WHERE contract_id IS NOT NULL;
CREATE INDEX idx_audit_logs_pin_id ON audit_logs(pin_id)
    WHERE pin_id IS NOT NULL;
CREATE INDEX idx_audit_logs_agent_id ON audit_logs(agent_id)
    WHERE agent_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id)
    WHERE request_id IS NOT NULL;
-- Composite index for compliance queries (by source and time range)
CREATE INDEX idx_audit_logs_source_timestamp ON audit_logs(source, timestamp DESC);
-- Index for chain verification (find latest entry for agent)
CREATE INDEX idx_audit_logs_agent_prev_hash ON audit_logs(agent_id, prev_hash)
    WHERE agent_id IS NOT NULL;
-- Index for entry hash lookup
CREATE INDEX idx_audit_logs_entry_hash ON audit_logs(entry_hash);

-- -----------------------------------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trg_golden_records_updated_at
    BEFORE UPDATE ON golden_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_consent_contracts_updated_at
    BEFORE UPDATE ON consent_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to enforce append-only on audit_logs
CREATE OR REPLACE FUNCTION audit_logs_immutable()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'audit_logs table is append-only: UPDATE operations are not permitted';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'audit_logs table is append-only: DELETE operations are not permitted';
    ELSIF TG_OP = 'TRUNCATE' THEN
        RAISE EXCEPTION 'audit_logs table is append-only: TRUNCATE operations are not permitted';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Block UPDATE and DELETE on audit_logs
CREATE TRIGGER trg_audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION audit_logs_immutable();

CREATE TRIGGER trg_audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION audit_logs_immutable();

-- Note: TRUNCATE trigger requires statement-level trigger
CREATE TRIGGER trg_audit_logs_no_truncate
    BEFORE TRUNCATE ON audit_logs
    FOR EACH STATEMENT
    EXECUTE FUNCTION audit_logs_immutable();

-- Function to validate PIN issuance against contract
CREATE OR REPLACE FUNCTION validate_pin_contract()
RETURNS TRIGGER AS $$
DECLARE
    contract_status contract_status;
    contract_expires_at TIMESTAMPTZ;
BEGIN
    -- Get contract status
    SELECT cc.status, cc.expires_at
    INTO contract_status, contract_expires_at
    FROM consent_contracts cc
    WHERE cc.contract_id = NEW.contract_id;

    -- Check contract exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cannot issue PIN: contract % does not exist', NEW.contract_id;
    END IF;

    -- Check contract is active
    IF contract_status != 'active' THEN
        RAISE EXCEPTION 'Cannot issue PIN: contract % is not active (status: %)',
            NEW.contract_id, contract_status;
    END IF;

    -- Check contract not expired
    IF contract_expires_at IS NOT NULL AND contract_expires_at < NOW() THEN
        RAISE EXCEPTION 'Cannot issue PIN: contract % has expired', NEW.contract_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validate contract status before PIN creation
CREATE TRIGGER trg_agent_pins_validate_contract
    BEFORE INSERT ON agent_pins
    FOR EACH ROW
    EXECUTE FUNCTION validate_pin_contract();

-- -----------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Check if a PIN is currently valid
CREATE OR REPLACE FUNCTION is_pin_valid(p_pin_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    pin_record RECORD;
    contract_record RECORD;
BEGIN
    -- Get PIN
    SELECT * INTO pin_record FROM agent_pins WHERE pin_id = p_pin_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Check PIN not revoked
    IF pin_record.revoked THEN
        RETURN FALSE;
    END IF;

    -- Check PIN not expired
    IF pin_record.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;

    -- Get and check contract
    SELECT * INTO contract_record
    FROM consent_contracts
    WHERE contract_id = pin_record.contract_id;

    IF NOT FOUND OR contract_record.status != 'active' THEN
        RETURN FALSE;
    END IF;

    -- Check contract not expired
    IF contract_record.expires_at IS NOT NULL AND contract_record.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_pin_valid IS
    'Check if a PIN is currently valid (not expired, not revoked, contract active)';

-- Find active contracts between two parties (order-independent)
CREATE OR REPLACE FUNCTION find_active_contracts(p_party_1 TEXT, p_party_2 TEXT)
RETURNS SETOF consent_contracts AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM consent_contracts
    WHERE status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (
          (party_a = p_party_1 AND party_b = p_party_2)
          OR
          (party_a = p_party_2 AND party_b = p_party_1)
      );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_active_contracts IS
    'Find all active contracts between two parties (order-independent lookup)';

-- Mark expired contracts
CREATE OR REPLACE FUNCTION expire_contracts()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE consent_contracts
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_contracts IS
    'Mark all contracts past their expires_at as expired. Returns count of affected rows.';

-- -----------------------------------------------------------------------------
-- VIEWS
-- -----------------------------------------------------------------------------

-- Active contracts summary
CREATE OR REPLACE VIEW active_contracts_summary AS
SELECT
    contract_id,
    party_a,
    party_b,
    purpose,
    data_types,
    actions,
    signed_at,
    expires_at,
    CASE
        WHEN expires_at IS NULL THEN NULL
        ELSE expires_at - NOW()
    END AS time_remaining
FROM consent_contracts
WHERE status = 'active'
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY signed_at DESC;

COMMENT ON VIEW active_contracts_summary IS
    'Summary of all currently active consent contracts';

-- Recent audit activity
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT
    log_id,
    timestamp,
    action,
    status,
    agent_id,
    contract_id,
    target_system,
    source
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 1000;

COMMENT ON VIEW recent_audit_activity IS
    'Most recent 1000 audit log entries';

-- PIN usage statistics
CREATE OR REPLACE VIEW pin_statistics AS
SELECT
    DATE_TRUNC('hour', issued_at) AS hour,
    COUNT(*) AS pins_issued,
    COUNT(used_at) AS pins_used,
    COUNT(*) FILTER (WHERE revoked) AS pins_revoked,
    COUNT(*) FILTER (WHERE expires_at < NOW() AND used_at IS NULL AND NOT revoked) AS pins_expired_unused,
    ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(used_at, expires_at) - issued_at)))::NUMERIC, 2) AS avg_lifetime_seconds
FROM agent_pins
WHERE issued_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', issued_at)
ORDER BY hour DESC;

COMMENT ON VIEW pin_statistics IS
    'Hourly PIN usage statistics for the last 24 hours';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
