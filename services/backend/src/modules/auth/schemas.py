"""
The Baithak – Auth Pydantic Schemas
Request/response models for authentication endpoints.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    tenant_slug: str = Field(description="The tenant's slug identifier")
    device_info: dict = Field(default_factory=dict)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token TTL in seconds")
    user: "UserProfile"


class TokenPayload(BaseModel):
    sub: str
    tenant_id: str | int
    email: str | None = None
    session_id: str | None = None
    exp: int | None = None
    type: str = "access"



class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: object) -> str:
        data = getattr(info, "data", {})
        if "new_password" in data and v != data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class UserProfile(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    display_name: str | None
    avatar_url: str | None
    is_active: bool
    is_verified: bool
    tenant_id: int
    language: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    tenant_name: str = Field(min_length=2, max_length=200)
    tenant_slug: str = Field(min_length=2, max_length=50, pattern=r"^[a-z0-9-]+$")
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None


class SessionInfo(BaseModel):
    id: int
    device_info: dict
    ip_address: str | None
    is_active: bool
    last_used_at: datetime | None
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class FeatureLicenseCreate(BaseModel):
    tenant_id: int
    feature_code: str
    is_active: bool = True
    expires_at: datetime | None = None
    max_users: int | None = None
    max_branches: int | None = None
    config: dict = Field(default_factory=dict)


class FeatureLicenseUpdate(BaseModel):
    is_active: bool | None = None
    expires_at: datetime | None = None
    max_users: int | None = None
    max_branches: int | None = None
    config: dict | None = None


class FeatureLicenseResponse(BaseModel):
    id: int
    tenant_id: int
    feature_code: str
    is_active: bool
    expires_at: datetime | None = None
    max_users: int | None = None
    max_branches: int | None = None
    config: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FeatureMasterCreate(BaseModel):
    code: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    category: str = Field(default="custom")
    dependencies: list[str] = Field(default_factory=list)
    is_core: bool = False
    is_active: bool = True


class FeatureMasterResponse(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    category: str
    dependencies: list
    is_core: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


