from typing import Optional

from pydantic import BaseModel


# Base MarketplaceItem schema
class MarketplaceItemBase(BaseModel):
    contribution_id: int
    price_tokens: float
    active: bool = True


# Schema for creating a new marketplace item
class MarketplaceItemCreate(MarketplaceItemBase):
    pass


# Schema for updating a marketplace item
class MarketplaceItemUpdate(BaseModel):
    price_tokens: Optional[float] = None
    active: Optional[bool] = None


# Schema for marketplace item in DB
class MarketplaceItemInDB(MarketplaceItemBase):
    id: int

    class Config:
        from_attributes = True


# Schema for marketplace item response
class MarketplaceItem(MarketplaceItemInDB):
    pass


# Base Purchase schema
class PurchaseBase(BaseModel):
    item_id: int


# Schema for creating a new purchase
class PurchaseCreate(PurchaseBase):
    pass


# Schema for purchase in DB
class PurchaseInDB(PurchaseBase):
    id: int
    buyer_id: int
    tx_hash: str

    class Config:
        from_attributes = True


# Schema for purchase response
class Purchase(PurchaseInDB):
    pass