"""
PIN service for agent PIN lifecycle management.

Provides business logic for creating, validating, and managing short-lived
authorization tokens issued against active consent contracts.
"""
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.core.config import get_settings
from src.models.contract import ConsentContractModel, ContractStatusEnum
from src.models.pin import AgentPinModel
from src.schemas.pins import (
    CreatePinRequest,
    CreatePinResponse,
    Pin,
    PinScope,
    ValidatePinRequest,
    ValidatePinResponse,
)

settings = get_settings()


class PinsService:
    """
    Business logic layer for agent PIN management.

    Handles PIN lifecycle: create -> validate -> expire/revoke.
    Uses HMAC-SHA256 for cryptographic token signing.
    """

    def __init__(self, db: Session, signing_key: Optional[bytes] = None):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy database session
            signing_key: Optional override for PIN signing key (default from settings)
        """
        self.db = db
        self._signing_key = signing_key or settings.pin_signing_key.encode()

    def create_pin(self, agent_id: str, request: CreatePinRequest) -> CreatePinResponse:
        """
        Create a new agent PIN.

        Args:
            agent_id: Agent ID requesting the PIN
            request: PIN creation request with contract_id, scope, and single_use flag

        Returns:
            CreatePinResponse with the created PIN (token only shown once)

        Raises:
            HTTPException 400: Contract not active or scope exceeds contract
            HTTPException 403: Agent is not a party to the contract
        """
        # 1. Get active contract
        contract = self._get_active_contract(request.contract_id)
        if not contract:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "CONTRACT_NOT_ACTIVE",
                        "message": "Contract not found or not active",
                    }
                },
            )

        # 2. Verify agent is party to contract
        if agent_id not in [contract.party_a, contract.party_b]:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": {
                        "code": "NOT_CONTRACT_PARTY",
                        "message": "Agent is not a party to this contract",
                    }
                },
            )

        # 3. Validate scope subset
        if not self._validate_scope_against_contract(request.scope, contract):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "SCOPE_EXCEEDS_CONTRACT",
                        "message": "PIN scope exceeds contract permissions",
                    }
                },
            )

        # 4. Generate PIN token + signature
        pin_id = uuid4()
        token = secrets.token_urlsafe(32)
        signature = self._sign_token(token, str(pin_id))
        full_pin = f"{token}.{signature}"

        # 5. Calculate expiration
        issued_at = datetime.now(timezone.utc)
        expires_at = issued_at + timedelta(seconds=settings.pin_ttl_seconds)

        # 6. Create PIN record
        pin = AgentPinModel(
            pin_id=pin_id,
            contract_id=request.contract_id,
            agent_id=agent_id,
            scope={"data_types": request.scope.data_types, "actions": request.scope.actions},
            signature=signature,
            issued_at=issued_at,
            expires_at=expires_at,
            single_use=request.single_use,
        )

        self.db.add(pin)
        self.db.commit()
        self.db.refresh(pin)

        return CreatePinResponse(
            pin=Pin(
                id=pin.pin_id,
                pin=full_pin,  # Only returned once
                contract_id=pin.contract_id,
                scope=PinScope(
                    data_types=pin.scope["data_types"],
                    actions=pin.scope["actions"],
                ),
                single_use=pin.single_use,
                created_at=pin.issued_at,
                expires_at=pin.expires_at,
            ),
            ttl_seconds=settings.pin_ttl_seconds,
        )

    def validate_pin(self, pin_id: UUID, request: ValidatePinRequest) -> ValidatePinResponse:
        """
        Validate PIN with atomic single-use enforcement using SELECT FOR UPDATE.

        Args:
            pin_id: UUID of the PIN to validate
            request: Validation request with PIN token and requested scope

        Returns:
            ValidatePinResponse indicating validity and any error details
        """
        # Atomic select with row lock
        pin = (
            self.db.query(AgentPinModel)
            .filter(
                AgentPinModel.pin_id == pin_id,
                AgentPinModel.revoked == False,  # noqa: E712
            )
            .with_for_update(nowait=True)
            .first()
        )

        if not pin:
            return ValidatePinResponse(
                valid=False,
                error_code="PIN_NOT_FOUND",
                error_message="PIN not found or revoked",
            )

        # Check expiration
        if datetime.now(timezone.utc) > pin.expires_at:
            return ValidatePinResponse(
                valid=False,
                error_code="PIN_EXPIRED",
                error_message="PIN has expired",
            )

        # Check single-use
        if pin.used_at is not None:
            return ValidatePinResponse(
                valid=False,
                error_code="PIN_ALREADY_USED",
                error_message="Single-use PIN has already been used",
            )

        # Verify signature
        try:
            token, signature = request.pin.rsplit(".", 1)
        except ValueError:
            return ValidatePinResponse(
                valid=False,
                error_code="INVALID_PIN_FORMAT",
                error_message="Invalid PIN format",
            )

        if not self._verify_signature(token, str(pin.pin_id), signature):
            return ValidatePinResponse(
                valid=False,
                error_code="PIN_INVALID",
                error_message="PIN signature verification failed",
            )

        # Validate scope
        if not self._is_scope_subset(request.requested_scope, pin.scope):
            return ValidatePinResponse(
                valid=False,
                error_code="PIN_SCOPE_MISMATCH",
                error_message="Requested scope exceeds PIN scope",
            )

        # Validate contract still active
        contract = self._get_active_contract(pin.contract_id)
        if not contract:
            return ValidatePinResponse(
                valid=False,
                error_code="CONTRACT_NOT_ACTIVE",
                error_message="Parent contract is not active",
            )

        # Mark as used if single-use
        if pin.single_use:
            pin.used_at = datetime.now(timezone.utc)

        self.db.commit()

        return ValidatePinResponse(valid=True, contract_id=pin.contract_id)

    # -------------------------------------------------------------------------
    # Private methods
    # -------------------------------------------------------------------------

    def _sign_token(self, token: str, pin_id: str) -> str:
        """
        Create HMAC-SHA256 signature for PIN token.

        Args:
            token: Random token string
            pin_id: PIN UUID string

        Returns:
            Base64 URL-safe encoded signature
        """
        message = f"{pin_id}:{token}".encode()
        sig = hmac.new(self._signing_key, message, hashlib.sha256).digest()
        return base64.urlsafe_b64encode(sig).decode()

    def _verify_signature(self, token: str, pin_id: str, signature: str) -> bool:
        """
        Verify signature with constant-time comparison.

        Args:
            token: Random token string from PIN
            pin_id: PIN UUID string
            signature: Signature to verify

        Returns:
            True if signature is valid
        """
        expected = self._sign_token(token, pin_id)
        return hmac.compare_digest(expected, signature)

    def _get_active_contract(self, contract_id: UUID) -> Optional[ConsentContractModel]:
        """
        Get contract only if active and not expired.

        Args:
            contract_id: UUID of the contract

        Returns:
            ConsentContractModel if active, None otherwise
        """
        return (
            self.db.query(ConsentContractModel)
            .filter(
                ConsentContractModel.contract_id == contract_id,
                ConsentContractModel.status == ContractStatusEnum.ACTIVE,
                (ConsentContractModel.expires_at == None)  # noqa: E711
                | (ConsentContractModel.expires_at > datetime.now(timezone.utc)),
            )
            .first()
        )

    def _validate_scope_against_contract(
        self, scope: PinScope, contract: ConsentContractModel
    ) -> bool:
        """
        Verify PIN scope is subset of contract scope.

        Args:
            scope: Requested PIN scope
            contract: Parent contract

        Returns:
            True if scope is valid subset
        """
        contract_data_types = set(contract.data_types or [])
        contract_actions = set(contract.actions or [])
        return set(scope.data_types).issubset(contract_data_types) and set(
            scope.actions
        ).issubset(contract_actions)

    def _is_scope_subset(self, requested: PinScope, granted: dict) -> bool:
        """
        Check if requested scope is subset of granted scope.

        Args:
            requested: Scope being requested
            granted: Scope granted by PIN

        Returns:
            True if requested is subset of granted
        """
        granted_data_types = set(granted.get("data_types", []))
        granted_actions = set(granted.get("actions", []))
        return set(requested.data_types).issubset(granted_data_types) and set(
            requested.actions
        ).issubset(granted_actions)
