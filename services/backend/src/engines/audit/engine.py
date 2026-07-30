"""
Zero-Trust Compliance Audit Logger Engine
Persists immutable audit entries tracking entity state mutations in PostgreSQL database.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.platform_models import AuditLogModel
from src.core.logging.logger import logger


class AuditEngine:
    """Audit Engine recording zero-trust security & compliance audit events."""

    async def log_event(
        self,
        db: AsyncSession,
        event_name: str,
        user_id: Optional[int],
        tenant_id: int,
        entity_name: str,
        entity_id: str,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLogModel:
        """Persist audit event to PostgreSQL audit_logs table."""
        audit_entry = AuditLogModel(
            tenant_id=tenant_id,
            event_name=event_name,
            entity_name=entity_name,
            entity_id=entity_id,
            user_id=user_id,
            ip_address=ip_address,
            before_state=before_state,
            after_state=after_state,
        )
        db.add(audit_entry)
        await db.flush()
        logger.info("AUDIT_LOG_PERSISTED", event=event_name, entity=entity_name, entity_id=entity_id)
        return audit_entry


audit_engine = AuditEngine()
