/**
 * ssrone ERP - HR Employee Domain Model
 * Core business rules for employee salary calculations, deductions, and shift rules.
 */

export interface EmployeeProps {
  id: string | number;
  employeeCode: string;
  name: string;
  department: string;
  monthlyBaseSalary: number;
  pfDeductionPercent?: number;
  taxDeductionPercent?: number;
}

export class Employee {
  readonly id: string | number;
  readonly employeeCode: string;
  readonly name: string;
  readonly department: string;
  readonly monthlyBaseSalary: number;
  readonly pfDeductionPercent: number;
  readonly taxDeductionPercent: number;

  constructor(props: EmployeeProps) {
    this.id = props.id;
    this.employeeCode = props.employeeCode;
    this.name = props.name;
    this.department = props.department || "Operations";
    this.monthlyBaseSalary = Math.max(0, props.monthlyBaseSalary);
    this.pfDeductionPercent = props.pfDeductionPercent ?? 12;
    this.taxDeductionPercent = props.taxDeductionPercent ?? 10;
  }

  get pfAmount(): number {
    return (this.monthlyBaseSalary * this.pfDeductionPercent) / 100;
  }

  get taxAmount(): number {
    return (this.monthlyBaseSalary * this.taxDeductionPercent) / 100;
  }

  get netMonthlySalary(): number {
    const net = this.monthlyBaseSalary - this.pfAmount - this.taxAmount;
    return Math.round(Math.max(0, net) * 100) / 100;
  }
}
