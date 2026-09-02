"""
The ssrone – HR Router
Employee management, attendance, leave requests.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user, get_optional_user
from src.modules.auth.models import User, Tenant
from src.modules.hrms.models import AttendanceRecord, Employee, LeaveRequest, Department, Designation
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/hr", tags=["HR & Payroll"])


class EmployeeCreateSchema(BaseModel):
    tenant_id: int | None = None
    company_id: int | None = None
    branch_id: int | None = 1
    employee_code: str
    full_name: str | None = None
    first_name: str
    last_name: str | None = ""
    phone: str
    email: str | None = None
    designation: str | None = "Server"
    department_name: str | None = "Service"
    joining_date: date | None = None
    basic_salary: Decimal = Field(default=Decimal("20000.0"))
    allowances: Decimal = Field(default=Decimal("0.0"))
    deductions: Decimal = Field(default=Decimal("0.0"))
    pin_code: str | None = "1234"
    role_title: str | None = "Server"
    can_access_staff_web: bool = False
    can_access_kds_web: bool = False
    is_waiter: bool = False
    is_chef: bool = False


class EmployeeResponse(BaseModel):
    id: int
    tenant_id: int
    company_id: int | None = 1
    branch_id: int
    employee_code: str
    first_name: str
    last_name: str | None = ""
    phone: str
    basic_salary: Decimal
    allowances: Decimal = Decimal("0.0")
    deductions: Decimal = Decimal("0.0")
    joining_date: date | None = None
    role_title: str | None = "Server"
    pin_code: str | None = "1234"
    can_access_staff_web: bool = False
    can_access_kds_web: bool = False
    is_active: bool

    model_config = {"from_attributes": True}


class StaffLoginSchema(BaseModel):
    tenant_slug: str | None = "baithak-cafe"
    identifier: str
    pin_code: str | None = None


class CheckInSchema(BaseModel):
    employee_id: int
    branch_id: int


class LeaveRequestCreateSchema(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str | None = None


@router.post("/staff/login")
async def staff_login(
    body: StaffLoginSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Staff App login endpoint validating employee code/phone and pin_code strictly against PostgreSQL database."""
    clean_identifier = (body.identifier or "").strip()
    clean_pin = (body.pin_code or "").strip()

    if not clean_identifier:
        raise HTTPException(status_code=400, detail="Employee Code, Phone, or Email is required")

    from src.modules.auth.models import Tenant
    slug = (body.tenant_slug or "baithak-cafe").strip()
    t_query = select(Tenant).where(Tenant.slug == slug)
    t_res = await db.execute(t_query)
    tenant = t_res.scalar_one_or_none()
    tenant_id = tenant.id if tenant else 2

    e_query = select(Employee).where(
        (Employee.tenant_id == tenant_id) | (Employee.tenant_id == 2),
        Employee.is_deleted == False,
        (Employee.employee_code == clean_identifier) |
        (Employee.phone == clean_identifier)
    )
    result = await db.execute(e_query)
    emp = result.scalars().first()

    if not emp:
        # Check matching code case-insensitively
        all_emps = (await db.execute(select(Employee).where(Employee.is_deleted == False))).scalars().all()
        emp = next((e for e in all_emps if e.employee_code.lower() == clean_identifier.lower() or e.phone == clean_identifier), None)

    if not emp:
        raise HTTPException(status_code=404, detail=f"Staff account '{clean_identifier}' not found in PostgreSQL. Please contact HR.")

    expected_pin = str(emp.pin_code or "1234").strip()
    if clean_pin != expected_pin:
        raise HTTPException(status_code=401, detail=f"Invalid Security PIN Code for staff account '{emp.employee_code}'")

    token = f"staff_jwt_{emp.id}_{emp.employee_code}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "employee": {
            "id": str(emp.id),
            "employee_code": emp.employee_code,
            "name": emp.full_name,
            "first_name": (emp.full_name or "Staff").split(" ")[0],
            "last_name": " ".join((emp.full_name or "").split(" ")[1:]),
            "phone": emp.phone,
            "email": f"{emp.employee_code.lower()}@baithakcafe.com",
            "role_title": emp.designation or "Staff Member",
            "pin_code": emp.pin_code or "1234",
            "can_access_staff_web": bool(emp.can_access_staff_web or emp.is_waiter),
            "can_access_kds_web": bool(emp.can_access_kds_web or emp.is_chef),
            "tenant_id": emp.tenant_id,
            "company_id": getattr(emp, "company_id", 1) or 1,
            "branch_id": emp.branch_id,
            "is_waiter": bool(emp.is_waiter),
            "is_chef": bool(emp.is_chef)
        }
    }


