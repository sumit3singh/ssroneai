"""
Enterprise Health Check Probes Router
Provides /health/liveness and /health/readiness probes for Kubernetes & load balancers.
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.core.dependencies import get_db
from src.core.cache.redis import get_redis_client

router = APIRouter(prefix="/health", tags=["Health Checks"])


@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, str]:
    """Basic health check probe for load balancers."""
    return {"status": "UP"}


@router.get("/liveness", status_code=status.HTTP_200_OK)
async def liveness_probe() -> Dict[str, str]:
    """Liveness probe verifying application process is responsive."""
    return {"status": "UP", "probe": "liveness"}


@router.get("/readiness", status_code=status.HTTP_200_OK)
async def readiness_probe(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Readiness probe testing PostgreSQL database and Redis connectivity."""
    db_status = "DOWN"
    redis_status = "DOWN"

    try:
        await db.execute(text("SELECT 1"))
        db_status = "UP"
    except Exception:
        pass

    try:
        client = await get_redis_client()
        if await client.ping():
            redis_status = "UP"
    except Exception:
        pass

    if db_status == "DOWN":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "DOWN",
                "database": db_status,
                "redis": redis_status,
            },
        )

    return {
        "status": "UP",
        "database": db_status,
        "redis": redis_status,
    }
