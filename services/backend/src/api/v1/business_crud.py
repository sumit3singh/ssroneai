"""
Generic FastAPI Master & Transaction Business CRUD Router
Handles full RESTful CRUD operations (GET list, GET by ID, POST create, PUT update, DELETE soft-delete)
for all 38 business entities across The ssrone Ecosystem.
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.engine import get_db_session
from src.modules.auth.models import (
    Tenant, Company, Branch, Role, User, UserRole, UserSession,
    FeatureMaster, FeatureLicense, FileMasterERP
)
from src.modules.restaurant.models import MenuCategory, MenuItem
from src.modules.orders.models import Order, OrderItem, OrderPayment, KitchenStation
from src.ai.copilot.models import AIPromptTemplate
from src.modules.hotel.models import RoomType, Room, Guest, Reservation
from src.modules.pg_management.models import PGFloor, PGRoom, PGBed, PGResident, PGRentRecord, PGVisitorLog
from src.modules.inventory.models import ProductCategory, Product, StockEntry, StockMovement, ProductionBatch
from src.modules.billing.models import Invoice, InvoiceItem, InvoicePayment
from src.modules.finance.models import ChartOfAccounts, JournalEntry, BudgetEntry
from src.modules.crm.models import Customer, CustomerAddress, Campaign, CustomerInteraction, LoyaltyTransaction
from src.modules.hrms.models import Department, Designation, Employee, Shift, AttendanceRecord, LeaveType, LeaveRequest, PayrollRun, Payslip
from src.core.database.business_models import (
    MenuItemModel, POSOrderModel, HotelRoomModel, HotelReservationModel,
    InventoryItemModel, InvoiceModel, CustomerModel, EmployeeModel, PGBedModel, FinancialYearModel
)
from src.core.database.platform_models import (
    AuditLogModel, NotificationModel, ApprovalRequestModel, InstalledPluginModel
)

router = APIRouter(prefix="/business", tags=["Master & Transaction Business CRUD"])

MODEL_MAP: Dict[str, Any] = {
    # Auth & Platform
    "tenants": Tenant,
    "companies": Company,
    "branches": Branch,
    "roles": Role,
    "users": User,
    "user-roles": UserRole,
    "feature-licenses": FeatureLicense,
    "file-master-erp": FileMasterERP,
    "financial-years": FinancialYearModel,
    "audit-logs": AuditLogModel,
    "notifications": NotificationModel,
    "approval-requests": ApprovalRequestModel,
    "installed-plugins": InstalledPluginModel,

    # POS & Universal Billing
    "menu-categories": MenuCategory,
    "menu-items": MenuItemModel,
    "kitchen-stations": KitchenStation,
    "ai-prompt-templates": AIPromptTemplate,
    "pos-orders": Order,
    "order-items": OrderItem,
    "order-payments": OrderPayment,

    # Hotel PMS
    "room-types": RoomType,
    "hotel-rooms": HotelRoomModel,
    "guests": Guest,
    "hotel-reservations": HotelReservationModel,

    # PG Management
    "pg-floors": PGFloor,
    "pg-rooms": PGRoom,
    "pg-beds": PGBedModel,
    "pg-residents": PGResident,
    "pg-rent": PGRentRecord,
    "pg-visitor-logs": PGVisitorLog,

    # Inventory & Batch Tracking
    "product-categories": ProductCategory,
    "inventory-items": InventoryItemModel,
    "stock-entries": StockEntry,
    "stock-movements": StockMovement,
    "production-batches": ProductionBatch,

    # Billing & Finance
    "invoices": InvoiceModel,
    "invoice-items": InvoiceItem,
    "invoice-payments": InvoicePayment,
    "chart-of-accounts": ChartOfAccounts,
    "journal-entries": JournalEntry,
    "budget-entries": BudgetEntry,

    # CRM
    "customers": CustomerModel,
    "customer-addresses": CustomerAddress,
    "campaigns": Campaign,
    "customer-interactions": CustomerInteraction,
    "loyalty-transactions": LoyaltyTransaction,

    # HRMS
    "departments": Department,
    "designations": Designation,
    "employees": EmployeeModel,
    "shifts": Shift,
    "attendance": AttendanceRecord,
    "leave-types": LeaveType,
    "leave-requests": LeaveRequest,
    "payroll": PayrollRun,
    "payslips": Payslip,
}


@router.get("/{entity_key}", status_code=status.HTTP_200_OK)
async def list_entities(
    entity_key: str,
    tenant_id: Optional[int] = None,
    company_id: Optional[int] = None,
    limit: int = 500,
    offset: int = 0,
    db: AsyncSession = Depends(get_db_session),
) -> List[Dict[str, Any]]:
    """List records for any master or transaction entity from PostgreSQL."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_key}' is not recognized.",
        )

    stmt = select(model).limit(limit).offset(offset)
    if tenant_id is not None and hasattr(model, "tenant_id"):
        stmt = stmt.where(model.tenant_id == tenant_id)
    if company_id is not None and hasattr(model, "company_id"):
        stmt = stmt.where(model.company_id == company_id)
    if hasattr(model, "is_deleted"):
        stmt = stmt.where(model.is_deleted == False)

    result = await db.execute(stmt)
    records = result.scalars().all()
    return [
        {col.name: getattr(row, col.name) for col in row.__table__.columns}
        for row in records
    ]


