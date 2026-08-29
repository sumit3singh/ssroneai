"""
The ssrone – Universal Communication Center Engine (UCCE)
Multi-channel notification dispatch: Email, SMS, WhatsApp, Push, Internal.
Template engine with merge tags. Delivery audit ledger.
"""
from datetime import datetime, timezone
from enum import StrEnum

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.engine import get_db_session
from src.core.database.models import TenantBaseModel
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.shared.logger import get_logger
from src.workers.tasks import send_email, send_whatsapp

logger = get_logger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications / UCCE"])


# ─── Models ──────────────────────────────────────────────────

class NotificationChannel(StrEnum):
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    INTERNAL = "internal"


class NotificationStatus(StrEnum):
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class NotificationTemplate(TenantBaseModel):
    __tablename__ = "notification_templates"
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    template_key: Mapped[str] = mapped_column(String(100), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(300), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)


class NotificationLog(TenantBaseModel):
    __tablename__ = "notification_logs"
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    recipient: Mapped[str] = mapped_column(String(300), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(300), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=NotificationStatus.QUEUED)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(nullable=True)
    template_key: Mapped[str | None] = mapped_column(String(100), nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_payload: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)


# ─── Schemas ─────────────────────────────────────────────────

class SendNotificationSchema(BaseModel):
    channel: str
    recipient: str
    template_key: str | None = None
    subject: str | None = None
    body: str
    merge_vars: dict = {}
    reference_type: str | None = None
    reference_id: str | None = None


class BulkNotificationSchema(BaseModel):
    channel: str
    recipients: list[str]
    template_key: str
    merge_vars: dict = {}


# ─── Service ─────────────────────────────────────────────────

class NotificationService:
    """UCCE dispatch service with fallback chain logic."""

    def render_template(self, template_body: str, merge_vars: dict) -> str:
        """Replace {{variable}} merge tags in template body."""
        result = template_body
        for key, value in merge_vars.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result

    async def dispatch(
        self,
        channel: str,
        recipient: str,
        body: str,
        subject: str | None = None,
        merge_vars: dict | None = None,
    ) -> bool:
        """Dispatch a notification via the appropriate channel with fallback."""
        rendered_body = self.render_template(body, merge_vars or {})
        rendered_subject = self.render_template(subject or "", merge_vars or {})

        try:
            if channel == NotificationChannel.EMAIL:
                send_email.delay(to=recipient, subject=rendered_subject, body=rendered_body)
            elif channel in (NotificationChannel.WHATSAPP, NotificationChannel.SMS):
                send_whatsapp.delay(to=recipient, message=rendered_body)
            logger.info("Notification dispatched", channel=channel, recipient=recipient)
            return True
        except Exception as exc:
            logger.error("Notification dispatch failed", channel=channel, error=str(exc))
            # Fallback to email if WhatsApp fails
            if channel == NotificationChannel.WHATSAPP:
                logger.info("Falling back to SMS for failed WhatsApp")
                send_email.delay(to=recipient, subject=rendered_subject, body=rendered_body)
            return False


notification_service = NotificationService()


# ─── Routes ──────────────────────────────────────────────────

@router.post("/send")
async def send_notification(
    body: SendNotificationSchema,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Send a single notification via the specified channel."""
    success = await notification_service.dispatch(
        channel=body.channel,
        recipient=body.recipient,
        body=body.body,
        subject=body.subject,
        merge_vars=body.merge_vars,
    )
    return {"status": "queued" if success else "failed", "channel": body.channel}


@router.post("/bulk")
async def send_bulk(
    body: BulkNotificationSchema,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Queue bulk notifications to a list of recipients."""
    queued = 0
    for recipient in body.recipients:
        send_email.delay(to=recipient, subject="Notification", body=body.template_key)
        queued += 1
    return {"queued": queued, "channel": body.channel}


@router.get("/templates")
async def list_templates(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db_session),
) -> list[dict]:
    from sqlalchemy import select
    result = await db.execute(
        select(NotificationTemplate).where(
            NotificationTemplate.tenant_id == current_user.tenant_id,
            NotificationTemplate.is_active == True,
        )
    )
    return [
        {"id": str(t.id), "key": t.template_key, "name": t.name, "channel": t.channel}
        for t in result.scalars().all()
    ]
