"""
The ssrone – HR Router
Employee management, attendance, leave requests.
"""
from datetime import date, datetime, time, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.shared.logger import get_logger
from src.modules.hrms.models import (
    AttendanceRecord,
    Department,
    Designation,
    Employee,
    LeaveRequest,
    LeaveType,
    PayrollRun,
    Payslip,
    Shift,
)

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
    slug = (body.tenant_slug or "").strip()
    if slug:
        t_query = select(Tenant).where(Tenant.slug == slug)
    else:
        t_query = select(Tenant).where(Tenant.is_active == True).order_by(Tenant.id.asc()).limit(1)
    t_res = await db.execute(t_query)
    tenant = t_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant_id = tenant.id

    e_query = select(Employee).where(
        Employee.tenant_id == tenant_id,
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
    current_user: User = Depends(get_current_user),
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


from src.modules.auth.dependencies import get_current_user

@router.post("/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(
    body: EmployeeCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = body.tenant_id if (getattr(current_user, "is_superadmin", False) and body.tenant_id) else current_user.tenant_id
    company_id = body.company_id or getattr(current_user, 'company_id', None)
    branch_id = body.branch_id or getattr(current_user, 'branch_id', None)

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
            created_by=current_user.id,
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
                        created_by=current_user.id,
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    today = date.today()
    tenant_id = current_user.tenant_id
    branch_id = body.branch_id or getattr(current_user, 'branch_id', None)

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
            created_by=current_user.id,
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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


@router.put("/departments/{dept_id}")
async def update_department(
    dept_id: int,
    body: DepartmentSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    try:
        dept = (await db.execute(select(Department).where(Department.id == dept_id, Department.is_deleted == False))).scalar_one_or_none()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        dept.name = body.name.strip()
        await db.commit()
        await db.refresh(dept)
        return {"id": str(dept.id), "name": dept.name}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to update department: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))


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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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


@router.put("/designations/{desig_id}")
async def update_designation(
    desig_id: int,
    body: DesignationSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    try:
        desig = (await db.execute(select(Designation).where(Designation.id == desig_id, Designation.is_deleted == False))).scalar_one_or_none()
        if not desig:
            raise HTTPException(status_code=404, detail="Designation not found")
        desig.title = body.title.strip()
        if body.department_id is not None:
            desig.department_id = body.department_id
        await db.commit()
        await db.refresh(desig)
        return {"id": str(desig.id), "title": desig.title, "department_id": str(desig.department_id) if desig.department_id else None}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as err:
        await db.rollback()
        logger.error(f"Failed to update designation: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))


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
    app_target: str | None = None  # "staff_web", "kds_web", "pos"


@router.post("/staff/login")
async def staff_login(
    body: StaffLoginSchema,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Authenticate staff / employee credentials against PostgreSQL database for Staff Apps."""
    try:
        clean_identifier = body.identifier.strip()
        slug = (body.tenant_slug or "baithak-cafe").strip()

        # Resolve tenant by slug
        if slug:
            t_stmt = select(Tenant).where(Tenant.slug == slug)
        else:
            t_stmt = select(Tenant).where(Tenant.is_active == True).order_by(Tenant.id.asc()).limit(1)
        tenant = (await db.execute(t_stmt)).scalar_one_or_none()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        tenant_id = tenant.id

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
                detail=f"Staff member '{clean_identifier}' not found in PostgreSQL database."
            )

        # 1. Strict Password / Security PIN Validation
        input_pin = (body.pin_code or "").strip()
        db_pin = (emp.pin_code or "1234").strip()
        if input_pin != db_pin:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid Security PIN / Password for staff member '{emp.full_name}'."
            )

        # 2. Strict App Entitlement / Permission Validation
        target = (body.app_target or "").lower().strip()
        if target in ("staff_web", "staff", "waiter"):
            if not emp.can_access_staff_web and not emp.is_waiter:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access Denied: Staff member '{emp.full_name}' does not have permission to access Staff-Web Companion. Please contact HR Admin."
                )
        elif target in ("kds_web", "kds", "kitchen"):
            if not emp.can_access_kds_web and not emp.is_chef:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access Denied: Staff member '{emp.full_name}' does not have permission to access KDS Kitchen Display. Please contact HR Admin."
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
                "can_access_staff_web": bool(emp.can_access_staff_web),
                "can_access_kds_web": bool(emp.can_access_kds_web),
                "is_waiter": bool(emp.is_waiter),
                "is_chef": bool(emp.is_chef),
            }
        }
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Failed staff authentication: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Staff authentication failed: {str(err)}"
        )


# ─── Shift Endpoints ──────────────────────────────────────────

class ShiftCreateSchema(BaseModel):
    name: str
    code: str
    start_time: str  # "09:00"
    end_time: str    # "17:00"
    grace_minutes: int = 10
    is_night_shift: bool = False
    branch_id: int | None = 1
    is_active: bool = True


@router.get("/shifts")
async def list_shifts(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = select(Shift).where(Shift.tenant_id == tenant_id, Shift.is_deleted == False)
    if branch_id:
        query = query.where(Shift.branch_id == branch_id)
    res = await db.execute(query.order_by(Shift.start_time.asc()))
    shifts = res.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "code": s.code,
            "start_time": s.start_time.strftime("%H:%M") if s.start_time else "09:00",
            "end_time": s.end_time.strftime("%H:%M") if s.end_time else "17:00",
            "grace_minutes": s.grace_minutes,
            "is_night_shift": s.is_night_shift,
            "is_active": s.is_active,
            "branch_id": s.branch_id,
        }
        for s in shifts
    ]


@router.post("/shifts", status_code=status.HTTP_201_CREATED)
async def create_shift(
    body: ShiftCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    st_parts = [int(x) for x in body.start_time.split(":")[:2]]
    et_parts = [int(x) for x in body.end_time.split(":")[:2]]
    shift = Shift(
        tenant_id=tenant_id,
        branch_id=body.branch_id or 1,
        name=body.name.strip(),
        code=body.code.strip().upper(),
        start_time=time(st_parts[0], st_parts[1]),
        end_time=time(et_parts[0], et_parts[1]),
        grace_minutes=body.grace_minutes,
        is_night_shift=body.is_night_shift,
        is_active=body.is_active,
    )
    db.add(shift)
    await db.commit()
    await db.refresh(shift)
    return {"message": "Shift created successfully", "id": shift.id}


@router.delete("/shifts/{shift_id}", status_code=status.HTTP_200_OK)
async def delete_shift(
    shift_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(Shift).where(Shift.id == shift_id, Shift.tenant_id == tenant_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Shift not found")
    s.is_deleted = True
    await db.commit()
    return {"message": "Shift deleted successfully"}


# ─── Leave Types Endpoints ─────────────────────────────────────

class LeaveTypeCreateSchema(BaseModel):
    name: str
    code: str
    days_per_year: float = 12.0
    is_paid: bool = True
    carry_forward: bool = False
    max_carry_forward_days: int = 0
    requires_approval: bool = True


@router.get("/leave-types")
async def list_leave_types(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = select(LeaveType).where(LeaveType.tenant_id == tenant_id, LeaveType.is_deleted == False)
    res = await db.execute(query.order_by(LeaveType.id.asc()))
    types = res.scalars().all()
    return [
        {
            "id": lt.id,
            "name": lt.name,
            "code": lt.code,
            "days_per_year": float(lt.days_per_year),
            "is_paid": lt.is_paid,
            "carry_forward": lt.carry_forward,
            "max_carry_forward_days": lt.max_carry_forward_days,
            "requires_approval": lt.requires_approval,
            "is_active": lt.is_active,
        }
        for lt in types
    ]


@router.post("/leave-types", status_code=status.HTTP_201_CREATED)
async def create_leave_type(
    body: LeaveTypeCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    lt = LeaveType(
        tenant_id=tenant_id,
        name=body.name.strip(),
        code=body.code.strip().upper(),
        days_per_year=Decimal(str(body.days_per_year)),
        is_paid=body.is_paid,
        carry_forward=body.carry_forward,
        max_carry_forward_days=body.max_carry_forward_days,
        requires_approval=body.requires_approval,
        is_active=True,
    )
    db.add(lt)
    await db.commit()
    await db.refresh(lt)
    return {"message": "Leave type created successfully", "id": lt.id}


@router.delete("/leave-types/{type_id}", status_code=status.HTTP_200_OK)
async def delete_leave_type(
    type_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(LeaveType).where(LeaveType.id == type_id, LeaveType.tenant_id == tenant_id))
    lt = res.scalar_one_or_none()
    if not lt:
        raise HTTPException(status_code=404, detail="Leave type not found")
    lt.is_deleted = True
    await db.commit()
    return {"message": "Leave type deleted successfully"}


# ─── Leave Requests Endpoints ──────────────────────────────────

class LeaveRequestFormSchema(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str | None = None


class LeaveStatusUpdateSchema(BaseModel):
    status: str  # "approved" or "rejected"
    rejection_reason: str | None = None


@router.get("/leave-requests")
async def list_leave_requests(
    status_filter: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = (
        select(LeaveRequest, Employee.full_name, Employee.employee_code, LeaveType.name)
        .outerjoin(Employee, LeaveRequest.employee_id == Employee.id)
        .outerjoin(LeaveType, LeaveRequest.leave_type_id == LeaveType.id)
        .where(LeaveRequest.tenant_id == tenant_id, LeaveRequest.is_deleted == False)
    )
    if status_filter:
        query = query.where(LeaveRequest.status == status_filter)
    res = await db.execute(query.order_by(LeaveRequest.from_date.desc()))
    rows = res.all()
    out = []
    for lr, emp_name, emp_code, lt_name in rows:
        out.append({
            "id": lr.id,
            "employee_id": lr.employee_id,
            "employee_name": emp_name or f"Emp #{lr.employee_id}",
            "employee_code": emp_code or "",
            "leave_type_id": lr.leave_type_id,
            "leave_type_name": lt_name or "General Leave",
            "from_date": lr.from_date.isoformat(),
            "to_date": lr.to_date.isoformat(),
            "total_days": float(lr.total_days),
            "reason": lr.reason,
            "status": lr.status,
            "approved_at": lr.approved_at.isoformat() if lr.approved_at else None,
            "rejection_reason": lr.rejection_reason,
        })
    return out


@router.post("/leave-requests", status_code=status.HTTP_201_CREATED)
async def submit_leave_request(
    body: LeaveRequestFormSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    days = (body.to_date - body.from_date).days + 1
    if days <= 0:
        raise HTTPException(status_code=400, detail="to_date must be greater than or equal to from_date")

    lr = LeaveRequest(
        tenant_id=tenant_id,
        employee_id=body.employee_id,
        leave_type_id=body.leave_type_id,
        from_date=body.from_date,
        to_date=body.to_date,
        total_days=Decimal(str(days)),
        reason=body.reason,
        status="pending",
    )
    db.add(lr)
    await db.commit()
    await db.refresh(lr)
    return {"message": "Leave application submitted successfully", "id": lr.id, "total_days": days}


@router.patch("/leave-requests/{request_id}/status")
async def update_leave_status(
    request_id: int,
    body: LeaveStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id, LeaveRequest.tenant_id == tenant_id))
    lr = res.scalar_one_or_none()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")

    lr.status = body.status.lower()
    if body.status.lower() == "approved":
        lr.approved_by=current_user.id
        lr.approved_at = datetime.now(timezone.utc)
    elif body.status.lower() == "rejected":
        lr.rejection_reason = body.rejection_reason

    await db.commit()
    return {"message": f"Leave request status updated to {lr.status}"}


# ─── Attendance Records & Override Endpoints ───────────────────

class AttendanceOverrideSchema(BaseModel):
    employee_id: int
    attendance_date: date
    check_in_time: str | None = None   # "09:00"
    check_out_time: str | None = None  # "18:00"
    status: str = "present"
    notes: str | None = None


@router.get("/attendance/records")
async def list_attendance_records(
    date_from: date | None = None,
    date_to: date | None = None,
    employee_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = (
        select(AttendanceRecord, Employee.full_name, Employee.employee_code, Employee.designation)
        .outerjoin(Employee, AttendanceRecord.employee_id == Employee.id)
        .where(AttendanceRecord.tenant_id == tenant_id, AttendanceRecord.is_deleted == False)
    )
    if employee_id:
        query = query.where(AttendanceRecord.employee_id == employee_id)
    if date_from:
        query = query.where(AttendanceRecord.attendance_date >= date_from)
    if date_to:
        query = query.where(AttendanceRecord.attendance_date <= date_to)

    res = await db.execute(query.order_by(AttendanceRecord.attendance_date.desc(), AttendanceRecord.id.desc()).limit(100))
    rows = res.all()
    out = []
    for att, emp_name, emp_code, desig in rows:
        out.append({
            "id": att.id,
            "employee_id": att.employee_id,
            "employee_name": emp_name or f"Emp #{att.employee_id}",
            "employee_code": emp_code or "",
            "designation": desig or "Staff",
            "attendance_date": att.attendance_date.isoformat(),
            "check_in_time": att.check_in_time.isoformat() if att.check_in_time else None,
            "check_out_time": att.check_out_time.isoformat() if att.check_out_time else None,
            "status": att.status,
            "working_hours": float(att.working_hours or 0),
            "notes": att.notes,
            "is_regularized": att.is_regularized,
        })
    return out


@router.post("/attendance/override")
async def override_attendance(
    body: AttendanceOverrideSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.tenant_id == tenant_id,
            AttendanceRecord.employee_id == body.employee_id,
            AttendanceRecord.attendance_date == body.attendance_date,
        )
    )
    rec = res.scalar_one_or_none()

    cin = None
    if body.check_in_time:
        p = [int(x) for x in body.check_in_time.split(":")[:2]]
        cin = datetime.combine(body.attendance_date, time(p[0], p[1]), tzinfo=timezone.utc)

    cout = None
    if body.check_out_time:
        p = [int(x) for x in body.check_out_time.split(":")[:2]]
        cout = datetime.combine(body.attendance_date, time(p[0], p[1]), tzinfo=timezone.utc)

    hrs = Decimal("8.0")
    if cin and cout:
        diff_secs = (cout - cin).total_seconds()
        if diff_secs > 0:
            hrs = Decimal(str(round(diff_secs / 3600, 2)))

    if not rec:
        rec = AttendanceRecord(
            tenant_id=tenant_id,
            branch_id=1,
            employee_id=body.employee_id,
            attendance_date=body.attendance_date,
            check_in_time=cin,
            check_out_time=cout,
            status=body.status,
            working_hours=hrs,
            notes=body.notes or "Manual Regularization by HR",
            is_regularized=True,
            created_by=current_user.id,
        )
        db.add(rec)
    else:
        if cin:
            rec.check_in_time = cin
        if cout:
            rec.check_out_time = cout
        rec.status = body.status
        rec.working_hours = hrs
        rec.notes = body.notes or "Manual Regularization by HR"
        rec.is_regularized = True

    await db.commit()
    return {"message": "Attendance regularized successfully"}


# ─── Payroll Execution Endpoints ───────────────────────────────

class PayrollExecutionSchema(BaseModel):
    payroll_month: str  # e.g. "2026-09"
    branch_id: int | None = 1


@router.get("/payroll-runs")
async def list_payroll_runs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(PayrollRun)
        .where(PayrollRun.tenant_id == tenant_id, PayrollRun.is_deleted == False)
        .order_by(PayrollRun.payroll_month.desc())
    )
    runs = res.scalars().all()
    return [
        {
            "id": r.id,
            "payroll_month": r.payroll_month,
            "status": r.status,
            "total_employees": r.total_employees,
            "total_gross": float(r.total_gross),
            "total_deductions": float(r.total_deductions),
            "total_net": float(r.total_net),
            "processed_at": r.processed_at.isoformat() if r.processed_at else None,
            "paid_at": r.paid_at.isoformat() if r.paid_at else None,
        }
        for r in runs
    ]


@router.post("/payroll-runs/execute", status_code=status.HTTP_201_CREATED)
async def execute_payroll(
    body: PayrollExecutionSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    branch_id = body.branch_id or 1

    emp_res = await db.execute(
        select(Employee).where(
            Employee.tenant_id == tenant_id,
            Employee.status == "ACTIVE",
            Employee.is_deleted == False,
        )
    )
    employees = emp_res.scalars().all()
    if not employees:
        raise HTTPException(status_code=400, detail="No active employees found to process payroll")

    total_gross = Decimal("0.00")
    total_ded = Decimal("0.00")
    total_net = Decimal("0.00")

    run = PayrollRun(
        tenant_id=tenant_id,
        branch_id=branch_id,
        payroll_month=body.payroll_month,
        status="processed",
        total_employees=len(employees),
        processed_at=datetime.now(timezone.utc),
        approved_by=current_user.id,
    )
    db.add(run)
    await db.flush()

    for emp in employees:
        basic = emp.basic_salary or Decimal("20000.00")
        allowances = emp.allowances or Decimal("0.00")
        deductions = emp.deductions or Decimal("0.00")
        gross = basic + allowances
        net = gross - deductions

        total_gross += gross
        total_ded += deductions
        total_net += net

        slip = Payslip(
            tenant_id=tenant_id,
            payroll_run_id=run.id,
            employee_id=emp.id,
            basic_salary=basic,
            earnings={"Basic": float(basic), "Allowances": float(allowances)},
            deductions={"Standard Deductions": float(deductions)},
            gross_salary=gross,
            total_deductions=deductions,
            net_salary=net,
            working_days=Decimal("30.0"),
            present_days=Decimal("30.0"),
            leave_days=Decimal("0.0"),
            lop_days=Decimal("0.0"),
        )
        db.add(slip)

    run.total_gross = total_gross
    run.total_deductions = total_ded
    run.total_net = total_net

    await db.commit()
    await db.refresh(run)

    return {
        "message": f"Payroll for {body.payroll_month} successfully executed",
        "run_id": run.id,
        "total_employees": run.total_employees,
        "total_gross": float(run.total_gross),
        "total_net": float(run.total_net),
    }