@router.get("/{entity_key}/{entity_id}", status_code=status.HTTP_200_OK)
async def get_entity(
    entity_key: str,
    entity_id: int,
    tenant_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """Retrieve a single master or transaction entity record by ID."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_key}' not found.")

    stmt = select(model).where(model.id == entity_id)
    if tenant_id is not None and hasattr(model, "tenant_id"):
        stmt = stmt.where(model.tenant_id == tenant_id)
    if hasattr(model, "is_deleted"):
        stmt = stmt.where(model.is_deleted == False)

    res = await db.execute(stmt)
    instance = res.scalar_one_or_none()
    if not instance:
        raise HTTPException(status_code=404, detail=f"Record #{entity_id} not found.")

    return {col.name: getattr(instance, col.name) for col in instance.__table__.columns}


@router.post("/{entity_key}", status_code=status.HTTP_201_CREATED)
async def create_entity(
    entity_key: str,
    payload: Dict[str, Any],
    request: Request,
    tenant_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """Create a new master or transaction record in PostgreSQL, auto-populating tenant, company, branch context."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_key}' is not recognized.",
        )

    co_hdr = request.headers.get("x-company-id")
    br_hdr = request.headers.get("x-branch-id")
    fy_hdr = request.headers.get("x-fin-year")

    # Cast integer fields if passed as strings or numbers
    for field in ["tenant_id", "company_id", "branch_id", "created_by", "updated_by"]:
        if field in payload and payload[field] is not None:
            try:
                payload[field] = int(payload[field])
            except (ValueError, TypeError):
                pass

    if hasattr(model, "tenant_id") and "tenant_id" not in payload and tenant_id is not None:
        payload["tenant_id"] = tenant_id

    if co_hdr and hasattr(model, "company_id") and "company_id" not in payload:
        try:
            payload["company_id"] = int(co_hdr)
        except ValueError:
            pass

    if br_hdr and hasattr(model, "branch_id") and "branch_id" not in payload:
        try:
            payload["branch_id"] = int(br_hdr)
        except ValueError:
            pass

    if fy_hdr and hasattr(model, "fin_year_code") and "fin_year_code" not in payload:
        payload["fin_year_code"] = fy_hdr

    # Filter payload to only include valid column attributes of the model
    valid_cols = {col.name for col in model.__table__.columns}
    filtered_payload = {k: v for k, v in payload.items() if k in valid_cols}

    # Safely truncate string values if they exceed SQLAlchemy column length constraints
    for col in model.__table__.columns:
        if col.name in filtered_payload and isinstance(filtered_payload[col.name], str):
            max_len = getattr(col.type, "length", None)
            if max_len is not None and isinstance(max_len, int) and max_len > 0:
                if len(filtered_payload[col.name]) > max_len:
                    filtered_payload[col.name] = filtered_payload[col.name][:max_len]

    # Hard safety limits matching physical PostgreSQL DDL table column constraints
    MAX_CAPS = {"cin": 21, "gstin": 15, "pan": 10, "code": 20, "country_code": 3, "currency_code": 3}
    for col_name, max_c in MAX_CAPS.items():
        if col_name in filtered_payload and isinstance(filtered_payload[col_name], str):
            if len(filtered_payload[col_name]) > max_c:
                filtered_payload[col_name] = filtered_payload[col_name][:max_c]

    if entity_key == "users":
        raw_pwd = payload.get("password") or payload.get("hashed_password") or "admin123"
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if not (isinstance(raw_pwd, str) and (raw_pwd.startswith("$2b$") or raw_pwd.startswith("$2a$"))):
            filtered_payload["hashed_password"] = pwd_context.hash(str(raw_pwd))
        else:
            filtered_payload["hashed_password"] = raw_pwd

        if "is_active" not in filtered_payload:
            filtered_payload["is_active"] = True
        if "first_name" not in filtered_payload or not filtered_payload["first_name"]:
            filtered_payload["first_name"] = payload.get("display_name") or payload.get("adminName") or "Tenant"
        if "last_name" not in filtered_payload:
            filtered_payload["last_name"] = "Admin"

    try:
        instance = model(**filtered_payload)
        db.add(instance)
        await db.commit()
        await db.refresh(instance)
    except Exception as err:
        await db.rollback()
        print(f"Error creating {entity_key}:", err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database save error for {entity_key}: {str(err)}"
        )

    if entity_key == "tenants":
        try:
            settings_dict = payload.get("settings") if isinstance(payload.get("settings"), dict) else {}
            admin_name = settings_dict.get("admin_name") or payload.get("adminName") or f"{instance.name} Admin"
            admin_email = settings_dict.get("admin_email") or payload.get("adminEmail") or f"admin@{instance.slug}.com"
            admin_phone = settings_dict.get("admin_phone") or payload.get("adminPhone") or ""
            admin_password = settings_dict.get("admin_password") or payload.get("adminPassword") or "Admin@123"

            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

            # 1. Company
            new_co = Company(
                tenant_id=instance.id,
                name=f"{instance.name} Private Limited",
                legal_name=f"{instance.name} Group",
                country_code="IN",
                currency_code="INR",
                is_active=True
            )
            db.add(new_co)
            await db.flush()

            # 2. Branch
            new_br = Branch(
                tenant_id=instance.id,
                company_id=new_co.id,
                name=f"Main Outlet - {instance.name}",
                code="MAIN-01",
                timezone="Asia/Kolkata",
                is_active=True
            )
            db.add(new_br)
            await db.flush()

            # 3. Superadmin Role
            new_role = Role(
                tenant_id=instance.id,
                name="SUPER_ADMIN",
                code="super_admin",
                description="Super Admin Role",
                is_system_role=True,
                permissions={"*": ["*"]}
            )
            db.add(new_role)
            await db.flush()

            # 4. Superadmin User
            name_parts = admin_name.strip().split()
            f_name = name_parts[0] if name_parts else "Admin"
            l_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "User"

            new_admin = User(
                tenant_id=instance.id,
                company_id=new_co.id,
                branch_id=new_br.id,
                role_id=new_role.id,
                email=admin_email.strip().lower(),
                display_name=admin_name,
                first_name=f_name,
                last_name=l_name,
                phone=admin_phone,
                hashed_password=pwd_context.hash(admin_password),
                is_superadmin=True,
                is_active=True,
                is_verified=True
            )
            db.add(new_admin)
            await db.flush()

            # 5. UserRole Binding
            db.add(UserRole(
                tenant_id=instance.id,
                user_id=new_admin.id,
                role_id=new_role.id,
                company_id=new_co.id,
                branch_id=new_br.id
            ))
            await db.commit()
            print(f"✅ Onboarded Tenant #{instance.id} '{instance.name}' with Superadmin user '{admin_email}'")
        except Exception as t_err:
            print("Tenant auto-provisioning warning:", t_err)

    if entity_key == "users":
        try:
            t_id = getattr(instance, "tenant_id", 1)
            co_id = payload.get("company_id")
            br_id = payload.get("branch_id")
            r_id = payload.get("role_id")

            if not r_id:
                role_res = await db.execute(select(Role).where(Role.tenant_id == t_id))
                found_role = role_res.scalars().first()
                if found_role:
                    r_id = found_role.id
                else:
                    new_role = Role(
                        tenant_id=t_id,
                        name=payload.get("role_name") or "Tenant Admin",
                        code="tenant_admin",
                        description="Tenant Admin Role"
                    )
                    db.add(new_role)
                    await db.flush()
                    r_id = new_role.id

            user_role = UserRole(
                user_id=instance.id,
                role_id=int(r_id),
                tenant_id=t_id,
                company_id=int(co_id) if co_id else None,
                branch_id=int(br_id) if br_id else None
            )
            db.add(user_role)
            await db.commit()
        except Exception as u_err:
            print("UserRole binding warning:", u_err)

    return {col.name: getattr(instance, col.name) for col in instance.__table__.columns}



