"""
The Baithak – CRM Router
Customer management and loyalty endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.crm.models import Customer
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/crm", tags=["CRM"])


class CustomerCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    marketing_consent: bool = False


class CustomerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str | None
    phone: str | None
    loyalty_tier: str
    loyalty_points: int
    lifetime_spent: float
    total_visits: int

    model_config = {"from_attributes": True}


@router.get("/customers")
async def list_customers(
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    query = select(Customer).where(
        Customer.tenant_id == current_user.tenant_id, Customer.is_deleted == False
    )
    if search:
        query = query.where(
            (Customer.first_name.ilike(f"%{search}%")) | (Customer.phone.ilike(f"%{search}%"))
        )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    customers = result.scalars().all()

    return {
        "items": [CustomerResponse.model_validate(c) for c in customers],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    body: CustomerCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CustomerResponse:
    customer = Customer(
        tenant_id=current_user.tenant_id,
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        phone=body.phone,
        marketing_consent=body.marketing_consent,
        created_by=current_user.id,
    )
    db.add(customer)
    await db.flush()
    return CustomerResponse.model_validate(customer)


class GuestCustomerCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: str | None = None
    phone: str


@router.post("/guest", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_customer(
    body: GuestCustomerCreateSchema,
    db: AsyncSession = Depends(get_db_session),
) -> CustomerResponse:
    """Create a new customer profile from guest web app registration."""
    # Check if customer already exists by phone
    existing = await db.execute(
        select(Customer).where(Customer.phone == body.phone, Customer.is_deleted == False)
    )
    found = existing.scalar_one_or_none()
    if found:
        return CustomerResponse.model_validate(found)

    customer = Customer(
        tenant_id=1,
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        phone=body.phone,
        marketing_consent=True,
        created_by=1, # Default system admin
    )
    db.add(customer)
    await db.flush()
    return CustomerResponse.model_validate(customer)

