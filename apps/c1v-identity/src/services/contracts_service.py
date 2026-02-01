"""
Contract service for consent contract lifecycle management.

Provides business logic for creating, signing, retrieving, and revoking
bilateral consent contracts between systems/agents.
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.models import ConsentContractModel, ContractStatusEnum
from src.schemas.contracts import (
    Contract,
    ContractParty,
    ContractResponse,
    ContractSignature,
    ContractTerms,
    CreateContractRequest,
    SignContractRequest,
)
from src.services.crypto_service import CryptoService


# Valid state transitions for contract lifecycle
# Terminal states (REVOKED, EXPIRED) cannot transition to anything
VALID_TRANSITIONS: dict[ContractStatusEnum, set[ContractStatusEnum]] = {
    ContractStatusEnum.PROPOSED: {
        ContractStatusEnum.ACTIVE,
        ContractStatusEnum.REVOKED,
        ContractStatusEnum.EXPIRED,
    },
    ContractStatusEnum.ACTIVE: {
        ContractStatusEnum.REVOKED,
        ContractStatusEnum.EXPIRED,
    },
    ContractStatusEnum.REVOKED: set(),  # Terminal state
    ContractStatusEnum.EXPIRED: set(),  # Terminal state
}


class ContractService:
    """
    Business logic layer for consent contract management.

    Handles contract lifecycle: create -> sign -> active -> revoke/expire.
    Uses CryptoService for signature verification.
    """

    def __init__(self, db: Session, crypto: Optional[CryptoService] = None):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy database session
            crypto: CryptoService instance (created if None)
        """
        self.db = db
        self.crypto = crypto or CryptoService()

    def create_contract(
        self, proposer_agent_id: str, request: CreateContractRequest
    ) -> ContractResponse:
        """
        Create a new consent contract proposal.

        Args:
            proposer_agent_id: Agent ID of the party proposing the contract
            request: Contract creation request with terms and counterparty

        Returns:
            ContractResponse with the created contract in PROPOSED status
        """
        # Compute content hash for signature verification
        content_hash = CryptoService.compute_content_hash(
            party_a=proposer_agent_id,
            party_b=request.counterparty.agent_id,
            data_types=request.terms.data_types,
            actions=request.terms.allowed_actions,
            purpose=request.terms.purpose,
            retention_days=request.terms.retention_days,
            expires_at=request.expires_at,
        )

        # Create the contract model
        contract = ConsentContractModel(
            party_a=proposer_agent_id,
            party_b=request.counterparty.agent_id,
            data_types=request.terms.data_types,
            actions=request.terms.allowed_actions,
            purpose=request.terms.purpose,
            retention_days=request.terms.retention_days,
            geographic_scope=[],  # Can be extended later
            status=ContractStatusEnum.PROPOSED,
            content_hash=content_hash,
            expires_at=request.expires_at,
        )

        self.db.add(contract)
        self.db.commit()
        self.db.refresh(contract)

        return ContractResponse(contract=self._to_schema(contract))

    def sign_contract(
        self,
        contract_id: str,
        agent_id: str,
        signature: str,
        public_key_pem: str,
    ) -> ContractResponse:
        """
        Sign a consent contract.

        Both parties must sign for the contract to become active.

        Args:
            contract_id: UUID of the contract to sign
            agent_id: Agent ID of the signing party
            signature: Base64-encoded Ed25519 signature
            public_key_pem: PEM-encoded public key for verification

        Returns:
            ContractResponse with updated contract

        Raises:
            HTTPException 404: Contract not found
            HTTPException 400: Contract not in PROPOSED status
            HTTPException 403: Agent is not a party to this contract
            HTTPException 400: Invalid signature
            HTTPException 409: Party already signed
        """
        contract = self._get_contract(contract_id)

        # Check contract is in signable state
        if contract.status != ContractStatusEnum.PROPOSED:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "CONTRACT_NOT_SIGNABLE",
                        "message": f"Contract is not in PROPOSED status (current: {contract.status.value})",
                    }
                },
            )

        # Determine which party is signing
        is_party_a = agent_id == contract.party_a
        is_party_b = agent_id == contract.party_b

        if not is_party_a and not is_party_b:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": {
                        "code": "NOT_CONTRACT_PARTY",
                        "message": f"Agent {agent_id} is not a party to this contract",
                    }
                },
            )

        # Check if already signed by this party
        if is_party_a and contract.party_a_signature is not None:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": {
                        "code": "ALREADY_SIGNED",
                        "message": "Party A has already signed this contract",
                    }
                },
            )
        if is_party_b and contract.party_b_signature is not None:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": {
                        "code": "ALREADY_SIGNED",
                        "message": "Party B has already signed this contract",
                    }
                },
            )

        # Verify the signature
        if not CryptoService.verify_signature(
            public_key_pem=public_key_pem,
            signature_b64=signature,
            content_hash=contract.content_hash,
        ):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "SIGNATURE_INVALID",
                        "message": "Signature verification failed",
                    }
                },
            )

        # Store the signature
        if is_party_a:
            contract.party_a_signature = signature
        else:
            contract.party_b_signature = signature

        # Check if both parties have now signed
        if (
            contract.party_a_signature is not None
            and contract.party_b_signature is not None
        ):
            contract.status = ContractStatusEnum.ACTIVE
            contract.signed_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(contract)

        return ContractResponse(contract=self._to_schema(contract))

    def get_contract(self, contract_id: str) -> ContractResponse:
        """
        Retrieve a contract by ID.

        Args:
            contract_id: UUID of the contract

        Returns:
            ContractResponse with the contract

        Raises:
            HTTPException 404: Contract not found
        """
        contract = self._get_contract(contract_id)
        return ContractResponse(contract=self._to_schema(contract))

    def revoke_contract(
        self, contract_id: str, agent_id: str, reason: str
    ) -> ContractResponse:
        """
        Revoke an active contract.

        Either party can revoke an active contract at any time.

        Args:
            contract_id: UUID of the contract to revoke
            agent_id: Agent ID of the party revoking
            reason: Reason for revocation

        Returns:
            ContractResponse with revoked contract

        Raises:
            HTTPException 404: Contract not found
            HTTPException 400: Contract not in ACTIVE status
            HTTPException 403: Agent is not a party to this contract
        """
        contract = self._get_contract(contract_id)

        # Check contract is active
        if contract.status != ContractStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": {
                        "code": "CONTRACT_NOT_ACTIVE",
                        "message": f"Contract is not ACTIVE (current: {contract.status.value})",
                    }
                },
            )

        # Verify agent is a party
        if agent_id != contract.party_a and agent_id != contract.party_b:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": {
                        "code": "NOT_CONTRACT_PARTY",
                        "message": f"Agent {agent_id} is not a party to this contract",
                    }
                },
            )

        # Revoke the contract
        contract.status = ContractStatusEnum.REVOKED
        contract.revoked_at = datetime.now(timezone.utc)
        contract.revoked_by = agent_id
        contract.revocation_reason = reason

        self.db.commit()
        self.db.refresh(contract)

        return ContractResponse(contract=self._to_schema(contract))

    def _get_contract(self, contract_id: str) -> ConsentContractModel:
        """
        Get contract by ID or raise 404.

        Args:
            contract_id: UUID string of the contract

        Returns:
            ConsentContractModel instance

        Raises:
            HTTPException 404: Contract not found
        """
        try:
            uuid_id = UUID(contract_id)
        except ValueError:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": {
                        "code": "CONTRACT_NOT_FOUND",
                        "message": f"Contract {contract_id} not found",
                    }
                },
            )

        contract = (
            self.db.query(ConsentContractModel)
            .filter(ConsentContractModel.contract_id == uuid_id)
            .first()
        )

        if not contract:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": {
                        "code": "CONTRACT_NOT_FOUND",
                        "message": f"Contract {contract_id} not found",
                    }
                },
            )

        return contract

    def _to_schema(self, model: ConsentContractModel) -> Contract:
        """
        Convert SQLAlchemy model to Pydantic Contract schema.

        Args:
            model: ConsentContractModel instance

        Returns:
            Contract Pydantic model
        """
        # Build ContractParty for proposer (party_a)
        proposer = ContractParty(
            agent_id=model.party_a,
            organization_id=None,  # Not stored in current schema
            public_key=None,  # Not stored in current schema
        )

        # Build ContractParty for counterparty (party_b)
        counterparty = ContractParty(
            agent_id=model.party_b,
            organization_id=None,
            public_key=None,
        )

        # Build ContractTerms
        terms = ContractTerms(
            data_types=model.data_types or [],
            allowed_actions=model.actions or [],
            purpose=model.purpose,
            retention_days=model.retention_days or 0,
        )

        # Build signatures list
        signatures: list[ContractSignature] = []
        if model.party_a_signature:
            signatures.append(
                ContractSignature(
                    party_id=model.party_a,
                    signature=model.party_a_signature,
                    signed_at=model.signed_at or model.updated_at,
                )
            )
        if model.party_b_signature:
            signatures.append(
                ContractSignature(
                    party_id=model.party_b,
                    signature=model.party_b_signature,
                    signed_at=model.signed_at or model.updated_at,
                )
            )

        # Map status enum
        from src.schemas.contracts import ContractStatus as SchemaContractStatus

        status_map = {
            ContractStatusEnum.PROPOSED: SchemaContractStatus.PROPOSED,
            ContractStatusEnum.ACTIVE: SchemaContractStatus.ACTIVE,
            ContractStatusEnum.REVOKED: SchemaContractStatus.REVOKED,
            ContractStatusEnum.EXPIRED: SchemaContractStatus.EXPIRED,
        }

        return Contract(
            id=model.contract_id,
            status=status_map[model.status],
            proposer=proposer,
            counterparty=counterparty,
            terms=terms,
            signatures=signatures,
            created_at=model.created_at,
            updated_at=model.updated_at,
            expires_at=model.expires_at,
        )
