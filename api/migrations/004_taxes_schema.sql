-- 004_taxes_schema.sql
-- Bohemian Accounting System - Taxes Module Schema

SET FOREIGN_KEY_CHECKS = 0;

-- 33. taxes
CREATE TABLE taxes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id INT UNSIGNED NOT NULL,
  type ENUM('vat','income','withholding','payroll') NOT NULL,
  period VARCHAR(20) NOT NULL,
  liability_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status ENUM('pending','partial','paid','posted') NOT NULL DEFAULT 'pending',
  journal_entry_id INT UNSIGNED DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. tax_payments
CREATE TABLE tax_payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tax_id INT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  bank_account_id INT UNSIGNED NOT NULL,
  journal_entry_id INT UNSIGNED,
  created_by INT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
