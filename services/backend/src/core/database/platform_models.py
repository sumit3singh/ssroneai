"""
SQLAlchemy ORM Platform Models
Data models for Audit Logs, Notifications, Approvals, Installed Plugins, AI Memory, and Workflow Instances.
"""
from datetime import datetime
from typing import Any, Optional
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.models import BaseModel, TenantBaseModel


class AuditLogModel(TenantBaseModel):
    """Audit log entries tracking system entity changes."""
    __tablename__ = "audit_logs"

    event_name: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    before_state: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    after_state: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)


class NotificationModel(TenantBaseModel):
    """Outbound & in-app notification entries."""
    __tablename__ = "notifications"

    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ApprovalRequestModel(TenantBaseModel):
    """Hierarchical business approval requests."""
    __tablename__ = "approval_requests"

    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0, nullable=False)
    required_role: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    requested_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    approved_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class InstalledPluginModel(TenantBaseModel):
    """Installed tenant plugins & dynamic integration configs."""
    __tablename__ = "installed_plugins"

    plugin_id: Mapped[str] = mapped_column(String(100), nullable=False)
    plugin_name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    __table_args__ = (
        UniqueConstraint("tenant_id", "plugin_id", name="uq_tenant_plugin"),
    )


class AIConversationModel(TenantBaseModel):
    """Multi-turn conversation history & memory store."""
    __tablename__ = "ai_conversations"

    session_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(default=0)
    completion_tokens: Mapped[int] = mapped_column(default=0)


class WorkflowInstanceModel(TenantBaseModel):
    """Active workflow state machine instances."""
    __tablename__ = "workflow_instances"

    workflow_key: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    current_state: Mapped[str] = mapped_column(String(100), nullable=False)
    state_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    __table_args__ = (
        UniqueConstraint("tenant_id", "workflow_key", "entity_id", name="uq_tenant_workflow_entity"),
    )
