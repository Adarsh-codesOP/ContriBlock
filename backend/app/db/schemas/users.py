from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.db.models.users import UserRole, KYCStatus


# Base User schema
class UserBase(BaseModel):
    wallet: str


# Schema for creating a new user
class UserCreate(UserBase):
    pass


# Schema for updating a user
class UserUpdate(BaseModel):
    role: Optional[UserRole] = None
    reputation: Optional[int] = None
    kyc_status: Optional[KYCStatus] = None


# Schema for user in DB
class UserInDB(UserBase):
    id: int
    role: UserRole
    reputation: int
    kyc_status: KYCStatus
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for user response
class User(UserInDB):
    pass


# Schema for user with token
class UserWithToken(User):
    access_token: str
    token_type: str = "bearer"