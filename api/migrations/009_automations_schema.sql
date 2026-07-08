CREATE TABLE automations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_run TIMESTAMP NULL,
    next_run TIMESTAMP NULL,
    last_status VARCHAR(50) DEFAULT 'pending',
    command_or_script VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default automations
INSERT INTO automations (name, type, schedule_cron, status, last_status, command_or_script) VALUES
('تحديث أسعار الصرف', 'Exchange Rate Updates', 'يومياً (00:00)', 'active', 'success', 'exchange_rates.php'),
('النسخ الاحتياطي اليومي', 'Daily Backups', 'يومياً (02:00)', 'active', 'success', 'db_backup.php'),
('إرسال ملخص يومي', 'Daily Summary Emails', 'يومياً (08:00)', 'active', 'success', 'daily_summary.php'),
('إنشاء الفواتير المتكررة', 'Recurring Invoices', 'شهرياً (يوم 1)', 'active', 'success', 'recurring_invoices.php'),
('تسجيل القيود المتكررة', 'Recurring Journal Entries', 'شهرياً (يوم 28)', 'active', 'failed', 'recurring_journals.php'),
('حساب الإهلاك الشهري', 'Monthly Depreciation', 'نهاية كل شهر', 'active', 'pending', 'depreciation.php');
