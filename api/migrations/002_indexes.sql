-- 002_indexes.sql
-- Indexes for performance

-- Accounts
CREATE INDEX idx_accounts_parent_id ON accounts(parent_id);
CREATE INDEX idx_accounts_account_type_id ON accounts(account_type_id);

-- Cost Centers
CREATE INDEX idx_cost_centers_parent_id ON cost_centers(parent_id);

-- Projects
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Journal Entries
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_type, reference_id);

-- Journal Lines
CREATE INDEX idx_journal_lines_account_id ON journal_lines(account_id);
CREATE INDEX idx_journal_lines_cost_center_id ON journal_lines(cost_center_id);
CREATE INDEX idx_journal_lines_project_id ON journal_lines(project_id);
CREATE INDEX idx_journal_lines_customer_id ON journal_lines(customer_id);
CREATE INDEX idx_journal_lines_supplier_id ON journal_lines(supplier_id);

-- Invoices
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Purchase Invoices
CREATE INDEX idx_purchase_invoices_supplier_id ON purchase_invoices(supplier_id);
CREATE INDEX idx_purchase_invoices_invoice_date ON purchase_invoices(invoice_date);
CREATE INDEX idx_purchase_invoices_status ON purchase_invoices(status);

-- Activity Log
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
