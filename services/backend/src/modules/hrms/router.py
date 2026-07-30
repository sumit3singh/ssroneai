"""
The Baithak – HR Router
Employee management, attendance, leave requests.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.hrms.models import AttendanceRecord, Employee, LeaveRequest
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/hr", tags=["HR & Payroll"])


class EmployeeCreateSchema(BaseModel):
    branch_id: int
    employee_code: str
    first_name: str
    last_name: str
    phone: str
    email: str | None = None
    department_id: int | None = None
    joining_date: date
    basic_salary: Decimal = Field(gt=0)


class EmployeeResponse(BaseModel):
    id: int
    employee_code: str
    first_name: str
    last_name: str
    phone: str
    basic_salary: Decimal
    joining_date: date
    is_active: bool

    model_config = {"from_attributes": True}


class CheckInSchema(BaseModel):
    employee_id: int
    branch_id: int


class LeaveRequestCreateSchema(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str | None = None


@router.get("/employees")
async def list_employees(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[EmployeeResponse]:
    query = select(Employee).where(
        Employee.tenant_id == current_user.tenant_id,
        Employee.is_deleted == False,
        Employee.is_active == True,
    )
    if branch_id:
        query = query.where(Employee.branch_id == branch_id)
    result = await db.execute(query)
    return [EmployeeResponse.model_validate(e) for e in result.scalars().all()]


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    body: EmployeeCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> EmployeeResponse:
    employee = Employee(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        employee_code=body.employee_code,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        email=body.email,
        department_id=body.department_id,
        joining_date=body.joining_date,
        basic_salary=body.basic_salary,
        is_active=True,
        created_by=current_user.id,
    )
    db.add(employee)
    await db.flush()
    return EmployeeResponse.model_validate(employee)


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


@router.post("/leave-requests", status_code=status.HTTP_201_CREATED)
async def create_leave_request(
    body: LeaveRequestCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    total_days = Decimal((body.to_date - body.from_date).days + 1)
    leave_request = LeaveRequest(
        tenant_id=current_user.tenant_id,
        employee_id=body.employee_id,
        leave_type_id=body.leave_type_id,
        from_date=body.from_date,
        to_date=body.to_date,
        total_days=total_days,
        reason=body.reason,
        status="pending",
        created_by=current_user.id,
    )
    db.add(leave_request)
    await db.flush()
    return {"id": str(leave_request.id), "status": "pending", "total_days": float(total_days)}
