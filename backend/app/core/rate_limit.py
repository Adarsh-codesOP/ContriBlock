from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import redis.asyncio as redis
import time
from typing import Callable, Dict, Optional, Union

from app.core.config import settings


class RateLimiter:
    def __init__(self, times: int = 5, seconds: int = 60):
        self.times = times  # Number of requests allowed
        self.seconds = seconds  # Time window in seconds
        self.redis_pool = None
    
    async def init_redis_pool(self):
        if self.redis_pool is None:
            self.redis_pool = await redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    
    async def _is_rate_limited(self, key: str) -> bool:
        await self.init_redis_pool()
        
        # Get the current count for this key
        current = await self.redis_pool.get(key)
        
        if current is None:
            # First request, set to 1 with expiry
            await self.redis_pool.set(key, 1, ex=self.seconds)
            return False
        
        current_count = int(current)
        if current_count >= self.times:
            # Rate limit exceeded
            return True
        
        # Increment the count
        await self.redis_pool.incr(key)
        return False
    
    async def __call__(self, request: Request):
        # Get client IP or use a unique identifier
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}:{request.url.path}"
        
        is_limited = await self._is_rate_limited(key)
        
        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )


def rate_limited(times: int = 5, seconds: int = 60):
    limiter = RateLimiter(times, seconds)
    
    async def rate_limit_dependency(request: Request):
        await limiter(request)
    
    return rate_limit_dependency