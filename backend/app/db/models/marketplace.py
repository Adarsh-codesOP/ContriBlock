from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), unique=True, nullable=False)
    price_tokens = Column(Float, nullable=False)  # Price in CTR tokens
    active = Column(Boolean, default=True)  # Whether this item is active in the marketplace

    # Relationships
    contribution = relationship("Contribution", back_populates="marketplace_item")
    purchases = relationship("Purchase", back_populates="item")


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("marketplace_items.id"), nullable=False)
    tx_hash = Column(String, nullable=False)  # Transaction hash

    # Relationships
    buyer = relationship("User", back_populates="purchases")
    item = relationship("MarketplaceItem", back_populates="purchases")