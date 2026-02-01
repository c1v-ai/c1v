"""
Cryptographic service for Ed25519 signature operations.

Provides content hashing and signature verification for consent contracts.
"""
import base64
import hashlib
import json
from datetime import datetime
from typing import Any, Optional

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey


class CryptoService:
    """
    Service for cryptographic operations on consent contracts.

    Provides Ed25519 signature verification and deterministic content hashing
    for contract integrity.
    """

    @staticmethod
    def compute_content_hash(
        party_a: str,
        party_b: str,
        data_types: list[str],
        actions: list[str],
        purpose: str,
        retention_days: Optional[int],
        expires_at: Optional[datetime],
    ) -> str:
        """
        Compute deterministic SHA256 hash of contract content.

        Creates a canonical JSON representation with sorted keys to ensure
        the same inputs always produce the same hash, regardless of field order.

        Args:
            party_a: First party identifier
            party_b: Second party identifier
            data_types: List of covered data types
            actions: List of permitted actions
            purpose: Business purpose for consent
            retention_days: Data retention period in days (None = indefinite)
            expires_at: Contract expiration datetime (None = no expiration)

        Returns:
            64-character hexadecimal SHA256 hash string
        """
        content = {
            "party_a": party_a,
            "party_b": party_b,
            "data_types": sorted(data_types),
            "actions": sorted(actions),
            "purpose": purpose,
            "retention_days": retention_days,
            "expires_at": expires_at.isoformat() if expires_at else None,
        }

        # Canonical JSON: sorted keys, minimal separators, no whitespace
        canonical = json.dumps(content, sort_keys=True, separators=(",", ":"))

        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_signature(
        public_key_pem: str,
        signature_b64: str,
        content_hash: str,
    ) -> bool:
        """
        Verify an Ed25519 signature against a content hash.

        Args:
            public_key_pem: PEM-encoded Ed25519 public key
            signature_b64: Base64-encoded signature (64 bytes when decoded)
            content_hash: The content hash that was signed

        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Load the public key from PEM format
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode("utf-8")
            )

            # Verify it's an Ed25519 key
            if not isinstance(public_key, Ed25519PublicKey):
                return False

            # Decode the signature from base64
            signature_bytes = base64.b64decode(signature_b64)

            # Ed25519 signatures are exactly 64 bytes
            if len(signature_bytes) != 64:
                return False

            # Verify the signature (raises InvalidSignature if invalid)
            public_key.verify(signature_bytes, content_hash.encode("utf-8"))

            return True

        except (InvalidSignature, ValueError, TypeError, Exception):
            # Any error means signature is invalid
            return False

    @staticmethod
    def get_public_key_fingerprint(public_key_pem: str) -> str:
        """
        Compute a fingerprint of a public key for identification.

        Args:
            public_key_pem: PEM-encoded public key

        Returns:
            64-character hexadecimal SHA256 hash of the PEM string
        """
        return hashlib.sha256(public_key_pem.encode("utf-8")).hexdigest()
