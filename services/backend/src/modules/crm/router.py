"""
The ssrone – CRM Router
Customer management and loyalty endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    resolved_tenant = tenant_id if (getattr(current_user, "is_superadmin", False) and tenant_id) else current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CustomerResponse:
    resolved_tenant = body.tenant_id if (getattr(current_user, "is_superadmin", False) and body.tenant_id) else current_user.tenant_id
    resolved_company = body.company_id or getattr(current_user, "company_id", None)
    resolved_branch = body.branch_id or getattr(current_user, "branch_id", None)
    full_name = (body.name or f"{body.first_name or ''} {body.last_name or ''}").strip() or "Guest Customer"
    
    addr_obj = {"fullAddress": body.address} if isinstance(body.address, str) else (body.address or {})

    customer = Customer(
        tenant_id=resolved_tenant,
        company_id=resolved_company,
        branch_id=resolved_branch,
        name=full_name,
        email=body.email,
        phone=body.phone or "",
        address=addr_obj,
        city=body.city,
        pincode=body.pincode,
        loyalty_points=0,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    # Save to public.customer_addresses table if address is provided
    if body.address and isinstance(body.address, str) and body.address.strip():
        cust_addr = CustomerAddress(
            tenant_id=resolved_tenant,
            customer_id=customer.id,
            label="Default",
            area_street=body.address.strip(),
            city=body.city or "General",
            pincode=body.pincode,
            is_default=True,
        )
        db.add(cust_addr)
        await db.commit()

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
    phone: str | None = None
    address: dict | str | None = None
    city: str | None = None
    pincode: str | None = None


@router.put("/customers/{customer_id}")
async def update_customer_profile(
    customer_id: str,
    body: CustomerUpdateSchema,
    phone: str | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    target_phone = body.phone or phone
    clean_target_phone = "".join(filter(str.isdigit, target_phone)) if target_phone else ""
    if clean_target_phone.startswith("91") and len(clean_target_phone) == 12:
        clean_target_phone = clean_target_phone[2:]

    found = None
    # 1. Try resolving by numeric customer ID
    try:
        cid = int(customer_id)
        q = select(Customer).where(Customer.id == cid, Customer.is_deleted == False)
        found = (await db.execute(q)).scalars().first()
    except (ValueError, TypeError):
        pass

    # 2. Try resolving by phone number if ID lookup failed
    if not found and clean_target_phone:
        q_phone = select(Customer).where(
            (Customer.phone == clean_target_phone) |
            (Customer.phone == f"+91{clean_target_phone}") |
            (Customer.phone == target_phone),
            Customer.is_deleted == False
        )
        found = (await db.execute(q_phone)).scalars().first()

    # 3. If customer_id itself contains 10-digit phone digits
    if not found:
        digits_in_id = "".join(filter(str.isdigit, customer_id))
        if len(digits_in_id) >= 10:
            clean_id_phone = digits_in_id[-10:]
            q_digits = select(Customer).where(
                (Customer.phone == clean_id_phone) |
                (Customer.phone == f"+91{clean_id_phone}"),
                Customer.is_deleted == False
            )
            found = (await db.execute(q_digits)).scalars().first()

    if not found:
        raise HTTPException(status_code=404, detail="Customer not found in database")

    if body.name and body.name.strip():
        found.name = body.name.strip()
    if body.email:
        found.email = body.email.strip()
    if body.city:
        found.city = body.city.strip()
    if body.pincode:
        found.pincode = body.pincode.strip()
    if body.address:
        found.address = {"fullAddress": body.address} if isinstance(body.address, str) else body.address

    await db.commit()
    await db.refresh(found)
    return {"success": True, "customer": CustomerResponse.model_validate(found).model_dump()}


class AddressCreateSchema(BaseModel):
    label: str = "Home"
    flat_no: str | None = None
    area_street: str | None = None
    fullAddress: str | None = None
    landmark: str | None = None
    city: str | None = "Mahendragarh"
    state: str | None = "Haryana"
    pincode: str | None = None
    is_default: bool = False
    alternate_phone: str | None = None


@router.get("/addresses")
async def list_customer_addresses(
    customer_id: int | None = None,
    phone: str | None = None,
    db: AsyncSession = Depends(get_db_session)
):
    query = select(CustomerAddress).where(
        (CustomerAddress.is_deleted == False) | (CustomerAddress.is_deleted.is_(None))
    )
    if customer_id:
        query = query.where(CustomerAddress.customer_id == customer_id)
    elif phone:
        clean_phone = "".join(filter(str.isdigit, phone))
        if clean_phone.startswith("91") and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        cust_res = await db.execute(
            select(Customer.id).where(
                (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == phone),
                Customer.is_deleted == False
            )
        )
        found_cust_id = cust_res.scalar_one_or_none()
        if found_cust_id:
            query = query.where(CustomerAddress.customer_id == found_cust_id)
        else:
            return []

    result = await db.execute(query.order_by(CustomerAddress.is_default.desc(), CustomerAddress.id.desc()))
    addrs = result.scalars().all()
    
    formatted = []
    for a in addrs:
        parts = []
        if a.flat_no:
            parts.append(a.flat_no)
        if a.area_street:
            parts.append(a.area_street)
        if a.landmark:
            parts.append(f"Near {a.landmark}")
        if a.city:
            parts.append(a.city)
        if a.pincode:
            parts.append(a.pincode)
            
        full_addr = ", ".join(parts) if parts else (a.area_street or "Address")
        
        formatted.append({
            "id": str(a.id),
            "customer_id": a.customer_id,
            "label": a.label or "Home",
            "flat_no": a.flat_no or "",
            "area_street": a.area_street or "",
            "landmark": a.landmark or "",
            "city": a.city or "Mahendragarh",
            "state": a.state or "Haryana",
            "pincode": a.pincode or "",
            "is_default": bool(a.is_default),
            "address": a.area_street or full_addr,
            "fullAddress": full_addr,
        })
    return formatted


@router.post("/addresses")
async def create_customer_address(
    body: AddressCreateSchema,
    customer_id: int | None = None,
    phone: str | None = None,
    db: AsyncSession = Depends(get_db_session)
):
    eff_customer_id = customer_id
    if not eff_customer_id and phone:
        clean_phone = "".join(filter(str.isdigit, phone))
        if clean_phone.startswith("91") and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        cust_res = await db.execute(
            select(Customer).where(
                (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == phone),
                Customer.is_deleted == False
            )
        )
        found_cust = cust_res.scalar_one_or_none()
        if found_cust:
            eff_customer_id = found_cust.id

    if not eff_customer_id:
        eff_customer_id = 1

    cust_res = await db.execute(select(Customer).where(Customer.id == eff_customer_id))
    cust = cust_res.scalar_one_or_none()
    tenant_id = cust.tenant_id if cust and cust.tenant_id else 1

    # If is_default, unset other defaults for this customer
    if body.is_default:
        await db.execute(
            update(CustomerAddress)
            .where(CustomerAddress.customer_id == eff_customer_id)
            .values(is_default=False)
        )

    resolved_street = (body.area_street or body.fullAddress or "").strip()
    if not resolved_street:
        resolved_street = "Main Street"

    addr = CustomerAddress(
        tenant_id=tenant_id,
        customer_id=eff_customer_id,
        label=body.label or "Home",
        flat_no=body.flat_no,
        area_street=resolved_street,
        landmark=body.landmark,
        city=body.city or "Mahendragarh",
        state=body.state or "Haryana",
        pincode=body.pincode,
        is_default=body.is_default
    )
    db.add(addr)

    parts = []
    if body.flat_no:
        parts.append(body.flat_no)
    parts.append(resolved_street)
    if body.landmark:
        parts.append(f"Near {body.landmark}")
    if body.city:
        parts.append(body.city)
    if body.pincode:
        parts.append(body.pincode)
    full_addr = ", ".join(parts)

    if cust:
        cust.address = {
            "fullAddress": full_addr,
            "flat_no": body.flat_no,
            "area_street": resolved_street,
            "landmark": body.landmark,
            "city": body.city or "Mahendragarh",
            "pincode": body.pincode,
            "alternate_phone": body.alternate_phone
        }
        if body.city:
            cust.city = body.city
        if body.pincode:
            cust.pincode = body.pincode

    await db.commit()
    await db.refresh(addr)
    return {
        "id": str(addr.id),
        "customer_id": addr.customer_id,
        "label": addr.label,
        "flat_no": addr.flat_no or "",
        "area_street": addr.area_street,
        "landmark": addr.landmark or "",
        "city": addr.city,
        "state": addr.state,
        "pincode": addr.pincode,
        "is_default": addr.is_default,
        "address": addr.area_street,
        "fullAddress": full_addr,
        "alternate_phone": body.alternate_phone
    }


@router.delete("/addresses/{address_id}")
async def delete_customer_address(
    address_id: int,
    db: AsyncSession = Depends(get_db_session)
):
    addr_res = await db.execute(select(CustomerAddress).where(CustomerAddress.id == address_id))
    addr = addr_res.scalar_one_or_none()
    if addr:
        addr.is_deleted = True
        await db.commit()
        return {"status": "success", "message": f"Address {address_id} deleted"}
    return {"status": "not_found", "message": "Address not found"}


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
customers_alias_router.add_api_route("/addresses/{address_id}", delete_customer_address, methods=["DELETE"])

# Direct /customer singular alias router for /customer/addresses
customer_singular_alias_router = APIRouter(prefix="/customer", tags=["Customer Addresses"])
customer_singular_alias_router.add_api_route("/addresses", list_customer_addresses, methods=["GET"])
customer_singular_alias_router.add_api_route("/addresses", create_customer_address, methods=["POST"])
customer_singular_alias_router.add_api_route("/addresses/{address_id}", delete_customer_address, methods=["DELETE"])



