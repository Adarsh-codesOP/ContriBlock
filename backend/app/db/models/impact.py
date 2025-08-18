from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class ImpactRecord(Base):
    __tablename__ = "impact_records"

    id = Column(Integer, primary_key=True, index=True)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), nullable=False)
    metric_type = Column(String, nullable=False)  # Type of impact metric
    value = Column(Float, nullable=False)  # Raw value of the metric
    weight = Column(Float, nullable=False)  # Weight applied to this metric
    score = Column(Float, nullable=False)  # Calculated score (value * weight)
    signature = Column(String, nullable=True)  # Optional cryptographic signature

    # Relationships
    contribution = relationship("Contribution", back_populates="impact_records")


class TokenDistribution(Base):
    __tablename__ = "token_distributions"

    id = Column(Integer, primary_key=True, index=True)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), nullable=False)
    amount = Column(Float, nullable=False)  # Amount of tokens distributed
    tx_hash = Column(String, nullable=False)  # Transaction hash

    # Relationships
    contribution = relationship("Contribution", back_populates="token_distributions")