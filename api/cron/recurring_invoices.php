<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use App\Core\Database;
use App\Core\Logger;
use App\Controllers\InvoiceController;

// Since this is a CLI script, we don't have Auth context.
// We can mock the system user id (e.g., 1) or add a specific system user.
putenv('SYSTEM_CRON=true');

Logger::info("Starting Recurring Invoices Cron Job");

try {
    $today = date('Y-m-d');
    
    // Find active schedules that are due today or in the past
    $schedules = Database::fetchAll(
        "SELECT * FROM recurring_invoice_schedules 
         WHERE status = 'active' 
         AND next_run_date <= ? 
         AND (end_date IS NULL OR end_date >= ?)", 
        [$today, $today]
    );

    foreach ($schedules as $schedule) {
        Database::beginTransaction();
        
        try {
            // Generate Invoice via the same logic we would use in Controller
            // But we simulate a request
            $lines = json_decode($schedule['template_lines'], true);
            
            // Re-use logic or better, abstract the Invoice creation into a Service instead of Controller
            // For the sake of this cron, we insert directly
            
            $subtotal = 0;
            foreach ($lines as $line) {
                $subtotal += ($line['quantity'] * $line['unit_price']);
            }
            $taxRate = 14; 
            $taxAmount = $subtotal * ($taxRate / 100);
            $totalAmount = $subtotal + $taxAmount;

            $year = date('Y');
            $prefix = ($schedule['company_id'] == 1 ? 'BGK' : 'O2N') . "-INV-$year-";
            $lastInv = Database::fetch("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1", ["$prefix%"]);
            $newNum = $lastInv ? str_pad((string)((int)substr($lastInv['invoice_number'], -5) + 1), 5, '0', STR_PAD_LEFT) : '00001';
            $invoiceNumber = $prefix . $newNum;
            
            $dueDate = date('Y-m-d', strtotime('+14 days'));

            Database::query(
                "INSERT INTO invoices (invoice_number, customer_id, company_id, project_id, cost_center_id, invoice_date, due_date, type, subtotal, tax_rate, tax_amount, total_amount, status, recurring_schedule_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'invoice', ?, ?, ?, ?, 'draft', ?, 1)",
                [
                    $invoiceNumber, $schedule['customer_id'], $schedule['company_id'], $schedule['project_id'], $schedule['cost_center_id'], 
                    $today, $dueDate, $subtotal, $taxRate, $taxAmount, $totalAmount, $schedule['id']
                ]
            );
            $invoiceId = Database::lastInsertId();

            foreach ($lines as $line) {
                Database::query(
                    "INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)",
                    [$invoiceId, $line['description'], $line['quantity'], $line['unit_price']]
                );
            }

            // Calculate next run date
            $nextRun = new \DateTime($schedule['next_run_date']);
            if ($schedule['frequency'] === 'monthly') {
                $nextRun->modify('+1 month');
            } elseif ($schedule['frequency'] === 'quarterly') {
                $nextRun->modify('+3 months');
            } elseif ($schedule['frequency'] === 'annual') {
                $nextRun->modify('+1 year');
            }
            
            Database::query(
                "UPDATE recurring_invoice_schedules SET next_run_date = ?, total_generated = total_generated + 1 WHERE id = ?",
                [$nextRun->format('Y-m-d'), $schedule['id']]
            );
            
            Database::commit();
            Logger::info("Generated recurring invoice #$invoiceNumber for Schedule ID {$schedule['id']}");
            
            // If auto_send is true, we should approve and email it
            // This would normally call the Engine and EmailService

        } catch (\Exception $e) {
            Database::rollBack();
            Logger::error("Failed to generate recurring invoice for Schedule ID {$schedule['id']}: " . $e->getMessage());
        }
    }
    
} catch (\Exception $e) {
    Logger::critical($e);
}

Logger::info("Completed Recurring Invoices Cron Job");
