from datetime import datetime
from enum import Enum

from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(str, Enum):
    USER = "user"
    VERIFIER = "verifier"
    ADMIN = "admin"


class KYCStatus(str, Enum):
    NONE = "none"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, unique=True, index=True, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)
    reputation = Column(Integer, default=0)
    kyc_status = Column(SQLAlchemyEnum(KYCStatus), default=KYCStatus.NONE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    contributions = relationship("Contribution", back_populates="user")
    transactions = relationship("OnchainTransaction", back_populates="user")
    purchases = relationship("Purchase", back_populates="buyer")
    audit_logs = relationship("AuditLog", back_populates="actor")