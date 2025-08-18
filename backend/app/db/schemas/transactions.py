from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel

from app.db.models.transactions import TransactionType, TransactionStatus


# Base OnchainTransaction schema
class OnchainTransactionBase(BaseModel):
    user_id: int
    type: TransactionType
    tx_hash: str
    status: TransactionStatus = TransactionStatus.PENDING
    payload: Optional[Dict[str, Any]] = None


# Schema for creating a new onchain transaction
class OnchainTransactionCreate(OnchainTransactionBase):
    pass


# Schema for updating an onchain transaction
class OnchainTransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    payload: Optional[Dict[str, Any]] = None


# Schema for onchain transaction in DB
class OnchainTransactionInDB(OnchainTransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for onchain transaction response
class OnchainTransaction(OnchainTransactionInDB):
    pass


# Base AuditLog schema
class AuditLogBase(BaseModel):
    actor_id: int
    action: str
    entity: str
    entity_id: int
    meta: Optional[Dict[str, Any]] = None


# Schema for creating a new audit log
class AuditLogCreate(AuditLogBase):
    pass


# Schema for audit log in DB
class AuditLogInDB(AuditLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for audit log response
class AuditLog(AuditLogInDB):
    pass