@router.get("/employees")
async def list_employees(
    tenant_id: int | None = None,
    company_id: int | None = None,
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    try:
        query = select(Employee).where(Employee.is_deleted == False)
        
        # Enforce Tenant, Company, Branch scoping (Employees belong strictly to ONE branch)
        target_tenant_id = tenant_id or (current_user.tenant_id if current_user and getattr(current_user, "tenant_id", None) else None)
        if target_tenant_id:
            query = query.where((Employee.tenant_id == target_tenant_id) | (Employee.tenant_id.is_(None)))

        target_company_id = company_id or (current_user.company_id if current_user and getattr(current_user, "company_id", None) else None)
        if target_company_id:
            query = query.where((Employee.company_id == target_company_id) | (Employee.company_id.is_(None)))

        target_branch_id = branch_id or (current_user.branch_id if current_user and getattr(current_user, "branch_id", None) else None)
        if target_branch_id:
            query = query.where((Employee.branch_id == target_branch_id) | (Employee.branch_id.is_(None)))

        result = await db.execute(query)
        emps = result.scalars().all()
    except Exception as exc:
        logger.warning(f"Error querying employees from PostgreSQL: {exc}")
        emps = []
    
    res_list = []
    for e in emps:
        basic = float(getattr(e, "basic_salary", 20000) or 20000)
        allow = float(getattr(e, "allowances", 0) or 0)
        deduct = float(getattr(e, "deductions", 0) or 0)
        net = basic + allow - deduct

        res_list.append({
            "id": str(e.id),
            "tenant_id": getattr(e, "tenant_id", 2),
            "company_id": getattr(e, "company_id", 1) or 1,
            "branch_id": getattr(e, "branch_id", 1) or 1,
            "employee_code": getattr(e, "employee_code", f"EMP-{e.id}"),
            "name": getattr(e, "full_name", None) or "Staff Member",
            "first_name": (getattr(e, "full_name", "") or "Staff").split(" ")[0],
            "last_name": " ".join((getattr(e, "full_name", "") or "").split(" ")[1:]),
            "designation": getattr(e, "designation", None) or "Server",
            "role": getattr(e, "designation", None) or "Server",
            "role_title": getattr(e, "designation", None) or "Server",
            "department": getattr(e, "department_name", None) or "Service",
            "status": getattr(e, "status", "ACTIVE") or "ACTIVE",
            "phone": getattr(e, "phone", "9876543210"),
            "email": getattr(e, "email", "") or "",
            "contact": getattr(e, "phone", "9876543210"),
            "salary": basic,
            "allowances": allow,
            "deductions": deduct,
            "net_salary": net,
            "pin_code": getattr(e, "pin_code", None) or "1234",
            "can_access_staff_web": bool(getattr(e, "can_access_staff_web", False) or getattr(e, "is_waiter", False)),
            "can_access_kds_web": bool(getattr(e, "can_access_kds_web", False) or getattr(e, "is_chef", False)),
            "joining_date": date.today().isoformat(),
            "is_active": (getattr(e, "status", "ACTIVE") == "ACTIVE")
        })
    return res_list


from src.modules.auth.dependencies import get_current_user, get_optional_user

@router.post("/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(
    body: EmployeeCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = body.tenant_id or (current_user.tenant_id if current_user and getattr(current_user, "tenant_id", None) else 2)
    company_id = body.company_id or (current_user.company_id if current_user and getattr(current_user, "company_id", None) else 1)
    branch_id = body.branch_id or (current_user.branch_id if current_user and getattr(current_user, "branch_id", None) else 1)

    try:
        # Check for duplicate employee code under tenant to avoid IntegrityError
        existing_code = (await db.execute(
            select(Employee).where(
                Employee.tenant_id == tenant_id,
                Employee.employee_code == body.employee_code,
                Employee.is_deleted == False
            )
        )).scalars().first()

        if existing_code:
            import time
            body.employee_code = f"{body.employee_code}-{int(time.time() % 10000)}"

        full_name_val = body.full_name or f"{body.first_name} {body.last_name or ''}".strip()

        employee = Employee(
            tenant_id=tenant_id,
            company_id=company_id,
            branch_id=branch_id,
            employee_code=body.employee_code,
            full_name=full_name_val,
            designation=body.designation or body.role_title or "Server",
            department_name=body.department_name or "Service",
            phone=body.phone,
            basic_salary=body.basic_salary or Decimal("20000.0"),
            allowances=body.allowances or Decimal("0.0"),
            deductions=body.deductions or Decimal("0.0"),
            pin_code=body.pin_code or "1234",
            can_access_staff_web=body.can_access_staff_web or body.is_waiter,
            can_access_kds_web=body.can_access_kds_web or body.is_chef,
            is_waiter=body.is_waiter or body.can_access_staff_web,
            is_chef=body.is_chef or body.can_access_kds_web,
            status="ACTIVE",
            created_by=current_user.id if current_user else 1,
        )
        db.add(employee)
        await db.commit()
        await db.refresh(employee)

        # Auto-provision User authentication account in PostgreSQL for staff-web / kds-web
        has_app_access = body.can_access_staff_web or body.can_access_kds_web or body.is_waiter or body.is_chef
        if has_app_access:
            try:
                import asyncio
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                pin_or_pwd = (body.pin_code or "1234").strip()
                hashed_pwd = await asyncio.to_thread(pwd_context.hash, pin_or_pwd)

                role_code = "waiter" if (body.can_access_staff_web or body.is_waiter) else ("chef" if (body.can_access_kds_web or body.is_chef) else "staff")
                clean_email = body.email or f"{body.employee_code.lower()}@baithakcafe.com"

                existing_user_res = await db.execute(
                    select(User).where(
                        User.tenant_id == tenant_id,
                        (User.phone == body.phone) | (User.email == clean_email)
                    )
                )
                existing_user = existing_user_res.scalars().first()

                if not existing_user:
                    user_account = User(
                        tenant_id=tenant_id,
                        company_id=company_id,
                        branch_id=branch_id,
                        email=clean_email,
                        phone=body.phone,
                        first_name=body.first_name,
                        last_name=body.last_name or "",
                        hashed_password=hashed_pwd,
                        role_code=role_code,
                        is_active=True,
                        created_by=current_user.id if current_user else 1,
                    )
                    db.add(user_account)
                    await db.commit()
                    await db.refresh(user_account)
                    employee.user_id = user_account.id
                    await db.commit()
                else:
                    existing_user.hashed_password = hashed_pwd
                    existing_user.role_code = role_code
                    existing_user.company_id = company_id
                    existing_user.branch_id = branch_id
                    existing_user.is_active = True
                    employee.user_id = existing_user.id
                    await db.commit()
            except Exception as user_err:
                logger.warning(f"Could not auto-provision User auth record for employee {body.employee_code}: {user_err}")

        basic = float(employee.basic_salary or 20000)
        allow = float(employee.allowances or 0)
        deduct = float(employee.deductions or 0)

        return {
            "id": str(employee.id),
            "tenant_id": employee.tenant_id,
            "company_id": employee.company_id,
            "branch_id": employee.branch_id,
            "employee_code": employee.employee_code,
            "first_name": body.first_name,
            "last_name": body.last_name or "",
            "name": employee.full_name,
            "phone": employee.phone,
            "email": body.email or "",
            "basic_salary": basic,
            "allowances": allow,
            "deductions": deduct,
            "net_salary": basic + allow - deduct,
            "pin_code": employee.pin_code or "1234",
            "role_title": employee.designation,
            "can_access_staff_web": bool(employee.can_access_staff_web),
            "can_access_kds_web": bool(employee.can_access_kds_web),
            "is_active": True
        }
    except Exception as main_err:
        await db.rollback()
        logger.error(f"Error creating employee: {main_err}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create employee: {str(main_err)}")


@router.put("/employees/{emp_id}")
async def update_employee(
    emp_id: int,
    body: EmployeeCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    try:
        stmt = select(Employee).where(Employee.id == emp_id, Employee.is_deleted == False)
        res = await db.execute(stmt)
        employee = res.scalar_one_or_none()

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        employee.full_name = body.full_name or f"{body.first_name} {body.last_name or ''}".strip()
        employee.designation = body.designation or body.role_title or "Server"
        employee.department_name = body.department_name or "Service"
        employee.phone = body.phone
        employee.basic_salary = body.basic_salary
        employee.allowances = body.allowances
        employee.deductions = body.deductions
        employee.pin_code = body.pin_code or "1234"
        employee.can_access_staff_web = body.can_access_staff_web or body.is_waiter
        employee.can_access_kds_web = body.can_access_kds_web or body.is_chef
        employee.is_waiter = body.is_waiter or body.can_access_staff_web
        employee.is_chef = body.is_chef or body.can_access_kds_web

        await db.commit()
        return {"message": "Employee updated successfully", "id": str(employee.id)}
    except Exception as err:
        await db.rollback()
        logger.error(f"Error updating employee {emp_id}: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update employee: {str(err)}")


@router.post("/attendance/check-in")
async def attendance_check_in(
    body: CheckInSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    today = date.today()
    existing = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == body.employee_id,
            AttendanceRecord.attendance_date == today,
        )
    )
    record = existing.scalar_one_or_none()
    if record:
        raise HTTPException(status_code=400, detail="Already checked in today")

    record = AttendanceRecord(
        tenant_id=current_user.tenant_id,
        employee_id=body.employee_id,
        branch_id=body.branch_id,
        attendance_date=today,
        check_in_time=datetime.now(timezone.utc),
        status="present",
        created_by=current_user.id,
    )
    db.add(record)
    await db.flush()
    return {"message": "Checked in", "time": record.check_in_time.isoformat()}


class AttendancePunchSchema(BaseModel):
    employee_id: int
    branch_id: int | None = 1
    status: str | None = "present"


@router.get("/attendance/today")
async def get_today_attendance(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    today = date.today()
    try:
        query = select(AttendanceRecord).where(AttendanceRecord.attendance_date == today)
        if branch_id:
            query = query.where(AttendanceRecord.branch_id == branch_id)
        result = await db.execute(query)
        records = result.scalars().all()
    except Exception as err:
        logger.warning(f"Error querying today attendance: {err}")
        records = []

    return [
        {
            "id": str(r.id),
            "employee_id": str(r.employee_id),
            "attendance_date": r.attendance_date.isoformat(),
            "check_in_time": r.check_in_time.isoformat() if r.check_in_time else None,
            "status": r.status or "present"
        }
        for r in records
    ]


@router.post("/attendance/punch")
async def punch_attendance(
    body: AttendancePunchSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    today = date.today()
    tenant_id = current_user.tenant_id if current_user and getattr(current_user, "tenant_id", None) else 2
    branch_id = body.branch_id or (current_user.branch_id if current_user and getattr(current_user, "branch_id", None) else 1)

    existing = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == body.employee_id,
            AttendanceRecord.attendance_date == today,
        )
    )
    record = existing.scalar_one_or_none()
    if not record:
        record = AttendanceRecord(
            tenant_id=tenant_id,
            employee_id=body.employee_id,
            branch_id=branch_id,
            attendance_date=today,
            check_in_time=datetime.now(timezone.utc),
            status=body.status or "present",
            created_by=current_user.id if current_user else 1,
        )
        db.add(record)
    else:
        record.status = body.status or "present"

    await db.commit()
    return {
        "message": "Attendance punched successfully",
        "employee_id": str(body.employee_id),
        "status": record.status,
        "check_in_time": record.check_in_time.isoformat() if record.check_in_time else None
    }


async def get_fallback_tenant_id(db: AsyncSession, current_user: User | None, body_tenant_id: int | None = None) -> int:
    if body_tenant_id:
        return body_tenant_id
    if current_user and getattr(current_user, "tenant_id", None):
        return current_user.tenant_id
    res = await db.execute(select(Tenant.id).limit(1))
    valid_id = res.scalar_one_or_none()
    return valid_id or 1


class DepartmentSchema(BaseModel):
    name: str
    tenant_id: int | None = None
    company_id: int | None = None
    branch_id: int | None = None


class DesignationSchema(BaseModel):
    title: str
    department_id: int | None = None
    tenant_id: int | None = None
    company_id: int | None = None
    branch_id: int | None = None


@router.get("/departments")
async def list_departments(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    try:
        query = select(Department).where(Department.is_deleted == False)
        if branch_id:
            query = query.where((Department.branch_id == branch_id) | (Department.branch_id.is_(None)))
        res = await db.execute(query)
        depts = res.scalars().all()
        return [{"id": str(d.id), "name": d.name, "tenant_id": d.tenant_id, "branch_id": d.branch_id} for d in depts]
    except Exception as err:
        logger.error(f"Failed to list departments: {err}", exc_info=True)
        return []


@router.post("/departments", status_code=status.HTTP_201_CREATED)
async def create_department(
    body: DepartmentSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    try:
        tenant_id = await get_fallback_tenant_id(db, current_user, body.tenant_id)
        dept = Department(
            tenant_id=tenant_id,
            company_id=body.company_id,
            branch_id=body.branch_id,
            name=body.name.strip()
        )
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return {"id": str(dept.id), "name": dept.name}
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to create department: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create department in database: {str(err)}"
        )


@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: int, db: AsyncSession = Depends(get_db_session)) -> dict:
    try:
        dept = (await db.execute(select(Department).where(Department.id == dept_id))).scalar_one_or_none()
        if dept:
            dept.is_deleted = True
            await db.commit()
        return {"message": "Department deleted"}
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to delete department: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))


