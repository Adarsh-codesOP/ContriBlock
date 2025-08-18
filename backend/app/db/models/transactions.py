from datetime import datetime
from enum import Enum

from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship

from app.db.base import Base


class TransactionType(str, Enum):
    MINT = "mint"
    IMPACT = "impact"
    PURCHASE = "purchase"
    OTHER = "other"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class OnchainTransaction(Base):
    __tablename__ = "onchain_tx"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(SQLAlchemyEnum(TransactionType), nullable=False)
    tx_hash = Column(String, nullable=False)
    status = Column(SQLAlchemyEnum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False)
    payload = Column(JSON, nullable=True)  # Additional transaction data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)  # The entity type that was affected
    entity_id = Column(Integer, nullable=False)  # The ID of the entity
    meta = Column(JSON, nullable=True)  # Additional metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    actor = relationship("User", back_populates="audit_logs")