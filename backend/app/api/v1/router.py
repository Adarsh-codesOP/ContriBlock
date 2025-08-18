from fastapi import APIRouter

from app.api.v1 import auth, sectors, contrib, verify, impact, market, users

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(sectors.router, prefix="/sectors", tags=["Sectors"])
api_router.include_router(contrib.router, prefix="/contrib", tags=["Contributions"])
api_router.include_router(verify.router, prefix="/verify", tags=["Verification"])
api_router.include_router(impact.router, prefix="/impact", tags=["Impact"])
api_router.include_router(market.router, prefix="/market", tags=["Marketplace"])