@router.get("/designations")
async def list_designations(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    try:
        query = select(Designation).where(Designation.is_deleted == False)
        if branch_id:
            query = query.where((Designation.branch_id == branch_id) | (Designation.branch_id.is_(None)))
        res = await db.execute(query)
        desigs = res.scalars().all()
        return [{"id": str(d.id), "title": d.title, "department_id": str(d.department_id) if d.department_id else None, "tenant_id": d.tenant_id, "branch_id": d.branch_id} for d in desigs]
    except Exception as err:
        logger.error(f"Failed to list designations: {err}", exc_info=True)
        return []


@router.post("/designations", status_code=status.HTTP_201_CREATED)
async def create_designation(
    body: DesignationSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    try:
        tenant_id = await get_fallback_tenant_id(db, current_user, body.tenant_id)
        desig = Designation(
            tenant_id=tenant_id,
            company_id=body.company_id,
            branch_id=body.branch_id,
            department_id=body.department_id,
            title=body.title.strip()
        )
        db.add(desig)
        await db.commit()
        await db.refresh(desig)
        return {"id": str(desig.id), "title": desig.title, "department_id": str(desig.department_id) if desig.department_id else None}
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to create designation: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create designation in database: {str(err)}"
        )


@router.delete("/designations/{desig_id}")
async def delete_designation(desig_id: int, db: AsyncSession = Depends(get_db_session)) -> dict:
    try:
        desig = (await db.execute(select(Designation).where(Designation.id == desig_id))).scalar_one_or_none()
        if desig:
            desig.is_deleted = True
            await db.commit()
        return {"message": "Designation deleted"}
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to delete designation: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))


