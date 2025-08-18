from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_verifier
from app.db.models import User, Contribution, ContributionStatus, ImpactRecord
from app.db.schemas import (
    ImpactRecord as ImpactRecordSchema,
    ImpactRecordCreate,
    ImpactRecordUpdate,
    TokenDistribution as TokenDistributionSchema,
)
from app.services.ipfs import ipfs_client
from app.services.web3client import web3_client

router = APIRouter()


@router.get("/", response_model=List[ImpactRecordSchema])
async def get_impact_records(
    skip: int = 0,
    limit: int = 100,
    contribution_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Get all impact records with optional filters."""
    query = db.query(ImpactRecord)
    
    if contribution_id:
        query = query.filter(ImpactRecord.contribution_id == contribution_id)
    
    impact_records = query.offset(skip).limit(limit).all()
    return impact_records


@router.post("/", response_model=ImpactRecordSchema, status_code=status.HTTP_201_CREATED)
async def create_impact_record(
    contribution_id: int = Form(...),
    description: str = Form(...),
    impact_value: float = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new impact record with evidence upload to IPFS."""
    # Check if contribution exists and is approved
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found",
        )
    
    if contribution.status != ContributionStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only add impact records to approved contributions",
        )
    
    # Check if user is the owner of the contribution
    if contribution.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add impact records to this contribution",
        )
    
    # Upload evidence to IPFS
    file_content = await file.read()
    ipfs_hash = await ipfs_client.add_file(file_content)
    
    # Create impact record
    impact_record_data = {
        "contribution_id": contribution_id,
        "description": description,
        "impact_value": impact_value,
        "evidence_ipfs_hash": ipfs_hash,
        "evidence_file_name": file.filename,
        "evidence_file_type": file.content_type,
        "verified": False,
    }
    
    db_impact_record = ImpactRecord(**impact_record_data)
    db.add(db_impact_record)
    db.commit()
    db.refresh(db_impact_record)
    
    return db_impact_record


@router.get("/{impact_id}", response_model=ImpactRecordSchema)
async def get_impact_record(
    impact_id: int,
    db: Session = Depends(get_db),
):
    """Get impact record by ID."""
    impact_record = db.query(ImpactRecord).filter(ImpactRecord.id == impact_id).first()
    if not impact_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact record not found",
        )
    
    return impact_record


@router.post("/{impact_id}/verify", response_model=ImpactRecordSchema)
async def verify_impact_record(
    impact_id: int,
    token_amount: float,
    current_user: User = Depends(get_current_verifier),
    db: Session = Depends(get_db),
):
    """Verify an impact record and distribute tokens (verifier only)."""
    impact_record = db.query(ImpactRecord).filter(ImpactRecord.id == impact_id).first()
    if not impact_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Impact record not found",
        )
    
    if impact_record.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impact record is already verified",
        )
    
    # Get contribution and user
    contribution = impact_record.contribution
    user = contribution.user
    
    # Update impact record
    impact_record.verified = True
    impact_record.verifier_id = current_user.id
    db.commit()
    db.refresh(impact_record)
    
    # Distribute tokens on blockchain
    try:
        tx_hash = await web3_client.distribute_tokens(
            user_address=user.wallet,
            amount=token_amount,
            impact_id=impact_record.id,
        )
        
        # Create token distribution record
        token_distribution = TokenDistributionSchema(
            impact_record_id=impact_record.id,
            amount=token_amount,
            tx_hash=tx_hash,
        )
        
        # In a real application, you would store the token distribution
        # and monitor the transaction status
    except Exception as e:
        # Log the error but don't fail the API call
        print(f"Error distributing tokens on blockchain: {e}")
    
    return impact_record