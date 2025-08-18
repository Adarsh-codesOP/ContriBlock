import os
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Security settings
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database settings
    DATABASE_URL: str
    
    # Redis settings
    REDIS_URL: str
    
    # Web3 settings
    WEB3_RPC_URL: str
    CHAIN_ID: int
    ADMIN_PRIVATE_KEY: str
    TOKEN_ADDRESS: Optional[str] = None
    CONTROLLER_ADDRESS: Optional[str] = None
    
    # IPFS settings
    IPFS_API_URL: str
    
    # CORS settings
    CORS_ORIGINS: str
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()