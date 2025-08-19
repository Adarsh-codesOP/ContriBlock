from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, generate_nonce
from app.core.deps import get_db
from app.db.models import User, UserRole
from app.db.schemas import UserCreate, User as UserSchema, UserWithToken
from app.services.web3client import web3_client

router = APIRouter()

# Store nonces in memory (in production, use Redis)
nonces: Dict[str, str] = {}


@router.post("/nonce", response_model=Dict[str, str])
async def get_nonce(wallet: str):
    """Generate a nonce for SIWE authentication."""
    if not wallet or not wallet.startswith("0x"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address",
        )
    
    nonce = generate_nonce()
    nonces[wallet.lower()] = nonce
    
    return {"nonce": nonce}


@router.post("/verify", response_model=UserWithToken)
async def verify_signature(
    wallet: str,
    message: str,
    signature: str,
    db: Session = Depends(get_db),
):
    """Verify SIWE signature and create/login user."""
    wallet = wallet.lower()
    
    # Verify the signature
    if not web3_client.verify_siwe_message(message, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )
    
    # Check if the nonce is valid
    stored_nonce = nonces.get(wallet)
    if not stored_nonce or stored_nonce not in message:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid nonce",
        )
    
    # Clear the nonce
    nonces.pop(wallet, None)
    
    # Get or create user
    user = db.query(User).filter(User.wallet == wallet).first()
    if not user:
        user = User(wallet=wallet, role=UserRole.USER)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = create_access_token(subject=wallet)
    
    return {
        **UserSchema.model_validate(user).model_dump(),
        "access_token": access_token,
        "token_type": "bearer",
    }