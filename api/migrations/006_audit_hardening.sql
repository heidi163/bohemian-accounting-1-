-- 006_audit_hardening.sql
-- Bohemian Accounting System - Audit Trail Hardening

-- Enable Row Level Security on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow only INSERT operations
CREATE POLICY audit_insert_only ON activity_log
    FOR INSERT WITH CHECK (true);

-- Ensure NO ONE can UPDATE or DELETE, not even the application user
REVOKE UPDATE, DELETE ON activity_log FROM PUBLIC;

-- Optionally, create a readonly role and grant SELECT to it, but standard app user shouldn't be able to alter.
