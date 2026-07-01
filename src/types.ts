export interface DashboardData {
  totalCash: number;
  receivables: number;
  payables: number;
  netProfit: number;
  revenue?: number;
  expenses?: number;
}

export interface Invoice {
  id: number;
  type?: 'invoice' | 'quotation' | 'proforma' | 'advance' | 'credit_note';
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  status: 'draft' | 'pending_approval' | 'issued' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  currency: string;
  project_id?: string;
  cost_center?: string;
  recurring_status?: 'none' | 'active' | 'paused' | 'stopped';
  recurring_frequency?: 'monthly' | 'quarterly' | 'annual';
}

export interface Bill {
  id: number;
  bill_number: string;
  reference_number?: string;
  supplier_name: string;
  total_amount: number;
  paid_amount: number;
  tax_amount?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  bill_date: string;
  due_date: string;
  currency: string;
  project_id?: string;
  cost_center?: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  position: string;
  basic_salary: number;
  join_date: string;
  status: 'active' | 'inactive' | 'terminated';
  allowances: number;
  social_insurance_number?: string;
  bank_account?: string;
  company_id?: string;
}

export interface PayrollRun {
  id: number;
  period: string; // e.g., '2026-06'
  date: string;
  total_basic: number;
  total_allowances: number;
  total_bonuses: number;
  total_deductions: number;
  total_taxes: number;
  total_social_insurance: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid' | 'under_review';
  company_id?: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category: 'computers' | 'cars' | 'equipment' | 'furniture' | string;
  purchase_date: string;
  purchase_price: number;
  salvage_value: number;
  useful_life_years: number;
  depreciation_method: 'straight_line' | 'declining_balance' | string;
  accumulated_depreciation: number;
  net_book_value: number;
  status: 'active' | 'sold' | 'disposed';
  location?: string;
  last_depreciation_date?: string;
  company_id?: string;
}

export interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'pending_approval' | 'posted' | 'reversed';
  company_id: string;
}

export interface Contact {
  id: number;
  type: 'customer' | 'supplier';
  code: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  credit_limit?: number;
  opening_balance?: number;
  outstanding_balance?: number;
  aging?: {
    '0_30': number;
    '31_60': number;
    '61_90': number;
    '91_plus': number;
  };
  sub_contacts?: SubContact[];
}

export interface SubContact {
  name: string;
  email: string;
  phone: string;
}

export interface BankAccount {
  id: number;
  code: string;
  name: string;
  type: 'bank' | 'cash';
  currency: string;
  balance: number;
  company_id?: string;
}

export interface TaxRecord {
  id: number;
  type: 'vat' | 'income' | 'withholding' | 'payroll';
  period: string; // e.g., '2026-Q2' or '2026-06'
  liability_amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'posted';
  due_date: string;
}

export interface TaxSummary {
  vat_liability: number;
  vat_paid: number;
  income_liability: number;
  income_paid: number;
  withholding_liability: number;
  withholding_paid: number;
  payroll_liability: number;
  payroll_paid: number;
}

export interface LoanInstallment {
  id: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid';
}

export interface Loan {
  id: number;
  type: 'bank' | 'personal';
  lender_name: string;
  original_amount: number;
  interest_rate: number;
  start_date: string;
  end_date: string;
  remaining_principal: number;
  status: 'active' | 'closed';
  installments: LoanInstallment[];
}

export interface PartnerTransaction {
  id: number;
  date: string;
  type: 'deposit' | 'withdrawal' | 'capital_injection';
  amount: number;
  description: string;
}

export interface PartnerAccount {
  id: number;
  partner_name: string;
  equity_share: number;
  capital_balance: number;
  current_balance: number;
  transactions: PartnerTransaction[];
}

export interface CostCenter {
  id: string;
  name: string;
  parent_id: string | null;
  manager_name: string;
  budget: number;
  actual_cost: number;
  revenue: number;
  children?: CostCenter[];
}

export interface Project {
  id: string;
  project_code: string;
  name: string;
  customer_id: number;
  customer_name: string;
  budget_revenue: number;
  budget_cost: number;
  actual_revenue: number;
  actual_cost: number;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  end_date: string;
}

export interface ProjectAnalysis {
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  revenue_variance: number;
  cost_variance: number;
  allocated_overhead?: number;
}

export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

export interface CashForecast {
  period: string; // e.g., Week 1, Week 2, etc.
  starting_balance: number;
  inflows: number;
  outflows: number;
  ending_balance: number;
}

export interface CrisisAlert {
  status: 'safe' | 'warning' | 'critical';
  message: string;
  triggered_period: string;
}

export interface Recommendation {
  id: string;
  type: 'collection' | 'payment_delay' | 'general';
  action: string;
  impact_amount: number;
}

export interface ClientProfitability {
  client_id: number;
  client_name: string;
  total_revenue: number;
  total_cost: number;
  net_profit: number;
  profit_margin: number;
}

export interface ProjectProfitabilityRanking extends ProjectAnalysis {
  project_name: string;
  customer_name: string;
}

export interface StandardReportMeta {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'management' | 'operational' | 'consolidated';
  iconType: string;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface ColumnConfig {
  field: string;
  label: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportConfig {
  dataSource: string;
  columns: ColumnConfig[];
  filters: FilterConfig[];
  groupBy?: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'table';
}

export interface ClosingTask {
  id: string;
  name: string;
  isCompleted: boolean;
  requiredForHardLock: boolean;
}

export interface AccountingPeriod {
  id: string; // e.g. "2026-05"
  month: number;
  year: number;
  status: 'open' | 'soft_lock' | 'hard_lock';
  checklists: ClosingTask[];
}

export interface PermissionMatrix {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionMatrix[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'locked' | 'pending';
  lastLogin?: string;
}
