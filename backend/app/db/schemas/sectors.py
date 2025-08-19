from typing import Dict, Any, Optional

from pydantic import BaseModel, Field


# Base Sector schema
class SectorBase(BaseModel):
    name: str
    metadata_schema: Dict[str, Any] = Field(..., description="JSON schema for contribution metadata")
    verification_policy: Dict[str, Any] = Field(..., description="Verification requirements")


# Schema for creating a new sector
class SectorCreate(SectorBase):
    pass


# Schema for updating a sector
class SectorUpdate(BaseModel):
    name: Optional[str] = None
    metadata_schema: Optional[Dict[str, Any]] = None
    verification_policy: Optional[Dict[str, Any]] = None


# Schema for sector in DB
class SectorInDB(SectorBase):
    id: int

    class Config:
        from_attributes = True


# Schema for sector response
class Sector(SectorInDB):
    pass