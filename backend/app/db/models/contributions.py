from datetime import datetime
from enum import Enum

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLAlchemyEnum, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class ContributionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False)
    title = Column(String, nullable=False)
    abstract = Column(String, nullable=False)
    ipfs_cid = Column(String, nullable=False)  # IPFS Content ID
    url = Column(String, nullable=True)  # Optional external URL
    status = Column(SQLAlchemyEnum(ContributionStatus), default=ContributionStatus.DRAFT, nullable=False)
    premium = Column(Boolean, default=False)  # Whether this is a premium contribution
    token_minted = Column(Boolean, default=False)  # Whether tokens have been minted for this contribution
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="contributions")
    sector = relationship("Sector", back_populates="contributions")
    contribution_metadata = relationship("ContributionMetadata", back_populates="contribution", uselist=False)
    impact_records = relationship("ImpactRecord", back_populates="contribution")
    token_distributions = relationship("TokenDistribution", back_populates="contribution")
    marketplace_item = relationship("MarketplaceItem", back_populates="contribution", uselist=False)


class ContributionMetadata(Base):
    __tablename__ = "contribution_metadata"

    contribution_id = Column(Integer, ForeignKey("contributions.id"), primary_key=True)
    data = Column(JSON, nullable=False)  # JSONB data according to sector schema

    # Relationships
    contribution = relationship("Contribution", back_populates="contribution_metadata")