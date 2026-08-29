"""
The ssrone – Base ORM Models
Shared mixin classes providing audit fields, soft delete, and tenant isolation.
"""
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.engine import Base


class BigIntMixin:
    """Primary key using auto-incrementing BigInteger."""
    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True,
    )


class TimestampMixin:
    """Created/updated timestamps — auto-managed."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class AuditMixin(TimestampMixin):
    """Audit trail mixin — matches database schema columns."""
    created_by: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True
    )
    updated_by: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True
    )



class SoftDeleteMixin:
    """Soft delete mixin — matches database schema columns."""
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class TenantMixin:
    """Multi-tenancy — every row belongs to a tenant."""
    tenant_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        index=True,
    )


class BaseModel(BigIntMixin, AuditMixin, SoftDeleteMixin, Base):
    """
    Abstract base for all platform models.
    Includes: BigInt PK, timestamps, audit fields, soft delete.
    """
    __abstract__ = True
    __table_args__ = {"extend_existing": True}

    def to_dict(self) -> dict[str, Any]:
        """Convert model to dictionary."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class TenantBaseModel(BigIntMixin, TenantMixin, AuditMixin, SoftDeleteMixin, Base):
    """
    Abstract base for all tenant-scoped models.
    Includes everything from BaseModel + tenant_id for RLS.
    """
    __abstract__ = True
    __table_args__ = {"extend_existing": True}

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
