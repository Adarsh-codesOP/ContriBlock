from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.deps import get_db, get_current_user
from app.db.models import Contribution, ContributionStatus, User, Sector, ContributionMetadata
from app.db.schemas import (
    Contribution as ContributionSchema,
    ContributionCreate,
    ContributionUpdate,
    ContributionWithMetadata,
    ContributionMetadataBase as ContributionMetadataSchema,
)
from app.services.ipfs import ipfs_client

router = APIRouter()


@router.get("/", response_model=List[ContributionSchema])
async def get_contributions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContributionStatus] = None,
    sector_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Get all contributions with optional filters."""
    query = db.query(Contribution)
    
    if status:
        query = query.filter(Contribution.status == status)
    
    if sector_id:
        query = query.filter(Contribution.sector_id == sector_id)
    
    if user_id:
        query = query.filter(Contribution.user_id == user_id)
    
    contributions = query.order_by(desc(Contribution.created_at)).offset(skip).limit(limit).all()
    return contributions


@router.post("/", response_model=ContributionWithMetadata, status_code=status.HTTP_201_CREATED)
async def create_contribution(
    title: str = Form(...),
    description: str = Form(...),
    sector_id: int = Form(...),
    target_amount: float = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new contribution with metadata and file upload to IPFS."""
    # Check if sector exists
    sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not sector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sector not found",
        )
    
    # Upload file to IPFS
    file_content = await file.read()
    ipfs_hash = await ipfs_client.add_file(file_content)
    
    # Create contribution
    contribution_data = {
        "title": title,
        "description": description,
        "sector_id": sector_id,
        "user_id": current_user.id,
        "target_amount": target_amount,
        "status": ContributionStatus.PENDING,
    }
    
    db_contribution = Contribution(**contribution_data)
    db.add(db_contribution)
    db.flush()  # Get ID without committing
    
    # Create metadata
    metadata = ContributionMetadata(
        contribution_id=db_contribution.id,
        ipfs_hash=ipfs_hash,
        file_name=file.filename,
        file_type=file.content_type,
    )
    db.add(metadata)
    
    db.commit()
    db.refresh(db_contribution)
    db.refresh(metadata)
    
    # Return combined result
    return {
        **ContributionSchema.model_validate(db_contribution).model_dump(),
        "metadata": ContributionMetadataSchema.model_validate(metadata),
    }


@router.get("/{contribution_id}", response_model=ContributionWithMetadata)
async def get_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
):
    """Get contribution by ID with its metadata."""
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    metadata = db.query(ContributionMetadata).filter(
        ContributionMetadata.contribution_id == contribution_id
    ).first()
    
    return {
        **ContributionSchema.model_validate(contribution).model_dump(),
        "metadata": ContributionMetadataSchema.model_validate(metadata) if metadata else None,
    }


@router.put("/{contribution_id}", response_model=ContributionSchema)
async def update_contribution(
    contribution_id: int,
    contribution_update: ContributionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update contribution (only by owner or admin)."""
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    # Check if user is owner or admin
    if contribution.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this contribution",
        )
    
    # Only allow updating certain fields
    for key, value in contribution_update.model_dump(exclude_unset=True).items():
        if key not in ["status"] or current_user.role == "ADMIN":  # Only admin can update status
            setattr(contribution, key, value)
    
    db.commit()
    db.refresh(contribution)
    return contribution


@router.delete("/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contribution(
    contribution_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete contribution (only by owner or admin)."""
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    # Check if user is owner or admin
    if contribution.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this contribution",
        )
    
    # Delete associated metadata
    metadata = db.query(ContributionMetadata).filter(
        ContributionMetadata.contribution_id == contribution_id
    ).first()
    if metadata:
        db.delete(metadata)
    
    db.delete(contribution)
    db.commit()
    return None