@router.put("/{entity_key}/{entity_id}", status_code=status.HTTP_200_OK)
async def update_entity(
    entity_key: str,
    entity_id: int,
    payload: Dict[str, Any],
    tenant_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """Update an existing master or transaction record in PostgreSQL."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_key}' not found.")

    stmt = select(model).where(model.id == entity_id)
    if tenant_id is not None and hasattr(model, "tenant_id"):
        stmt = stmt.where(model.tenant_id == tenant_id)
    if hasattr(model, "is_deleted"):
        stmt = stmt.where(model.is_deleted == False)

    res = await db.execute(stmt)
    instance = res.scalar_one_or_none()
    if not instance:
        raise HTTPException(status_code=404, detail=f"Record #{entity_id} not found.")

    for key, val in payload.items():
        if hasattr(instance, key) and key not in ("id", "tenant_id", "created_at"):
            setattr(instance, key, val)

    await db.commit()
    return {col.name: getattr(instance, col.name) for col in instance.__table__.columns}


@router.delete("/{entity_key}/{entity_id}", status_code=status.HTTP_200_OK)
async def delete_entity(
    entity_key: str,
    entity_id: int,
    tenant_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db_session),
) -> Dict[str, Any]:
    """Soft-delete a record in PostgreSQL."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_key}' not found.")

    stmt = select(model).where(model.id == entity_id)
    if tenant_id is not None and hasattr(model, "tenant_id"):
        stmt = stmt.where(model.tenant_id == tenant_id)

    res = await db.execute(stmt)
    instance = res.scalar_one_or_none()
    if not instance:
        raise HTTPException(status_code=404, detail=f"Record #{entity_id} not found.")

    if hasattr(instance, "is_deleted"):
        instance.is_deleted = True
    else:
        await db.delete(instance)

    await db.commit()
    return {"message": f"Record #{entity_id} deleted successfully."}
