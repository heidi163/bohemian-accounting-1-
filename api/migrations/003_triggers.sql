-- 003_triggers.sql
-- Triggers for accounting rules and integrity

DELIMITER //

-- 1. Prevent modification or deletion of posted journal entries
CREATE TRIGGER before_journal_entry_update
BEFORE UPDATE ON journal_entries
FOR EACH ROW
BEGIN
    IF OLD.status = 'posted' AND NEW.status != 'reversed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify a posted journal entry.';
    END IF;
END //

CREATE TRIGGER before_journal_entry_delete
BEFORE DELETE ON journal_entries
FOR EACH ROW
BEGIN
    IF OLD.status = 'posted' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete a posted journal entry.';
    END IF;
END //

-- 2. Prevent modification or deletion of lines for posted journal entries
CREATE TRIGGER before_journal_line_update
BEFORE UPDATE ON journal_lines
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM journal_entries WHERE id = OLD.journal_entry_id;
    IF v_status = 'posted' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify lines of a posted journal entry.';
    END IF;
END //

CREATE TRIGGER before_journal_line_delete
BEFORE DELETE ON journal_lines
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM journal_entries WHERE id = OLD.journal_entry_id;
    IF v_status = 'posted' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete lines of a posted journal entry.';
    END IF;
END //

-- 3. Audit trail for critical actions on Accounts
CREATE TRIGGER after_account_insert
AFTER INSERT ON accounts
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (action, entity_type, entity_id, new_values)
    VALUES ('CREATE', 'ACCOUNT', NEW.id, JSON_OBJECT('code', NEW.code, 'name', NEW.name_ar));
END //

CREATE TRIGGER after_account_update
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (action, entity_type, entity_id, old_values, new_values)
    VALUES ('UPDATE', 'ACCOUNT', NEW.id, JSON_OBJECT('code', OLD.code, 'name', OLD.name_ar), JSON_OBJECT('code', NEW.code, 'name', NEW.name_ar));
END //

DELIMITER ;
