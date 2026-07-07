-- 007_einvoice_fields.sql
-- Bohemian Accounting System - E-Invoicing Fields

ALTER TABLE invoices ADD COLUMN eta_submission_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN eta_uuid VARCHAR(100);
ALTER TABLE invoices ADD COLUMN eta_status VARCHAR(50) DEFAULT 'not_submitted';
ALTER TABLE invoices ADD COLUMN zatca_qr TEXT;
ALTER TABLE invoices ADD COLUMN einvoice_submitted_at TIMESTAMP;
