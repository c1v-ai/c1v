"""
SQLAlchemy model for golden_records table.

Matches SCHEMA.sql definition for merged identity records from c1v-id resolution.
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID

from src.core.database import Base


class GoldenRecordModel(Base):
    """
    Merged identity records from c1v-id identity resolution system.
    Represents the 'single source of truth' for an individual across sources.
    """

    __tablename__ = "golden_records"

    # Primary identifier for the merged identity
    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Core identity fields (nullable - not all records have all fields)
    email = Column(Text, nullable=True, index=True)
    phone = Column(Text, nullable=True, index=True)
    name = Column(Text, nullable=True)

    # Identity resolution metadata
    source_count = Column(Integer, nullable=False, default=1)
    confidence = Column(Float(precision=5), nullable=False, default=0.0)

    # Flexible metadata storage for source-specific data
    # Note: 'metadata' is a reserved SQLAlchemy attribute, so we use 'record_metadata'
    # as the Python attribute name but map to 'metadata' column in the database
    record_metadata = Column("metadata", JSONB, nullable=False, default=dict)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Table-level constraints matching SCHEMA.sql
    __table_args__ = (
        CheckConstraint("source_count >= 1", name="golden_records_source_count_check"),
        CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="golden_records_confidence_check",
        ),
    )

    def __repr__(self) -> str:
        return f"<GoldenRecord(uid={self.uid}, email={self.email}, phone={self.phone})>"
