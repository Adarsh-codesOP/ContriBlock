from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_verifier
from app.db.models import User, Contribution, ContributionStatus
from app.db.schemas import Contribution as ContributionSchema
from app.services.web3client import web3_client

router = APIRouter()


@router.get("/pending", response_model=List[ContributionSchema])
async def get_pending_verifications(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_verifier),
    db: Session = Depends(get_db),
):
    """Get all pending contributions for verification (verifier only)."""
    contributions = db.query(Contribution).filter(
        Contribution.status == ContributionStatus.PENDING
    ).offset(skip).limit(limit).all()
    
    return contributions


@router.post("/{contribution_id}/approve", response_model=ContributionSchema)
async def approve_contribution(
    contribution_id: int,
    current_user: User = Depends(get_current_verifier),
    db: Session = Depends(get_db),
):
    """Approve a contribution (verifier only)."""
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    if contribution.status != ContributionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contribution is already {contribution.status}",
        )
    
    # Update status
    contribution.status = ContributionStatus.APPROVED
    db.commit()
    db.refresh(contribution)
    
    # Register contribution on blockchain
    try:
        tx_hash = await web3_client.register_contribution(
            contribution_id=contribution.id,
            user_address=contribution.user.wallet,
            amount=contribution.target_amount,
        )
        # In a real application, you would store the transaction hash
        # and monitor its status
    except Exception as e:
        # Log the error but don't fail the API call
        print(f"Error registering contribution on blockchain: {e}")
    
    return contribution


@router.post("/{contribution_id}/reject", response_model=ContributionSchema)
async def reject_contribution(
    contribution_id: int,
    reason: str,
    current_user: User = Depends(get_current_verifier),
    db: Session = Depends(get_db),
):
    """Reject a contribution (verifier only)."""
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    if contribution.status != ContributionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contribution is already {contribution.status}",
        )
    
    # Update status and add rejection reason
    contribution.status = ContributionStatus.REJECTED
    contribution.rejection_reason = reason
    db.commit()
    db.refresh(contribution)
    
    return contribution