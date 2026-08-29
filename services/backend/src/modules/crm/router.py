"""
The ssrone – CRM Router
Customer management and loyalty endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user, get_optional_user
from src.modules.auth.models import User
from src.modules.crm.models import Customer, CustomerAddress, CustomerInteraction, LoyaltyTransaction
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/crm", tags=["CRM"])


class CustomerCreateSchema(BaseModel):
    name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    password: str | None = None
    hashed_password: str | None = None
    address: dict | str | None = None
    city: str | None = None
    pincode: str | None = None
    tenant_id: int | None = None
    company_id: int | None = None
    branch_id: int | None = None


class CustomerResponse(BaseModel):
    id: int
    tenant_id: int
    company_id: int | None = None
    branch_id: int | None = None
    name: str
    phone: str
    email: str | None = None
    address: dict | str | None = None
    city: str | None = None
    pincode: str | None = None
    loyalty_points: int

    model_config = {"from_attributes": True}


@router.get("/customers")
async def list_customers(
    search: str | None = None,
    tenant_id: int | None = None,
    branch_id: int | None = None,
    company_id: int | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    resolved_tenant = tenant_id or (current_user.tenant_id if current_user else 1)
    query = select(Customer).where(
        Customer.tenant_id == resolved_tenant, Customer.is_deleted == False
    )
    if branch_id:
        query = query.where((Customer.branch_id == branch_id) | (Customer.branch_id == None))
    if company_id:
        query = query.where((Customer.company_id == company_id) | (Customer.company_id == None))
    if search:
        query = query.where(
            (Customer.name.ilike(f"%{search}%")) | (Customer.phone.ilike(f"%{search}%"))
        )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Customer.id.desc()).offset((page - 1) * page_size).limit(page_size)
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
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> CustomerResponse:
    resolved_tenant = body.tenant_id or (current_user.tenant_id if current_user else 1)
    resolved_company = body.company_id or getattr(current_user, "company_id", None)
    resolved_branch = body.branch_id or getattr(current_user, "branch_id", None)
    full_name = (body.name or f"{body.first_name or ''} {body.last_name or ''}").strip() or "Guest Customer"
    
    customer = Customer(
        tenant_id=resolved_tenant,
        company_id=resolved_company,
        branch_id=resolved_branch,
        name=full_name,
        email=body.email,
        phone=body.phone or "",
        loyalty_points=0,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return CustomerResponse.model_validate(customer)


class GuestCustomerCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: str | None = None
    phone: str
    tenant_id: int | None = None
    company_id: int | None = None
    branch_id: int | None = None


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

    full_name = f"{body.first_name} {body.last_name}".strip() or "Guest Customer"
    customer = Customer(
        tenant_id=body.tenant_id or 1,
        company_id=body.company_id,
        branch_id=body.branch_id,
        name=full_name,
        email=body.email,
        phone=body.phone,
        loyalty_points=0,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.get("/customers/check-phone")
async def check_customer_phone(
    phone: str,
    tenant: str | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    clean_phone = phone.replace("+91", "").replace("+", "").strip()
    query = select(Customer).where(
        (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == phone),
        Customer.is_deleted == False
    )
    result = await db.execute(query)
    found = result.scalars().first()
    if found:
        return {
            "exists": True,
            "id": found.id,
            "name": found.name,
            "phone": found.phone,
            "hasPassword": bool(found.hashed_password)
        }
    return {"exists": False}


class CustomerRegisterSchema(BaseModel):
    name: str
    phone: str
    password: str | None = None
    tenant_id: int | None = None
    address: dict | str | None = None
    city: str | None = None
    pincode: str | None = None


@router.post("/customers/register", response_model=dict)
async def register_customer(
    body: CustomerRegisterSchema,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    from passlib.hash import bcrypt
    clean_phone = body.phone.replace("+91", "").replace("+", "").strip()
    
    existing_q = select(Customer).where(
        (Customer.phone == clean_phone) | (Customer.phone == body.phone),
        Customer.is_deleted == False
    )
    found = (await db.execute(existing_q)).scalars().first()
    
    hashed_pwd = bcrypt.hash(body.password) if body.password else None
    addr_obj = {"address": body.address} if isinstance(body.address, str) else (body.address or {})
    
    if found:
        found.name = body.name or found.name
        if hashed_pwd:
            found.hashed_password = hashed_pwd
        if body.city:
            found.city = body.city
        if body.pincode:
            found.pincode = body.pincode
        if addr_obj:
            found.address = addr_obj
        await db.commit()
        await db.refresh(found)
        return {"success": True, "user": CustomerResponse.model_validate(found).model_dump()}

    customer = Customer(
        tenant_id=body.tenant_id or 2,
        name=body.name,
        phone=clean_phone,
        hashed_password=hashed_pwd,
        address=addr_obj,
        city=body.city,
        pincode=body.pincode,
        loyalty_points=100
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return {"success": True, "user": CustomerResponse.model_validate(customer).model_dump()}


class CustomerUpdateSchema(BaseModel):
    name: str | None = None
    email: str | None = None
    address: dict | str | None = None
    city: str | None = None
    pincode: str | None = None


@router.put("/customers/{customer_id}")
async def update_customer_profile(
    customer_id: str,
    body: CustomerUpdateSchema,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    try:
        cid = int(customer_id)
        q = select(Customer).where(Customer.id == cid, Customer.is_deleted == False)
    except ValueError:
        q = select(Customer).where(Customer.is_deleted == False).order_by(Customer.id.asc()).limit(1)

    found = (await db.execute(q)).scalars().first()
    if not found:
        raise HTTPException(status_code=404, detail="Customer not found")

    if body.name:
        found.name = body.name
    if body.email:
        found.email = body.email
    if body.city:
        found.city = body.city
    if body.pincode:
        found.pincode = body.pincode
    if body.address:
        found.address = {"fullAddress": body.address} if isinstance(body.address, str) else body.address

    await db.commit()
    await db.refresh(found)
    return {"success": True, "customer": CustomerResponse.model_validate(found).model_dump()}


class AddressCreateSchema(BaseModel):
    label: str = "Home"
    fullAddress: str
    city: str | None = "Mahendragarh"
    pincode: str | None = None


@router.get("/addresses")
async def list_customer_addresses(
    customer_id: int | None = None,
    db: AsyncSession = Depends(get_db_session)
):
    query = select(CustomerAddress).where(CustomerAddress.is_deleted == False)
    if customer_id:
        query = query.where(CustomerAddress.customer_id == customer_id)
    result = await db.execute(query)
    addrs = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "label": a.label,
            "address": a.area_street,
            "fullAddress": f"{a.area_street}, {a.city} - {a.pincode or ''}",
            "city": a.city,
            "pincode": a.pincode,
        }
        for a in addrs
    ]


@router.post("/addresses")
async def create_customer_address(
    body: AddressCreateSchema,
    customer_id: int | None = 1,
    db: AsyncSession = Depends(get_db_session)
):
    addr = CustomerAddress(
        tenant_id=2,
        customer_id=customer_id or 1,
        label=body.label,
        area_street=body.fullAddress,
        city=body.city or "Mahendragarh",
        pincode=body.pincode
    )
    db.add(addr)
    await db.commit()
    await db.refresh(addr)
    return {
        "id": str(addr.id),
        "label": addr.label,
        "address": addr.area_street,
        "fullAddress": body.fullAddress,
        "city": addr.city,
        "pincode": addr.pincode
    }


# Direct /customers alias router for Customer Food Web & POS Counter compatibility
customers_alias_router = APIRouter(prefix="/customers", tags=["Customers"])
customers_alias_router.add_api_route("", list_customers, methods=["GET"], response_model=dict)
customers_alias_router.add_api_route("", create_customer, methods=["POST"], response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
customers_alias_router.add_api_route("/guest", create_guest_customer, methods=["POST"], response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
customers_alias_router.add_api_route("/check-phone", check_customer_phone, methods=["GET"])
customers_alias_router.add_api_route("/register", register_customer, methods=["POST"])
customers_alias_router.add_api_route("/{customer_id}", update_customer_profile, methods=["PUT"])
customers_alias_router.add_api_route("/addresses", list_customer_addresses, methods=["GET"])
customers_alias_router.add_api_route("/addresses", create_customer_address, methods=["POST"])

# Direct /customer singular alias router for /customer/addresses
customer_singular_alias_router = APIRouter(prefix="/customer", tags=["Customer Addresses"])
customer_singular_alias_router.add_api_route("/addresses", list_customer_addresses, methods=["GET"])
customer_singular_alias_router.add_api_route("/addresses", create_customer_address, methods=["POST"])



