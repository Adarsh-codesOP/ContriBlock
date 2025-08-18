from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.deps import get_db, get_current_user, get_current_admin
from app.db.models import User, MarketplaceItem, Purchase, TransactionStatus
from app.db.schemas import (
    MarketplaceItem as MarketplaceItemSchema,
    MarketplaceItemCreate,
    MarketplaceItemUpdate,
    Purchase as PurchaseSchema,
    PurchaseCreate,
)
from app.services.web3client import web3_client

router = APIRouter()


@router.get("/items", response_model=List[MarketplaceItemSchema])
async def get_marketplace_items(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db),
):
    """Get all marketplace items with optional filters."""
    query = db.query(MarketplaceItem)
    
    if active_only:
        query = query.filter(MarketplaceItem.active == True)
    
    items = query.order_by(desc(MarketplaceItem.created_at)).offset(skip).limit(limit).all()
    return items


@router.post("/items", response_model=MarketplaceItemSchema, status_code=status.HTTP_201_CREATED)
async def create_marketplace_item(
    item: MarketplaceItemCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new marketplace item (admin only)."""
    db_item = MarketplaceItem(**item.model_dump(), active=True)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/items/{item_id}", response_model=MarketplaceItemSchema)
async def get_marketplace_item(
    item_id: int,
    db: Session = Depends(get_db),
):
    """Get marketplace item by ID."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found",
        )
    return item


@router.put("/items/{item_id}", response_model=MarketplaceItemSchema)
async def update_marketplace_item(
    item_id: int,
    item_update: MarketplaceItemUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update marketplace item (admin only)."""
    db_item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found",
        )
    
    for key, value in item_update.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_marketplace_item(
    item_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete marketplace item (admin only)."""
    db_item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found",
        )
    
    # Check if item has purchases
    if db_item.purchases:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete item with existing purchases",
        )
    
    db.delete(db_item)
    db.commit()
    return None


@router.post("/purchase", response_model=PurchaseSchema, status_code=status.HTTP_201_CREATED)
async def purchase_item(
    purchase: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Purchase an item from the marketplace."""
    # Check if item exists and is active
    item = db.query(MarketplaceItem).filter(
        MarketplaceItem.id == purchase.item_id,
        MarketplaceItem.active == True
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace item not found or inactive",
        )
    
    # Check if user has enough tokens
    user_balance = await web3_client.get_token_balance(current_user.wallet)
    if user_balance < item.price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient token balance",
        )
    
    # Create purchase record
    db_purchase = Purchase(
        user_id=current_user.id,
        item_id=item.id,
        quantity=purchase.quantity,
        total_price=item.price * purchase.quantity,
        status=TransactionStatus.PENDING,
    )
    db.add(db_purchase)
    db.flush()  # Get ID without committing
    
    # Process payment on blockchain
    try:
        tx_hash = await web3_client.process_purchase(
            user_address=current_user.wallet,
            amount=db_purchase.total_price,
            purchase_id=db_purchase.id,
        )
        
        # Update purchase with transaction hash
        db_purchase.tx_hash = tx_hash
        db_purchase.status = TransactionStatus.COMPLETED
    except Exception as e:
        # Log the error and mark purchase as failed
        print(f"Error processing purchase on blockchain: {e}")
        db_purchase.status = TransactionStatus.FAILED
        db_purchase.failure_reason = str(e)
    
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


@router.get("/purchases", response_model=List[PurchaseSchema])
async def get_user_purchases(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all purchases for the current user."""
    purchases = db.query(Purchase).filter(
        Purchase.user_id == current_user.id
    ).order_by(desc(Purchase.created_at)).offset(skip).limit(limit).all()
    
    return purchases


@router.get("/purchases/{purchase_id}", response_model=PurchaseSchema)
async def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get purchase by ID (only for the owner or admin)."""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found",
        )
    
    # Check if user is owner or admin
    if purchase.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this purchase",
        )
    
    return purchase