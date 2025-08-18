from datetime import datetime
from typing import Dict, Any, Optional, List

from pydantic import BaseModel, Field

from app.db.models.contributions import ContributionStatus


# Base Contribution schema
class ContributionBase(BaseModel):
    title: str
    abstract: str
    ipfs_cid: str
    url: Optional[str] = None
    premium: bool = False


# Schema for creating a new contribution
class ContributionCreate(ContributionBase):
    sector_id: int
    metadata: Dict[str, Any] = Field(..., description="Metadata according to sector schema")


# Schema for updating a contribution
class ContributionUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None
    premium: Optional[bool] = None
    status: Optional[ContributionStatus] = None


# Schema for contribution metadata
class ContributionMetadataBase(BaseModel):
    data: Dict[str, Any]


# Schema for contribution in DB
class ContributionInDB(ContributionBase):
    id: int
    user_id: int
    sector_id: int
    status: ContributionStatus
    token_minted: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for contribution response
class Contribution(ContributionInDB):
    metadata: Optional[Dict[str, Any]] = None


# Schema for contribution verification
class ContributionVerify(BaseModel):
    approved: bool
    feedback: Optional[str] = None