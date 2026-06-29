-- 001_schema.sql
-- Bohemian Accounting System - Database Schema

SET FOREIGN_KEY_CHECKS = 0;

-- 1. companies
CREATE TABLE companies (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. users
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin','fm','accountant','junior','viewer') NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. user_permissions
CREATE TABLE user_permissions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_module_action (user_id, module, action),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. settings
CREATE TABLE settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. activity_log
CREATE TABLE activity_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,
  username VARCHAR(150),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT UNSIGNED,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. account_types
CREATE TABLE account_types (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category ENUM('asset','liability','equity','revenue','expense') NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. accounts
CREATE TABLE accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) DEFAULT NULL,
  account_type_id INT UNSIGNED NOT NULL,
  parent_id INT UNSIGNED DEFAULT NULL,
  level ENUM('main','sub','detail') NOT NULL DEFAULT 'sub',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  allow_direct_entry TINYINT(1) NOT NULL DEFAULT 1,
  scope ENUM('all','bgk','o2n') NOT NULL DEFAULT 'all',
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (account_type_id) REFERENCES account_types(id),
  FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. cost_centers
CREATE TABLE cost_centers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  parent_id INT UNSIGNED DEFAULT NULL,
  manager_id INT UNSIGNED DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (parent_id) REFERENCES cost_centers(id) ON DELETE SET NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. customers
CREATE TABLE customers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  address TEXT,
  credit_limit DECIMAL(15,2) DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. customer_contacts
CREATE TABLE customer_contacts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  title VARCHAR(100),
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. projects
CREATE TABLE projects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  customer_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  default_cost_center_id INT UNSIGNED,
  start_date DATE NOT NULL,
  end_date DATE,
  type ENUM('fixed','monthly','hourly') NOT NULL,
  contract_value DECIMAL(15,2),
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  status ENUM('active','completed','cancelled','on_hold') NOT NULL DEFAULT 'active',
  budget_revenue DECIMAL(15,2),
  budget_cost DECIMAL(15,2),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (default_cost_center_id) REFERENCES cost_centers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. bank_accounts
CREATE TABLE bank_accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type ENUM('bank','cash') NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  company_id INT UNSIGNED,
  account_id INT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. suppliers
CREATE TABLE suppliers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. journal_entries
CREATE TABLE journal_entries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_number VARCHAR(30) NOT NULL UNIQUE,
  company_id INT UNSIGNED NOT NULL,
  entry_date DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  reference_type ENUM('manual','invoice','invoice_payment','purchase',
    'supplier_payment','payroll','bank_movement','tax_payment',
    'loan_payment','partner_movement','depreciation','opening_balance',
    'closing','adjusting','reversing','intercompany') NOT NULL DEFAULT 'manual',
  reference_id INT UNSIGNED DEFAULT NULL,
  reversed_entry_id INT UNSIGNED DEFAULT NULL,
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_balanced TINYINT(1) GENERATED ALWAYS AS (ABS(total_debit - total_credit) < 0.01) STORED,
  status ENUM('draft','pending_approval','posted','reversed') NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by INT UNSIGNED,
  approved_by INT UNSIGNED,
  posted_by INT UNSIGNED,
  posted_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (posted_by) REFERENCES users(id),
  FOREIGN KEY (reversed_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. journal_lines
CREATE TABLE journal_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  journal_entry_id INT UNSIGNED NOT NULL,
  line_number INT NOT NULL DEFAULT 1,
  account_id INT UNSIGNED NOT NULL,
  description VARCHAR(500),
  debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  cost_center_id INT UNSIGNED DEFAULT NULL,
  project_id INT UNSIGNED DEFAULT NULL,
  customer_id INT UNSIGNED DEFAULT NULL,
  supplier_id INT UNSIGNED DEFAULT NULL,
  bank_account_id INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. invoices
CREATE TABLE invoices (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  project_id INT UNSIGNED DEFAULT NULL,
  cost_center_id INT UNSIGNED DEFAULT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  type ENUM('invoice','quotation','proforma','advance','credit_note') NOT NULL DEFAULT 'invoice',
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status ENUM('draft','pending_approval','issued','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  service_type VARCHAR(100),
  description TEXT,
  notes TEXT,
  email_sent_at DATETIME,
  email_sent_to VARCHAR(255),
  pdf_path VARCHAR(500),
  journal_entry_id INT UNSIGNED,
  recurring_schedule_id INT UNSIGNED,
  created_by INT UNSIGNED,
  approved_by INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. invoice_lines
CREATE TABLE invoice_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id INT UNSIGNED NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  PRIMARY KEY (id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. invoice_payments
CREATE TABLE invoice_payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id INT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id INT UNSIGNED NOT NULL,
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. recurring_invoice_schedules
CREATE TABLE recurring_invoice_schedules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  project_id INT UNSIGNED,
  cost_center_id INT UNSIGNED,
  template_lines JSON NOT NULL,
  frequency ENUM('monthly','quarterly','annual') NOT NULL,
  day_of_month INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,
  auto_send TINYINT(1) DEFAULT 1,
  status ENUM('active','paused','stopped','expired') DEFAULT 'active',
  total_generated INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. purchase_invoices
CREATE TABLE purchase_invoices (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  cost_center_id INT UNSIGNED DEFAULT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EGP',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('draft','pending_approval','issued','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. purchase_invoice_lines
CREATE TABLE purchase_invoice_lines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purchase_invoice_id INT UNSIGNED NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. supplier_payments
CREATE TABLE supplier_payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  purchase_invoice_id INT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id INT UNSIGNED NOT NULL,
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoices(id),
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. employees
CREATE TABLE employees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  base_salary DECIMAL(15,2) NOT NULL,
  fixed_allowances DECIMAL(15,2) DEFAULT 0,
  join_date DATE NOT NULL,
  status ENUM('active','terminated') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. employee_advances
CREATE TABLE employee_advances (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id INT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  monthly_deduction DECIMAL(15,2) NOT NULL,
  remaining DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  status ENUM('active','paid') NOT NULL DEFAULT 'active',
  journal_entry_id INT UNSIGNED,
  PRIMARY KEY (id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. payroll_periods
CREATE TABLE payroll_periods (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  year INT NOT NULL,
  month INT NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  status ENUM('draft','approved','paid') NOT NULL DEFAULT 'draft',
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_year_month_company (year, month, company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. payroll_items
CREATE TABLE payroll_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payroll_period_id INT UNSIGNED NOT NULL,
  employee_id INT UNSIGNED NOT NULL,
  gross_salary DECIMAL(15,2) NOT NULL,
  bonuses DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  taxes DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. fixed_assets
CREATE TABLE fixed_assets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  company_id INT UNSIGNED NOT NULL,
  cost_center_id INT UNSIGNED,
  purchase_date DATE NOT NULL,
  original_cost DECIMAL(15,2) NOT NULL,
  salvage_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  useful_life_years INT NOT NULL,
  depreciation_method ENUM('straight_line','declining_balance') NOT NULL DEFAULT 'straight_line',
  declining_rate DECIMAL(5,2),
  accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
  current_book_value DECIMAL(15,2),
  status ENUM('active','disposed','sold') DEFAULT 'active',
  disposal_date DATE,
  disposal_value DECIMAL(15,2),
  asset_account_id INT UNSIGNED NOT NULL,
  depreciation_account_id INT UNSIGNED NOT NULL,
  expense_account_id INT UNSIGNED NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id),
  FOREIGN KEY (asset_account_id) REFERENCES accounts(id),
  FOREIGN KEY (depreciation_account_id) REFERENCES accounts(id),
  FOREIGN KEY (expense_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. asset_depreciations
CREATE TABLE asset_depreciations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id INT UNSIGNED NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (asset_id) REFERENCES fixed_assets(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. bank_movements
CREATE TABLE bank_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bank_account_id INT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  type ENUM('deposit','withdrawal','transfer') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description VARCHAR(500),
  reference_type VARCHAR(50),
  reference_id INT UNSIGNED,
  journal_entry_id INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. period_locks
CREATE TABLE period_locks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  year INT NOT NULL,
  month INT NOT NULL,
  type ENUM('soft','hard') NOT NULL DEFAULT 'soft',
  locked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_by INT UNSIGNED NOT NULL,
  unlocked_at DATETIME,
  unlocked_by INT UNSIGNED,
  unlock_reason TEXT,
  notes TEXT,
  PRIMARY KEY (id),
  UNIQUE KEY uk_year_month (year, month),
  FOREIGN KEY (locked_by) REFERENCES users(id),
  FOREIGN KEY (unlocked_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. exchange_rates
CREATE TABLE exchange_rates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL,
  from_currency CHAR(3) NOT NULL,
  to_currency CHAR(3) NOT NULL,
  rate DECIMAL(10,4) NOT NULL,
  source VARCHAR(50),
  PRIMARY KEY (id),
  UNIQUE KEY uk_date_pair (date, from_currency, to_currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. custom_reports
CREATE TABLE custom_reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  definition JSON NOT NULL,
  created_by INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
