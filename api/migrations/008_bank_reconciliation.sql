-- 008_bank_reconciliation.sql
-- Bohemian Accounting System - Bank Reconciliation

CREATE TABLE bank_statement_lines (
    id              BIGSERIAL PRIMARY KEY,
    bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
    date            DATE NOT NULL,
    description     TEXT,
    debit           NUMERIC(15,2) NOT NULL DEFAULT 0,
    credit          NUMERIC(15,2) NOT NULL DEFAULT 0,
    balance         NUMERIC(15,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'unmatched'
                    CHECK (status IN ('unmatched','matched','exception')),
    matched_movement_id BIGINT REFERENCES bank_movements(id) ON DELETE SET NULL,
    imported_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add reconciliation status to bank_movements
ALTER TABLE bank_movements ADD COLUMN reconciled BOOLEAN DEFAULT FALSE;
ALTER TABLE bank_movements ADD COLUMN reconciled_at TIMESTAMP;
