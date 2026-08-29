export interface Employee {
  id: string;
  tenant_id?: number;
  company_id?: number;
  branch_id?: number;
  employee_code: string;
  name: string;
  first_name?: string;
  last_name?: string;
  designation?: string;
  role: string;
  department: string;
  status: "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED" | string;
  salary: number;
  allowances?: number;
  deductions?: number;
  net_salary?: number;
  contact: string;
  email?: string;
  pin_code?: string;
  can_access_staff_web?: boolean;
  can_access_kds_web?: boolean;
  joining_date?: string;
  is_active?: boolean;
}

export interface CreateEmployeePayload {
  tenant_id?: number;
  company_id?: number;
  branch_id?: number;
  employee_code: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  designation?: string;
  department_name?: string;
  phone: string;
  email?: string;
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  pin_code?: string;
  role_title?: string;
  can_access_staff_web?: boolean;
  can_access_kds_web?: boolean;
  is_waiter?: boolean;
  is_chef?: boolean;
}

export interface HRStats {
  totalStaff: number;
  digitalAppStaff: number;
  monthlyPayroll: number;
}

export interface Department {
  id: string;
  name: string;
  tenant_id?: number;
  branch_id?: number;
}

export interface Designation {
  id: string;
  title: string;
  department_id?: string;
  tenant_id?: number;
  branch_id?: number;
}
