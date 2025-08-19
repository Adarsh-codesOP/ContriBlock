from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_admin
from app.db.models import User, UserRole, KYCStatus
from app.db.schemas import User as UserSchema, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current user information."""
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_user_info(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user information."""
    # Only allow updating certain fields
    for key, value in user_update.model_dump(exclude_unset=True).items():
        if key not in ["reputation", "role", "kyc_status"]:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    kyc_status: Optional[KYCStatus] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get all users (admin only)."""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/{user_id}/role", response_model=UserSchema)
async def update_user_role(
    user_id: int,
    role: UserRole,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update user role (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/kyc", response_model=UserSchema)
async def update_user_kyc_status(
    user_id: int,
    kyc_status: KYCStatus,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update user KYC status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.kyc_status = kyc_status
    db.commit()
    db.refresh(user)
    return user