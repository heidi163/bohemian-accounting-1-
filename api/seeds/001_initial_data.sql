-- 001_initial_data.sql
-- Seed data for Bohemian Accounting System

-- 1. Companies
INSERT INTO companies (code, name, currency) VALUES 
('BGK', 'Bohemian Geeks', 'EGP'),
('O2N', 'O2Nation', 'EGP');

-- 2. Users (Password is 'password123' bcrypt)
INSERT INTO users (name, email, password, role) VALUES 
('Heidi Medhat', 'heidi@bohemiangeeks.com', '$2y$12$L7R2QpXW7g6Y6X6L7R2Qp.XW7g6Y6X6L7R2QpXW7g6Y6X6L7R2QpX', 'super_admin'),
('Accountant', 'accountant@bohemiangeeks.com', '$2y$12$L7R2QpXW7g6Y6X6L7R2Qp.XW7g6Y6X6L7R2QpXW7g6Y6X6L7R2QpX', 'accountant');

-- 3. Account Types
INSERT INTO account_types (category, name_ar, name_en) VALUES 
('asset', 'الأصول', 'Assets'),
('liability', 'الخصوم', 'Liabilities'),
('equity', 'حقوق الملكية', 'Equity'),
('revenue', 'الإيرادات', 'Revenue'),
('expense', 'المصروفات', 'Expenses');

-- 4. Main Accounts (Level 1)
INSERT INTO accounts (code, name_ar, name_en, account_type_id, parent_id, level) VALUES 
('1', 'الأصول', 'Assets', 1, NULL, 'main'),
('2', 'الخصوم', 'Liabilities', 2, NULL, 'main'),
('3', 'حقوق الملكية', 'Equity', 3, NULL, 'main'),
('4', 'الإيرادات', 'Revenue', 4, NULL, 'main'),
('5', 'المصروفات', 'Expenses', 5, NULL, 'main');

-- 5. Sub Accounts (Level 2)
INSERT INTO accounts (code, name_ar, name_en, account_type_id, parent_id, level) VALUES 
('11', 'الأصول المتداولة', 'Current Assets', 1, 1, 'sub'),
('12', 'الأصول غير المتداولة', 'Non-Current Assets', 1, 1, 'sub'),
('21', 'الخصوم المتداولة', 'Current Liabilities', 2, 2, 'sub'),
('22', 'الخصوم غير المتداولة', 'Non-Current Liabilities', 2, 2, 'sub'),
('41', 'إيرادات النشاط الجاري', 'Operating Revenue', 4, 4, 'sub'),
('51', 'المصروفات التشغيلية', 'Operating Expenses', 5, 5, 'sub'),
('52', 'المصروفات الإدارية والعمومية', 'G&A Expenses', 5, 5, 'sub');

-- 6. Detail Accounts (Level 3 - Cash & Banks)
INSERT INTO accounts (code, name_ar, name_en, account_type_id, parent_id, level) VALUES 
('1101', 'النقدية وما في حكمها', 'Cash and Cash Equivalents', 1, 6, 'detail'),
('1102', 'العملاء (أوراق القبض)', 'Accounts Receivable', 1, 6, 'detail'),
('1201', 'الأصول الثابتة', 'Fixed Assets', 1, 7, 'detail'),
('1202', 'مجمع الإهلاك', 'Accumulated Depreciation', 1, 7, 'detail'),
('2101', 'الموردين (أوراق الدفع)', 'Accounts Payable', 2, 8, 'detail'),
('2102', 'الضرائب المستحقة', 'Taxes Payable', 2, 8, 'detail'),
('2103', 'الأجور والرواتب المستحقة', 'Accrued Payroll', 2, 8, 'detail'),
('3101', 'رأس المال', 'Capital', 3, 3, 'detail'),
('3102', 'الأرباح المحتجزة', 'Retained Earnings', 3, 3, 'detail'),
('4101', 'إيرادات المبيعات', 'Sales Revenue', 4, 10, 'detail'),
('5101', 'تكلفة المبيعات', 'Cost of Sales', 5, 11, 'detail'),
('5201', 'مصروفات الرواتب والأجور', 'Payroll Expenses', 5, 12, 'detail'),
('5202', 'مصروفات الإيجار', 'Rent Expense', 5, 12, 'detail'),
('5203', 'مصروفات تسويق', 'Marketing Expense', 5, 12, 'detail'),
('5204', 'مصروفات إهلاك', 'Depreciation Expense', 5, 12, 'detail');

-- 7. Detail Bank Accounts (Level 4)
INSERT INTO accounts (code, name_ar, name_en, account_type_id, parent_id, level) VALUES 
('1101001', 'البنك الأهلي المصري - جنيهاً (BGK)', 'NBE - EGP (BGK)', 1, 13, 'detail'),
('1101002', 'CIB - دولار (BGK)', 'CIB - USD (BGK)', 1, 13, 'detail'),
('1101003', 'بنك مصر - جنيهاً (O2N)', 'Banque Misr - EGP (O2N)', 1, 13, 'detail'),
('1101004', 'بنك الإسكندرية - دولار (O2N)', 'Alex Bank - USD (O2N)', 1, 13, 'detail'),
('1101005', 'الخزينة الرئيسية', 'Main Cash Box', 1, 13, 'detail');

-- 8. Bank Accounts table mapping
INSERT INTO bank_accounts (code, name, type, currency, company_id, account_id) VALUES 
('NBE-EGP', 'البنك الأهلي المصري - جنيهاً', 'bank', 'EGP', 1, 28),
('CIB-USD', 'CIB - دولار', 'bank', 'USD', 1, 29),
('BM-EGP', 'بنك مصر - جنيهاً', 'bank', 'EGP', 2, 30),
('ALEX-USD', 'بنك الإسكندرية - دولار', 'bank', 'USD', 2, 31),
('CASH-BOX', 'الخزينة الرئيسية', 'cash', 'EGP', NULL, 32);

-- 9. Cost Centers
INSERT INTO cost_centers (code, name_ar, name_en) VALUES 
('MKT', 'التسويق', 'Marketing'),
('DEV', 'التطوير البرمجي', 'Development'),
('VID', 'إنتاج الفيديو', 'Video Production'),
('DES', 'التصميم', 'Design'),
('MGT', 'الإدارة', 'Management');
