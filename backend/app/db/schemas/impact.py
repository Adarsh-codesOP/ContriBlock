from typing import Optional, List

from pydantic import BaseModel, Field


# Base ImpactRecord schema
class ImpactRecordBase(BaseModel):
    contribution_id: int
    metric_type: str
    value: float
    weight: float
    score: float
    signature: Optional[str] = None


# Schema for creating a new impact record
class ImpactRecordCreate(ImpactRecordBase):
    pass


# Schema for impact record in DB
class ImpactRecordInDB(ImpactRecordBase):
    id: int

    class Config:
        from_attributes = True


# Schema for impact record response
class ImpactRecord(ImpactRecordInDB):
    pass


# Schema for updating an impact record
class ImpactRecordUpdate(BaseModel):
    metric_type: Optional[str] = None
    value: Optional[float] = None
    weight: Optional[float] = None
    score: Optional[float] = None
    signature: Optional[str] = None


# Base TokenDistribution schema
class TokenDistributionBase(BaseModel):
    contribution_id: int
    amount: float
    tx_hash: str


# Schema for creating a new token distribution
class TokenDistributionCreate(BaseModel):
    contribution_id: int
    amount: float


# Schema for token distribution in DB
class TokenDistributionInDB(TokenDistributionBase):
    id: int

    class Config:
        from_attributes = True


# Schema for token distribution response
class TokenDistribution(TokenDistributionInDB):
    pass


# Schema for impact attestation
class ImpactAttestation(BaseModel):
    contribution_id: int
    metric_type: str
    value: float
    weight: float = 1.0


# Schema for impact distribution
class ImpactDistribution(BaseModel):
    contribution_ids: List[int] = Field(..., description="List of contribution IDs to distribute impact to")
    pool_amount: float = Field(..., description="Total amount of tokens to distribute")