export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  status: 'Active' | 'Inactive';
  manager: string;
}

export interface Company {
  id: string;
  name: string;
  regNumber: string;
  gstin: string;
  branches: Branch[];
}

export interface EnabledModules {
  pos: boolean;
  hotel: boolean;
  pg: boolean;
  inventory: boolean;
  finance: boolean;
  crm: boolean;
  ai: boolean;
  kds: boolean;
  spaPlugin: boolean;
  banquetPlugin: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
  tier: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Suspended' | 'Trial' | 'Expired';
  dbStrategy: 'Shared Schema RLS' | 'Dedicated Database';
  licenseKey: string;
  maxOutlets: number;
  
  // Subscription & Payment Fields
  subscriptionType: 'Yearly Standard (₹12,000)' | 'Multi-Outlet Enterprise' | 'Custom Plan';
  yearlyFee: number; // e.g. 12000 INR
  monthlyFee: number; // e.g. 1000 INR
  subscriptionStartDate: string; // e.g. "2026-08-24"
  subscriptionExpiryDate: string; // e.g. "2027-08-24"
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentMethod?: 'Razorpay Online' | 'UPI Transfer' | 'Bank NEFT/RTGS' | 'Cash / Cheque';
  paymentRef?: string; // e.g. UTR / Payment ID
  daysRemaining: number;

  companies: Company[];
  enabledModules: EnabledModules;
  createdAt: string;
}

export interface CreateTenantDTO {
  name: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
  tier: 'Starter' | 'Professional' | 'Enterprise';
  dbStrategy: 'Shared Schema RLS' | 'Dedicated Database';
  maxOutlets: number;
  
  // Subscription & Payment Info
  subscriptionType: 'Yearly Standard (₹12,000)' | 'Multi-Outlet Enterprise' | 'Custom Plan';
  yearlyFee: number;
  paymentMethod: 'Razorpay Online' | 'UPI Transfer' | 'Bank NEFT/RTGS' | 'Cash / Cheque';
  paymentRef: string;
  subscriptionStartDate: string;
  subscriptionExpiryDate: string;

  enabledModules: EnabledModules;
  initialCompanyName?: string;
  initialBranchName?: string;
}

export interface UpdateTenantLicenseDTO {
  tier?: 'Starter' | 'Professional' | 'Enterprise';
  status?: 'Active' | 'Suspended' | 'Trial' | 'Expired';
  maxOutlets?: number;
  yearlyFee?: number;
  licenseKey?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE';
  subscriptionExpiryDate?: string;
  enabledModules?: Partial<EnabledModules>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  tenantName: string;
  eventType: 'TenantOnboarded' | 'LicenseKeyRotated' | 'SubscriptionRenewed' | 'QuotaLimitEnforced' | 'SecurityPolicyEvaluated';
  details: string;
  severity: 'INFO' | 'SUCCESS' | 'WARN' | 'SECURITY';
  actor: string;
}

export interface ClusterNode {
  id: string;
  name: string;
  role: 'Primary PostgreSQL' | 'Read Replica' | 'Redis PubSub' | 'FastAPI Worker' | 'AI Gateway';
  status: 'HEALTHY' | 'DEGRADED' | 'SYNCING';
  cpuUsage: number;
  ramUsage: number;
  latencyMs: number;
}

export interface LeadInquiry {
  id: number;
  full_name: string;
  company_name: string;
  phone: string;
  email: string;
  vertical: string;
  outlet_count?: string;
  preferred_date?: string;
  preferred_time?: string;
  inquiry_type: 'DEMO_REQUEST' | 'SALES_INQUIRY';
  status: 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'ARCHIVED';
  notes?: string;
  operator_notes?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

