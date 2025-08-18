from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="ContriBlock API",
    description="Blockchain-based contribution mining & exchange platform",
    version="0.1.0",
)

# Set up CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "ContriBlock API is running"}