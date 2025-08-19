from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_admin
from app.db.models import Sector, User
from app.db.schemas import Sector as SectorSchema, SectorCreate, SectorUpdate

router = APIRouter()


@router.get("/", response_model=List[SectorSchema])
async def get_sectors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all sectors."""
    sectors = db.query(Sector).offset(skip).limit(limit).all()
    return sectors


@router.post("/", response_model=SectorSchema, status_code=status.HTTP_201_CREATED)
async def create_sector(
    sector: SectorCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Create a new sector (admin only)."""
    # Check if sector with same name already exists
    existing_sector = db.query(Sector).filter(Sector.name == sector.name).first()
    if existing_sector:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sector with this name already exists",
        )
    
    db_sector = Sector(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector


@router.get("/{sector_id}", response_model=SectorSchema)
async def get_sector(
    sector_id: int,
    db: Session = Depends(get_db),
):
    """Get sector by ID."""
    sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not sector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sector not found",
        )
    return sector


@router.put("/{sector_id}", response_model=SectorSchema)
async def update_sector(
    sector_id: int,
    sector_update: SectorUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Update sector (admin only)."""
    db_sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not db_sector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sector not found",
        )
    
    # Check if updated name conflicts with existing sector
    if sector_update.name and sector_update.name != db_sector.name:
        existing_sector = db.query(Sector).filter(Sector.name == sector_update.name).first()
        if existing_sector:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sector with this name already exists",
            )
    
    for key, value in sector_update.model_dump(exclude_unset=True).items():
        setattr(db_sector, key, value)
    
    db.commit()
    db.refresh(db_sector)
    return db_sector


@router.delete("/{sector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sector(
    sector_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete sector (admin only)."""
    db_sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not db_sector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sector not found",
        )
    
    # Check if sector is being used in any contributions
    if db_sector.contributions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete sector that is being used in contributions",
        )
    
    db.delete(db_sector)
    db.commit()
    return None