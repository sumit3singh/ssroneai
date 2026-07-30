"""
The Baithak – HR Module
Employee profiles, departments, attendance, leaves, payroll, shifts.
"""
from datetime import date, datetime, time
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class EmploymentType(StrEnum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"
    DAILY_WAGE = "daily_wage"


class Department(TenantBaseModel):
    __tablename__ = "departments"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    head_employee_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    employees: Mapped[list["Employee"]] = relationship("Employee", back_populates="department")


class Designation(TenantBaseModel):
    __tablename__ = "designations"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Employee(TenantBaseModel):
    __tablename__ = "employees"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    employee_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    department_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("departments.id"), nullable=True
    )
    designation_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    reporting_to_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    employment_type: Mapped[str] = mapped_column(String(20), default=EmploymentType.FULL_TIME)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False)
    confirmation_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    exit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    exit_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Payroll
    basic_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    salary_structure: Mapped[dict] = mapped_column(JSONB, default=dict)
    bank_account: Mapped[dict] = mapped_column(JSONB, default=dict)
    pan_number: Mapped[str | None] = mapped_column(String(10), nullable=True)
    aadhaar_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    pf_account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    esi_number: Mapped[str | None] = mapped_column(String(50), nullable=True)

    address: Mapped[dict] = mapped_column(JSONB, default=dict)
    emergency_contact: Mapped[dict] = mapped_column(JSONB, default=dict)
    documents: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    department: Mapped["Department | None"] = relationship("Department", back_populates="employees")
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(
        "AttendanceRecord", back_populates="employee"
    )
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(
        "LeaveRequest", back_populates="employee"
    )


class Shift(TenantBaseModel):
    __tablename__ = "shifts"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_night_shift: Mapped[bool] = mapped_column(Boolean, default=False)
    grace_minutes: Mapped[int] = mapped_column(Integer, default=10)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AttendanceRecord(TenantBaseModel):
    __tablename__ = "attendance_records"
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("employees.id"), nullable=False, index=True
    )
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    shift_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    check_in_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    check_out_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="present")
    # present, absent, half_day, leave, holiday, week_off
    late_minutes: Mapped[int] = mapped_column(Integer, default=0)
    overtime_minutes: Mapped[int] = mapped_column(Integer, default=0)
    working_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_regularized: Mapped[bool] = mapped_column(Boolean, default=False)
    employee: Mapped["Employee"] = relationship("Employee", back_populates="attendance_records")


class LeaveType(TenantBaseModel):
    __tablename__ = "leave_types"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    days_per_year: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True)
    carry_forward: Mapped[bool] = mapped_column(Boolean, default=False)
    max_carry_forward_days: Mapped[int] = mapped_column(Integer, default=0)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class LeaveRequest(TenantBaseModel):
    __tablename__ = "leave_requests"
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("employees.id"), nullable=False, index=True
    )
    leave_type_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    from_date: Mapped[date] = mapped_column(Date, nullable=False)
    to_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # pending, approved, rejected, cancelled
    approved_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    employee: Mapped["Employee"] = relationship("Employee", back_populates="leave_requests")


class PayrollRun(TenantBaseModel):
    __tablename__ = "payroll_runs"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    payroll_month: Mapped[str] = mapped_column(String(7), nullable=False)  # "2026-06"
    status: Mapped[str] = mapped_column(String(20), default="draft")
    # draft, processing, approved, paid
    total_employees: Mapped[int] = mapped_column(Integer, default=0)
    total_gross: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total_net: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    payslips: Mapped[list["Payslip"]] = relationship("Payslip", back_populates="payroll_run")


class Payslip(TenantBaseModel):
    __tablename__ = "payslips"
    payroll_run_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("payroll_runs.id"), nullable=False
    )
    employee_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    basic_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    earnings: Mapped[dict] = mapped_column(JSONB, default=dict)
    deductions: Mapped[dict] = mapped_column(JSONB, default=dict)
    gross_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    net_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    working_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=0)
    present_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=0)
    leave_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=0)
    lop_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), default=0)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payroll_run: Mapped["PayrollRun"] = relationship("PayrollRun", back_populates="payslips")
