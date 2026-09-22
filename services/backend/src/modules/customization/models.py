"""
SSR One AI – Tenant App Configuration & Custom Domain Database Models
Single source of truth (SSOT) stored in PostgreSQL with Row-Level Security (RLS).
"""
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.models import TenantBaseModel


class TenantAppConfig(TenantBaseModel):
    """
    Tenant & Branch specific configuration for connected applications.
    Stores draft and published JSONB blobs for versioned site customization.
    """
    __tablename__ = "tenant_app_configs"

    branch_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, nullable=True, index=True
    )
    app_name: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # 'global', 'customer-food-web', 'customer-stay-web', 'kds-web', 'staff-web', 'token-order-web'
    draft_config: Mapped[dict] = mapped_column(
        JSONB, default=dict, nullable=False
    )
    published_config: Mapped[dict] = mapped_column(
        JSONB, default=dict, nullable=False
    )
    config_version: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "branch_id", "app_name", name="uq_tenant_branch_app_config"
        ),
        {"extend_existing": True},
    )


class TenantCustomDomain(TenantBaseModel):
    """
    Self-service custom domain bindings for customer-facing web applications.
    Maps arbitrary tenant domains (e.g. order.baithakcafe.com) to tenant & branch context.
    """
    __tablename__ = "tenant_custom_domains"

    branch_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, nullable=True, index=True
    )
    app_name: Mapped[str] = mapped_column(
        String(100), default="customer-food-web", nullable=False
    )  # 'customer-food-web', 'customer-stay-web'
    domain: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="pending_dns", nullable=False
    )  # 'pending_dns', 'verified', 'failed'
    record_type: Mapped[str] = mapped_column(
        String(20), default="CNAME", nullable=False
    )  # 'CNAME', 'A'
    target_value: Mapped[str] = mapped_column(
        String(255), default="connect.ssrone.app", nullable=False
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )

    __table_args__ = (
        UniqueConstraint("domain", name="uq_custom_domain"),
        {"extend_existing": True},
    )
