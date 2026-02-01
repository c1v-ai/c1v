"""
Identity resolution service layer.

Wraps the src/identity module with database operations and business logic.
"""
import uuid
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.identity.uid import norm_email, norm_phone, best_uid
from src.identity.block_and_match import score_pair
from src.schemas.identity import (
    IdentityData,
    ResolveResponse,
    MatchResponse,
    GoldenRecord,
)
from src.models.golden_record import GoldenRecordModel


# Define a namespace UUID for deterministic UID generation
# Using a fixed namespace ensures same inputs = same UUID across runs
C1V_IDENTITY_NAMESPACE = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")


class IdentityService:
    """
    Business logic layer for identity resolution.

    Wraps the src/identity module with database operations and
    provides resolve, match, and golden record retrieval.
    """

    # Match scoring weights (from research)
    MATCH_WEIGHTS = {
        "email_exact": 0.9,
        "phone_exact": 0.7,
        "name_address": 0.5,
        "postal_match": 0.2,
    }

    # Thresholds
    AUTO_MERGE_THRESHOLD = 0.90
    MATCH_THRESHOLD = 0.70

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db

    def resolve(
        self, data: IdentityData, create_if_missing: bool = True
    ) -> ResolveResponse:
        """
        Resolve identity from partial data.

        Args:
            data: Partial identity data (email, phone, name, metadata)
            create_if_missing: If True, create new golden record when no match found

        Returns:
            ResolveResponse with golden_record, is_new flag, and match_confidence

        Raises:
            HTTPException: 400 if no identity fields provided
            HTTPException: 404 if no match found and create_if_missing is False
        """
        # 1. Normalize input data
        normalized_email = norm_email(data.email) if data.email else None
        normalized_phone = norm_phone(data.phone) if data.phone else None

        # 2. Validate at least one identity field present
        if not any([normalized_email, normalized_phone, data.name]):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "MISSING_IDENTITY_DATA",
                        "message": "At least one of email, phone, or name required",
                    }
                },
            )

        # 3. Search existing golden records (by normalized email first, then phone)
        existing: Optional[GoldenRecordModel] = None
        if normalized_email:
            existing = (
                self.db.query(GoldenRecordModel)
                .filter(GoldenRecordModel.email == normalized_email)
                .first()
            )
        if not existing and normalized_phone:
            existing = (
                self.db.query(GoldenRecordModel)
                .filter(GoldenRecordModel.phone == normalized_phone)
                .first()
            )

        # 4. Return existing or create new
        if existing:
            return ResolveResponse(
                golden_record=self._model_to_schema(existing),
                is_new=False,
                match_confidence=existing.confidence,
            )
        elif create_if_missing:
            new_record = self._create_golden_record(
                data, normalized_email, normalized_phone
            )
            return ResolveResponse(
                golden_record=self._model_to_schema(new_record),
                is_new=True,
                match_confidence=1.0,
            )
        else:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": {
                        "code": "RECORD_NOT_FOUND",
                        "message": "No matching record found",
                    }
                },
            )

    def match(self, record1: dict, record2: dict) -> MatchResponse:
        """
        Compare two records and return similarity score.

        Args:
            record1: First record dict with identity fields
            record2: Second record dict with identity fields

        Returns:
            MatchResponse with match boolean, confidence score, and reason
        """
        score = score_pair(record1, record2, self.MATCH_WEIGHTS)
        return MatchResponse(
            match=score >= self.MATCH_THRESHOLD,
            confidence=score,
            reason=self._get_match_reason(score),
        )

    def get_golden_record(self, uid: str) -> GoldenRecord:
        """
        Retrieve a golden record by UID.

        Args:
            uid: UUID string of the golden record

        Returns:
            GoldenRecord Pydantic model

        Raises:
            HTTPException: 404 if record not found
        """
        record = (
            self.db.query(GoldenRecordModel)
            .filter(GoldenRecordModel.uid == uid)
            .first()
        )
        if not record:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": {
                        "code": "RECORD_NOT_FOUND",
                        "message": f"Golden record {uid} not found",
                    }
                },
            )
        return self._model_to_schema(record)

    def _create_golden_record(
        self,
        data: IdentityData,
        normalized_email: Optional[str],
        normalized_phone: Optional[str],
    ) -> GoldenRecordModel:
        """
        Create a new golden record.

        Uses uuid5 with C1V namespace for deterministic UID generation
        based on identity data.
        """
        # Parse first/last from name for UID generation
        first: Optional[str] = None
        last: Optional[str] = None
        postal: Optional[str] = None

        if data.name:
            parts = data.name.strip().split()
            first = parts[0] if parts else None
            last = parts[-1] if len(parts) > 1 else None

        if data.metadata:
            postal = data.metadata.get("postal")

        # Generate deterministic UID using uuid5 (SHA-1 based, proper UUID format)
        uid_hash = best_uid(normalized_email, normalized_phone, first, last, postal)
        if uid_hash:
            # Use uuid5 with our namespace for deterministic UUID from hash
            record_uid = uuid.uuid5(C1V_IDENTITY_NAMESPACE, uid_hash)
        else:
            # Fallback to random UUID if no identity data available
            record_uid = uuid.uuid4()

        record = GoldenRecordModel(
            uid=record_uid,
            email=normalized_email,
            phone=normalized_phone,
            name=data.name,
            source_count=1,
            confidence=1.0,
            record_metadata=data.metadata or {},
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def _model_to_schema(self, model: GoldenRecordModel) -> GoldenRecord:
        """Convert SQLAlchemy model to Pydantic schema."""
        return GoldenRecord(
            uid=model.uid,
            email=model.email,
            phone=model.phone,
            name=model.name,
            source_count=model.source_count,
            confidence=float(model.confidence),
            metadata=model.record_metadata or {},
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _get_match_reason(self, score: float) -> str:
        """Get human-readable match reason based on score."""
        if score >= self.AUTO_MERGE_THRESHOLD:
            return "High confidence match - auto merge recommended"
        elif score >= self.MATCH_THRESHOLD:
            return "Moderate confidence match - review recommended"
        else:
            return "Low confidence - unlikely match"