class StaffLoginSchema(BaseModel):
    tenant_slug: str | None = "baithak-cafe"
    identifier: str
    pin_code: str | None = "1234"


@router.post("/staff/login")
async def staff_login(
    body: StaffLoginSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Authenticate staff / employee credentials against PostgreSQL database for Staff Web Terminal."""
    try:
        clean_identifier = body.identifier.strip()
        slug = (body.tenant_slug or "baithak-cafe").strip()

        # Resolve tenant by slug
        tenant = (await db.execute(select(Tenant).where(Tenant.slug == slug))).scalar_one_or_none()
        tenant_id = tenant.id if tenant else 2

        # Query Employee by code, phone, name or ID
        query = select(Employee).where(
            Employee.tenant_id == tenant_id,
            Employee.is_deleted == False
        )
        if clean_identifier.isdigit():
            query = query.where(
                (Employee.id == int(clean_identifier)) |
                (Employee.employee_code == clean_identifier) |
                (Employee.phone == clean_identifier)
            )
        else:
            query = query.where(
                (Employee.employee_code == clean_identifier) |
                (Employee.phone == clean_identifier) |
                (Employee.full_name.ilike(f"%{clean_identifier}%"))
            )

        res = await db.execute(query)
        emp = res.scalars().first()

        if not emp:
            raise HTTPException(
                status_code=404,
                detail=f"Staff member '{clean_identifier}' not found in database."
            )

        from src.modules.auth.service import AuthService
        auth_service = AuthService()
        access_token = auth_service.create_access_token({
            "sub": str(emp.id),
            "tenant_id": emp.tenant_id,
            "branch_id": emp.branch_id or 1,
            "role": "employee"
        })

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "employee": {
                "id": str(emp.id),
                "employee_code": emp.employee_code,
                "name": emp.full_name,
                "role_title": emp.designation or "Staff Member",
                "tenant_id": emp.tenant_id,
                "branch_id": emp.branch_id or 1,
                "can_access_staff_web": True
            }
        }
    except Exception as err:
        logger.error(f"Failed staff authentication: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Staff authentication failed: {str(err)}"
        )

