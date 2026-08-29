"""
The ssrone – Core Platform Database Models
All platform-wide tables: tenants, companies, branches, users, roles, etc.
"""
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import BaseModel, TenantBaseModel


# ═══════════════════════════════════════════
# TENANT & ORGANIZATION
# ═══════════════════════════════════════════

class Tenant(BaseModel):
    """Top-level multi-tenant entity."""
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    plan: Mapped[str] = mapped_column(String(50), default="starter")  # starter, professional, enterprise
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSONB, default=dict)
    theme: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Relationships
    companies: Mapped[list["Company"]] = relationship("Company", back_populates="tenant")
    users: Mapped[list["User"]] = relationship("User", back_populates="tenant")


class Company(TenantBaseModel):
    """A legal entity under a tenant (may have multiple GST registrations)."""
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pan: Mapped[str | None] = mapped_column(String(30), nullable=True)
    cin: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[dict] = mapped_column(JSONB, default=dict)
    country_code: Mapped[str] = mapped_column(String(3), default="IN")
    currency_code: Mapped[str] = mapped_column(String(3), default="INR")
    fiscal_year_start: Mapped[str] = mapped_column(String(5), default="04-01")  # MM-DD
    business_type: Mapped[str] = mapped_column(String(50), default="restaurant")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSONB, default=dict)

    # FK
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("tenants.id"), nullable=False
    )
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="companies")
    branches: Mapped[list["Branch"]] = relationship("Branch", back_populates="company")


class Branch(TenantBaseModel):
    """A physical location or outlet under a company."""
    __tablename__ = "branches"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    branch_type: Mapped[str] = mapped_column(String(50), default="outlet")  # outlet, warehouse, franchise
    address: Mapped[dict] = mapped_column(JSONB, default=dict)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSONB, default=dict)
    operating_hours: Mapped[dict] = mapped_column(JSONB, default=dict)

    # FK
    company_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("companies.id"), nullable=False
    )
    company: Mapped["Company"] = relationship("Company", back_populates="branches")

    __table_args__ = (
        UniqueConstraint("tenant_id", "company_id", "code", name="uq_branch_code"),
    )


# ═══════════════════════════════════════════
# USERS & AUTHENTICATION
# ═══════════════════════════════════════════

class Role(TenantBaseModel):
    """User role with RBAC permissions."""
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    permissions: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=False)

    users: Mapped[list["UserRole"]] = relationship("UserRole", back_populates="role")


class User(TenantBaseModel):
    """Platform user — can be an owner, manager, cashier, or customer-facing."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata")
    last_login_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)

    # FK
    tenant_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("tenants.id"), nullable=False
    )
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")
    roles: Mapped[list["UserRole"]] = relationship("UserRole", back_populates="user")
    sessions: Mapped[list["UserSession"]] = relationship("UserSession", back_populates="user")

    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_email_per_tenant"),
    )


class UserRole(TenantBaseModel):
    """Many-to-many: User ↔ Role with optional branch scope."""
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False
    )
    role_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("roles.id"), nullable=False
    )
    branch_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("branches.id"), nullable=True
    )
    company_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("companies.id"), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="roles")
    role: Mapped["Role"] = relationship("Role", back_populates="users")


class UserSession(TenantBaseModel):
    """Active user sessions for revocation and device management."""
    __tablename__ = "user_sessions"

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False
    )
    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    device_info: Mapped[dict] = mapped_column(JSONB, default=dict)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_used_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


# ═══════════════════════════════════════════
# FEATURE & LICENSE MANAGEMENT
# ═══════════════════════════════════════════

class FeatureMaster(BaseModel):
    """Catalog of all platform features/modules."""
    __tablename__ = "feature_master"

    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    dependencies: Mapped[list] = mapped_column(JSONB, default=list)
    is_core: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class FeatureLicense(TenantBaseModel):
    """Maps licensed features to tenants with expiry."""
    __tablename__ = "feature_licenses"

    feature_code: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    max_users: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_branches: Mapped[int | None] = mapped_column(Integer, nullable=True)
    config: Mapped[dict] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        UniqueConstraint("tenant_id", "feature_code", name="uq_feature_license"),
    )


# ═══════════════════════════════════════════
# AUDIT & EVENT STORE
# ═══════════════════════════════════════════

class AuditLog(BaseModel):
    """Immutable audit trail for all state changes."""
    __tablename__ = "audit_logs"

    tenant_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    user_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)   # CREATE, UPDATE, DELETE, LOGIN
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    old_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    metadata_payload: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)


class EventStore(BaseModel):
    """Durable event log for the Event Bus."""
    __tablename__ = "event_store"

    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tenant_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING, PROCESSED, FAILED
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    source_module: Mapped[str | None] = mapped_column(String(100), nullable=True)
    correlation_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    processed_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)


class FileMasterERP(TenantBaseModel):
    """SAP-style ERP metadata configuration table for menus, screens, reports, permissions, and workflows."""
    __tablename__ = "file_master_erp"

    code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    href: Mapped[str] = mapped_column(String(300), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="core")  # core, platform, connected
    parent_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    required_permission: Mapped[str | None] = mapped_column(String(100), nullable=True)
    required_feature: Mapped[str | None] = mapped_column(String(100), nullable=True)
    type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # master, transaction, report

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_file_master_erp_code"),
    )
