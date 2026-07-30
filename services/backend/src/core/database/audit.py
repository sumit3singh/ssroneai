from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.auth.models import AuditLog

async def log_audit(
    session: AsyncSession,
    tenant_id: int | None,
    user_id: int | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    old_values: dict[str, Any] | None = None,
    new_values: dict[str, Any] | None = None,
    metadata_payload: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    """
    Create a DB audit log entry for security and change tracking.
    Logs create, update, delete operations across all core modules.
    """
    log = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        old_values=old_values,
        new_values=new_values,
        metadata_payload=metadata_payload or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(log)
    await session.flush()
    return log
