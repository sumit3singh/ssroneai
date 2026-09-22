"""
SSR One AI – Customization Pydantic Schemas
Defines request and response shapes for tenant app configuration and custom domains.
"""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class AppConfigDraftUpdate(BaseModel):
    """Payload to update draft configuration for an app."""
    draft_config: dict[str, Any] = Field(..., description="Draft configuration JSON payload")
    branch_id: Optional[int] = Field(default=None, description="Optional branch ID override")


class AppConfigPublishRequest(BaseModel):
    """Payload to publish draft configuration."""
    branch_id: Optional[int] = Field(default=None, description="Optional branch ID override")


class AppConfigResponse(BaseModel):
    """Response model for tenant app configuration in admin workspace."""
    id: str
    tenant_id: str
    branch_id: Optional[str] = None
    app_name: str
    draft_config: dict[str, Any]
    published_config: dict[str, Any]
    config_version: int
    published_at: Optional[datetime] = None
    is_draft_modified: bool = False


class PublicAppConfigResponse(BaseModel):
    """Response model for customer-facing connected applications."""
    tenant_id: str
    branch_id: Optional[str] = None
    app_name: str
    config: dict[str, Any]
    config_version: int
    is_draft: bool = False


class CustomDomainCreate(BaseModel):
    """Payload to register a new custom domain."""
    domain: str = Field(..., min_length=3, max_length=255, description="Domain or subdomain name")
    app_name: str = Field(default="customer-food-web", description="Connected app name")
    branch_id: Optional[int] = Field(default=None, description="Optional branch ID binding")


class DNSInstruction(BaseModel):
    """DNS record instruction to guide the tenant in registrar configuration."""
    record_type: str
    host: str
    target: str
    ttl: str
    notes: str


class CustomDomainResponse(BaseModel):
    """Response model for tenant custom domains."""
    id: str
    tenant_id: str
    branch_id: Optional[str] = None
    app_name: str
    domain: str
    status: str  # 'pending_dns', 'verified', 'failed'
    record_type: str  # 'CNAME', 'A'
    target_value: str
    verified_at: Optional[datetime] = None
    last_checked_at: Optional[datetime] = None
    error_message: Optional[str] = None
    dns_instruction: DNSInstruction


class DomainResolveResponse(BaseModel):
    """Host resolution response for reverse proxy routing."""
    domain: str
    tenant_id: str
    tenant_slug: str
    branch_id: Optional[str] = None
    branch_code: Optional[str] = None
    app_name: str
    status: str
