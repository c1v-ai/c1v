"""
Audit service for immutable logging with per-agent hash chains.

Provides business logic for creating, querying, and verifying audit log entries
with cryptographic tamper detection via hash-chain integrity.
"""
import hashlib
import json
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from src.models.audit_log import AuditActionEnum, AuditLogModel, AuditStatusEnum
from src.schemas.audit import (
    AuditLog,
    AuditLogListResponse,
    AuditLogQuery,
    AuditLogResponse,
    AuditParty,
    CreateAuditLogRequest,
)


class AuditService:
    """
    Business logic for immutable audit logging with per-agent hash chains.

    Provides:
    - Dual-sided log submission (both parties log independently)
    - Per-agent hash-chain integrity (tamper detection)
    - Filtered querying with pagination
    - Chain verification for compliance audits
    """

    GENESIS_HASH = "0" * 64  # 64 zeros for first entry in chain

    def __init__(self, db: Session):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db

    def create_log(
        self,
        agent_id: str,
        request: CreateAuditLogRequest,
    ) -> AuditLogResponse:
        """
        Create an immutable audit log entry.

        The entry is hash-chained to the agent's previous entry.
        Both parties to a transaction call this independently (dual-sided logging).

        Args:
            agent_id: Authenticated agent creating the log
            request: Log entry details

        Returns:
            Created audit log entry with computed hashes
        """
        # 1. Get previous hash with lock (prevents race conditions)
        prev_hash = self._get_latest_hash_locked(agent_id)

        # 2. Create log entry
        log = AuditLogModel(
            log_id=uuid4(),
            timestamp=datetime.now(timezone.utc),
            contract_id=request.contract_id,
            pin_id=request.pin_id,
            agent_id=agent_id,
            action=AuditActionEnum(request.action.value),
            status=AuditStatusEnum(request.status.value),
            target_system=request.counterparty.agent_id,
            scope={"data_types": request.data_types},
            log_metadata=request.metadata,
            source=agent_id,
            request_id=str(request.transaction_id),
            prev_hash=prev_hash,
            entry_hash="",  # Placeholder, computed next
        )

        # 3. Compute entry hash
        log.entry_hash = self._compute_entry_hash(log)

        # 4. Persist (append-only enforced by database trigger)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return AuditLogResponse(log=self._to_schema(log))

    def get_logs(self, query: AuditLogQuery) -> AuditLogListResponse:
        """
        Query audit logs with filters and pagination.

        Supports filtering by:
        - contract_id: Logs for a specific contract
        - agent_id: Logs from a specific agent
        - action: Filter by action type
        - status: Filter by outcome status
        - start_time/end_time: Time range

        Args:
            query: Query parameters with filters and pagination

        Returns:
            Paginated list of audit logs with total count
        """
        base_query = self.db.query(AuditLogModel)

        # Apply filters
        if query.contract_id:
            base_query = base_query.filter(
                AuditLogModel.contract_id == query.contract_id
            )
        if query.agent_id:
            base_query = base_query.filter(AuditLogModel.agent_id == query.agent_id)
        if query.action:
            base_query = base_query.filter(
                AuditLogModel.action == AuditActionEnum(query.action.value)
            )
        if query.status:
            base_query = base_query.filter(
                AuditLogModel.status == AuditStatusEnum(query.status.value)
            )
        if query.start_time:
            base_query = base_query.filter(AuditLogModel.timestamp >= query.start_time)
        if query.end_time:
            base_query = base_query.filter(AuditLogModel.timestamp <= query.end_time)

        # Count total before pagination
        total = base_query.count()

        # Apply ordering and pagination
        logs = (
            base_query.order_by(AuditLogModel.timestamp.desc())
            .offset(query.offset)
            .limit(query.limit)
            .all()
        )

        return AuditLogListResponse(
            logs=[self._to_schema(log) for log in logs],
            total=total,
            limit=query.limit,
            offset=query.offset,
        )

    def verify_chain(
        self,
        agent_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> tuple[bool, Optional[str]]:
        """
        Verify integrity of an agent's hash chain.

        Checks that:
        1. Each entry's prev_hash matches the previous entry's entry_hash
        2. Each entry's entry_hash recomputes correctly from content

        Args:
            agent_id: Agent whose chain to verify
            start_time: Optional start of time range
            end_time: Optional end of time range

        Returns:
            (valid, error_message)
            - valid: True if chain is intact
            - error_message: Description of failure (None if valid)
        """
        query = self.db.query(AuditLogModel).filter(
            AuditLogModel.agent_id == agent_id
        ).order_by(AuditLogModel.timestamp.asc())

        if start_time:
            query = query.filter(AuditLogModel.timestamp >= start_time)
        if end_time:
            query = query.filter(AuditLogModel.timestamp <= end_time)

        logs = query.all()

        if not logs:
            return True, None  # Empty chain is valid

        # For first entry, check if it's genesis or continues from earlier
        expected_prev = (
            self.GENESIS_HASH
            if logs[0].prev_hash == self.GENESIS_HASH
            else logs[0].prev_hash
        )

        for log in logs:
            # Verify prev_hash matches expected
            if log.prev_hash != expected_prev:
                return (
                    False,
                    f"Chain broken at {log.log_id}: prev_hash mismatch "
                    f"(expected {expected_prev[:16]}..., got {log.prev_hash[:16] if log.prev_hash else 'None'}...)",
                )

            # Verify entry_hash is correct
            computed = self._compute_entry_hash(log)
            if log.entry_hash != computed:
                return (
                    False,
                    f"Entry tampered at {log.log_id}: hash mismatch "
                    f"(stored {log.entry_hash[:16]}..., computed {computed[:16]}...)",
                )

            expected_prev = log.entry_hash

        return True, None

    # -------------------------------------------------------------------------
    # Private methods
    # -------------------------------------------------------------------------

    def _get_latest_hash_locked(self, agent_id: str) -> str:
        """
        Get latest entry_hash for agent with row lock.

        Uses SELECT FOR UPDATE to prevent race conditions when
        multiple requests try to append to the same agent's chain.

        Args:
            agent_id: Agent whose latest hash to retrieve

        Returns:
            Latest entry_hash or GENESIS_HASH if no entries exist
        """
        latest = (
            self.db.query(AuditLogModel)
            .filter(AuditLogModel.agent_id == agent_id)
            .order_by(AuditLogModel.timestamp.desc())
            .with_for_update()
            .first()
        )

        if latest is None:
            return self.GENESIS_HASH
        return latest.entry_hash

    def _compute_entry_hash(self, log: AuditLogModel) -> str:
        """
        Compute SHA256 hash of log entry.

        Uses canonical JSON for deterministic hashing (sorted keys, minimal separators).
        Includes only immutable fields in hash computation.
        Follows pattern from CryptoService.compute_content_hash().

        Args:
            log: Audit log model instance

        Returns:
            64-character hexadecimal SHA256 hash string
        """
        content = {
            "log_id": str(log.log_id),
            "timestamp": log.timestamp.isoformat(),
            "contract_id": str(log.contract_id) if log.contract_id else None,
            "pin_id": str(log.pin_id) if log.pin_id else None,
            "agent_id": log.agent_id,
            "action": log.action.value if log.action else None,
            "status": log.status.value if log.status else None,
            "target_system": log.target_system,
            "scope": log.scope,
            "metadata": log.log_metadata,
            "source": log.source,
            "request_id": log.request_id,
            "prev_hash": log.prev_hash,
        }

        # Canonical JSON: sorted keys, minimal separators
        canonical = json.dumps(content, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def _to_schema(self, log: AuditLogModel) -> AuditLog:
        """
        Convert ORM model to Pydantic schema.

        Args:
            log: SQLAlchemy model instance

        Returns:
            Pydantic AuditLog schema
        """
        return AuditLog(
            id=log.log_id,
            transaction_id=UUID(log.request_id) if log.request_id else uuid4(),
            contract_id=log.contract_id,
            pin_id=log.pin_id,
            reporter=AuditParty(agent_id=log.source, role="reporter"),
            counterparty=AuditParty(
                agent_id=log.target_system or "unknown", role="counterparty"
            ),
            action=log.action,
            status=log.status,
            data_types=log.scope.get("data_types", []) if log.scope else [],
            metadata=log.log_metadata or {},
            prev_hash=log.prev_hash,
            entry_hash=log.entry_hash,
            created_at=log.timestamp,
        )
