-- 005_postgresql_schema.sql
-- Bohemian Accounting System - PostgreSQL Database Schema

-- Utility function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin','fm','accountant','junior','viewer')),
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. user_permissions
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  UNIQUE (user_id, module, action)
);

-- 4. settings
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT
);

-- 5. activity_log
CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(150),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. account_types
CREATE TABLE account_types (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL CHECK (category IN ('asset','liability','equity','revenue','expense')),
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100)
);

-- 7. accounts
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) DEFAULT NULL,
  account_type_id INTEGER NOT NULL REFERENCES account_types(id),
  parent_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  level VARCHAR(50) NOT NULL DEFAULT 'sub' CHECK (level IN ('main','sub','detail')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  allow_direct_entry BOOLEAN NOT NULL DEFAULT TRUE,
  scope VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (scope IN ('all','bgk','o2n')),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_accounts_modtime BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. cost_centers
CREATE TABLE cost_centers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  parent_id INTEGER REFERENCES cost_centers(id) ON DELETE SET NULL,
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  address TEXT,
  credit_limit DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. customer_contacts
CREATE TABLE customer_contacts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  title VARCHAR(100)
);

-- 11. projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  default_cost_center_id INTEGER REFERENCES cost_centers(id),
  start_date DATE NOT NULL,
  end_date DATE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('fixed','monthly','hourly')),
  contract_value DECIMAL(15,2),
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled','on_hold')),
  budget_revenue DECIMAL(15,2),
  budget_cost DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. bank_accounts
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank','cash')),
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  company_id INTEGER REFERENCES companies(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 13. suppliers
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. journal_entries
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(30) NOT NULL UNIQUE,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  entry_date DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  reference_type VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (reference_type IN ('manual','invoice','invoice_payment','purchase',
    'supplier_payment','payroll','bank_movement','tax_payment',
    'loan_payment','partner_movement','depreciation','opening_balance',
    'closing','adjusting','reversing','intercompany')),
  reference_id INTEGER DEFAULT NULL,
  reversed_entry_id INTEGER REFERENCES journal_entries(id),
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_balanced BOOLEAN GENERATED ALWAYS AS (ABS(total_debit - total_credit) < 0.01) STORED,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','posted','reversed')),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  posted_by INTEGER REFERENCES users(id),
  posted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_journal_entries_modtime BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. journal_lines
CREATE TABLE journal_lines (
  id BIGSERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  line_number INT NOT NULL DEFAULT 1,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  description VARCHAR(500),
  debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  cost_center_id INTEGER REFERENCES cost_centers(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL
);

-- 16. invoices
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  project_id INTEGER REFERENCES projects(id),
  cost_center_id INTEGER REFERENCES cost_centers(id),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'invoice' CHECK (type IN ('invoice','quotation','proforma','advance','credit_note')),
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','issued','partial','paid','overdue','cancelled')),
  service_type VARCHAR(100),
  description TEXT,
  notes TEXT,
  email_sent_at TIMESTAMP,
  email_sent_to VARCHAR(255),
  pdf_path VARCHAR(500),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  recurring_schedule_id INTEGER,
  created_by INTEGER,
  approved_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. invoice_lines
CREATE TABLE invoice_lines (
  id BIGSERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 18. invoice_payments
CREATE TABLE invoice_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. recurring_invoice_schedules
CREATE TABLE recurring_invoice_schedules (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  project_id INTEGER,
  cost_center_id INTEGER,
  template_lines JSONB NOT NULL,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('monthly','quarterly','annual')),
  day_of_month INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,
  auto_send BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','paused','stopped','expired')),
  total_generated INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. purchase_invoices
CREATE TABLE purchase_invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  cost_center_id INTEGER REFERENCES cost_centers(id),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','issued','partial','paid','overdue','cancelled')),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. purchase_invoice_lines
CREATE TABLE purchase_invoice_lines (
  id BIGSERIAL PRIMARY KEY,
  purchase_invoice_id INTEGER NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  account_id INTEGER NOT NULL REFERENCES accounts(id)
);

-- 22. supplier_payments
CREATE TABLE supplier_payments (
  id SERIAL PRIMARY KEY,
  purchase_invoice_id INTEGER NOT NULL REFERENCES purchase_invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. employees
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  department VARCHAR(100),
  position VARCHAR(100),
  base_salary DECIMAL(15,2) NOT NULL,
  fixed_allowances DECIMAL(15,2) DEFAULT 0,
  join_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active','terminated')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. employee_advances
CREATE TABLE employee_advances (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  amount DECIMAL(15,2) NOT NULL,
  monthly_deduction DECIMAL(15,2) NOT NULL,
  remaining DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active','paid')),
  journal_entry_id INTEGER REFERENCES journal_entries(id)
);

-- 25. payroll_periods
CREATE TABLE payroll_periods (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','paid')),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (year, month, company_id)
);

-- 26. payroll_items
CREATE TABLE payroll_items (
  id BIGSERIAL PRIMARY KEY,
  payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  gross_salary DECIMAL(15,2) NOT NULL,
  bonuses DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  taxes DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL
);

-- 27. fixed_assets
CREATE TABLE fixed_assets (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  cost_center_id INTEGER REFERENCES cost_centers(id),
  purchase_date DATE NOT NULL,
  original_cost DECIMAL(15,2) NOT NULL,
  salvage_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  useful_life_years INT NOT NULL,
  depreciation_method VARCHAR(50) NOT NULL DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line','declining_balance')),
  declining_rate DECIMAL(5,2),
  accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
  current_book_value DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','disposed','sold')),
  disposal_date DATE,
  disposal_value DECIMAL(15,2),
  asset_account_id INTEGER NOT NULL REFERENCES accounts(id),
  depreciation_account_id INTEGER NOT NULL REFERENCES accounts(id),
  expense_account_id INTEGER NOT NULL REFERENCES accounts(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. asset_depreciations
CREATE TABLE asset_depreciations (
  id BIGSERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES fixed_assets(id),
  year INT NOT NULL,
  month INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. bank_movements
CREATE TABLE bank_movements (
  id BIGSERIAL PRIMARY KEY,
  bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit','withdrawal','transfer')),
  amount DECIMAL(15,2) NOT NULL,
  description VARCHAR(500),
  reference_type VARCHAR(50),
  reference_id INTEGER,
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 30. period_locks
CREATE TABLE period_locks (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'soft' CHECK (type IN ('soft','hard')),
  locked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_by INTEGER NOT NULL REFERENCES users(id),
  unlocked_at TIMESTAMP,
  unlocked_by INTEGER REFERENCES users(id),
  unlock_reason TEXT,
  notes TEXT,
  UNIQUE (year, month)
);

-- 31. exchange_rates
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  from_currency CHAR(3) NOT NULL,
  to_currency CHAR(3) NOT NULL,
  rate DECIMAL(10,4) NOT NULL,
  source VARCHAR(50),
  UNIQUE (date, from_currency, to_currency)
);

-- 32. custom_reports
CREATE TABLE custom_reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  definition JSONB NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
