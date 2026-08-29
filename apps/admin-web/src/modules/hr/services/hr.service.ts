import { api } from "@ssrone/api-client";
import { Employee, CreateEmployeePayload } from "../types/hr.types";

export const hrService = {
  async getEmployees(params: { tenant_id?: number; company_id?: number; branch_id?: number } = {}): Promise<Employee[]> {
    const res = await api.get<any>("/hr/employees", { params }).catch(() => null);
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    return list;
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const res = await api.post<any>("/hr/employees", payload);
    return res;
  },

  async updateEmployee(id: string | number, payload: CreateEmployeePayload): Promise<any> {
    const res = await api.put<any>(`/hr/employees/${id}`, payload).catch(() => api.post("/hr/employees", payload));
    return res;
  },

  async staffLogin(identifier: string, pin_code: string, tenant_slug: string = "baithak-cafe"): Promise<any> {
    const res = await api.post<any>("/hr/staff/login", { identifier, pin_code, tenant_slug });
    return res;
  },

  async getTodayAttendance(branch_id?: number): Promise<any[]> {
    const res = await api.get<any>("/hr/attendance/today", { params: { branch_id } }).catch(() => []);
    return Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
  },

  async punchAttendance(employee_id: number | string, branch_id?: number, status: string = "present"): Promise<any> {
    const res = await api.post<any>("/hr/attendance/punch", { employee_id: Number(employee_id), branch_id, status });
    return res;
  },

  async getDepartments(branch_id?: number): Promise<any[]> {
    const res = await api.get<any>("/hr/departments", { params: { branch_id } }).catch(() => []);
    return Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
  },

  async createDepartment(name: string, branch_id?: number): Promise<any> {
    const res = await api.post<any>("/hr/departments", { name, branch_id });
    return res;
  },

  async deleteDepartment(id: string | number): Promise<any> {
    const res = await api.delete<any>(`/hr/departments/${id}`);
    return res;
  },

  async getDesignations(branch_id?: number): Promise<any[]> {
    const res = await api.get<any>("/hr/designations", { params: { branch_id } }).catch(() => []);
    return Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
  },

  async createDesignation(title: string, department_id?: string | number, branch_id?: number): Promise<any> {
    const res = await api.post<any>("/hr/designations", { title, department_id: department_id ? Number(department_id) : null, branch_id });
    return res;
  },

  async deleteDesignation(id: string | number): Promise<any> {
    const res = await api.delete<any>(`/hr/designations/${id}`);
    return res;
  }
};
