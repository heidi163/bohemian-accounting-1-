<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Permission;
use App\Core\Logger;
use App\Services\PDFService;
use App\Services\EmailService;

class PayrollController {
    
    public function index(Request $request): void {
        Permission::check('payroll', 'view');
        
        $companyId = (int)$request->query('company_id', 1);
        
        // Fetch payrolls with aggregated items
        $payrolls = Database::fetchAll(
            "SELECT p.id, 
                    CONCAT(p.year, '-', LPAD(p.month::text, 2, '0')) as period, 
                    p.created_at::date as date,
                    p.status,
                    p.company_id,
                    COALESCE(SUM(i.gross_salary), 0) as total_basic,
                    COALESCE(SUM(i.bonuses), 0) as total_bonuses,
                    COALESCE(SUM(i.deductions), 0) as total_deductions,
                    COALESCE(SUM(i.taxes), 0) as total_taxes,
                    0 as total_allowances,
                    0 as total_social_insurance,
                    COALESCE(SUM(i.net_salary), 0) as net_salary
             FROM payroll_periods p
             LEFT JOIN payroll_items i ON p.id = i.payroll_period_id
             WHERE p.company_id = ?
             GROUP BY p.id
             ORDER BY p.year DESC, p.month DESC",
            [$companyId]
        );
        
        Response::success($payrolls);
    }
    
    public function store(Request $request): void {
        Permission::check('payroll', 'create');
        
        $companyId = (int)$request->input('company_id', 1);
        $period = $request->input('period'); // Format YYYY-MM
        
        if (!$period || !preg_match('/^\d{4}-\d{2}$/', $period)) {
            Response::error('Invalid period format. Use YYYY-MM.', 400);
            return;
        }
        
        list($year, $month) = explode('-', $period);
        $year = (int)$year;
        $month = (int)$month;
        
        try {
            Database::beginTransaction();
            
            // Check if period already exists
            $existing = Database::fetch("SELECT id FROM payroll_periods WHERE year = ? AND month = ? AND company_id = ?", [$year, $month, $companyId]);
            if ($existing) {
                Response::error('Payroll for this period already exists.', 400);
                Database::rollBack();
                return;
            }
            
            $payrollId = Database::insert('payroll_periods', [
                'year' => $year,
                'month' => $month,
                'company_id' => $companyId,
                'status' => 'draft'
            ]);
            
            // Get all active employees for this company
            $employees = Database::fetchAll("SELECT id, base_salary, fixed_allowances FROM employees WHERE company_id = ? AND status = 'active'", [$companyId]);
            
            foreach ($employees as $emp) {
                $gross = $emp['base_salary'] + $emp['fixed_allowances'];
                // Dummy taxes calculation for now (10% tax, 5% deductions)
                $taxes = $gross * 0.1; 
                $deductions = $gross * 0.05;
                $bonuses = 0;
                $net = $gross + $bonuses - $deductions - $taxes;
                
                Database::insert('payroll_items', [
                    'payroll_period_id' => $payrollId,
                    'employee_id' => $emp['id'],
                    'gross_salary' => $gross,
                    'bonuses' => $bonuses,
                    'deductions' => $deductions,
                    'taxes' => $taxes,
                    'net_salary' => $net
                ]);
            }
            
            Database::commit();
            Logger::info("Created payroll period $period for company $companyId");
            Response::success(['id' => $payrollId], 'Payroll period created successfully');
            
        } catch (\Exception $e) {
            Database::rollBack();
            Response::error('Failed to create payroll: ' . $e->getMessage(), 500);
        }
    }
    
    public function approve(Request $request, string $id): void {
        Permission::check('payroll', 'approve');
        
        $payroll = Database::fetch("SELECT * FROM payroll_periods WHERE id = ?", [$id]);
        if (!$payroll) {
            Response::error('Payroll not found', 404);
            return;
        }
        
        if ($payroll['status'] !== 'draft') {
            Response::error('Only draft payrolls can be approved', 400);
            return;
        }
        
        try {
            Database::beginTransaction();
            
            Database::update('payroll_periods', ['status' => 'paid'], $id); // Paid equivalent to approved in UI
            
            // TODO: Generate Journal Entry for payroll
            
            Database::commit();
            Logger::info("Approved payroll period ID $id");
            Response::success(null, 'Payroll approved successfully');
            
        } catch (\Exception $e) {
            Database::rollBack();
            Response::error('Failed to approve payroll: ' . $e->getMessage(), 500);
        }
    }
    
    public function exportPdf(Request $request, string $id): void {
        Permission::check('payroll', 'view');
        
        $payroll = Database::fetch("SELECT * FROM payroll_periods WHERE id = ?", [$id]);
        if (!$payroll) {
            Response::error('Payroll not found', 404);
            return;
        }
        
        $items = Database::fetchAll(
            "SELECT i.*, e.name as employee_name, e.code as employee_code, e.position 
             FROM payroll_items i
             JOIN employees e ON i.employee_id = e.id
             WHERE i.payroll_period_id = ?",
            [$id]
        );
        
        try {
            $pdfPath = PDFService::generatePayslipsPdf($payroll, $items);
            
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="Payslips_' . $payroll['year'] . '_' . $payroll['month'] . '.pdf"');
            header('Content-Length: ' . filesize($pdfPath));
            readfile($pdfPath);
            exit;
        } catch (\Exception $e) {
            Response::error("Failed to generate PDF: " . $e->getMessage(), 500);
        }
    }
    
    public function emailPayslips(Request $request, string $id): void {
        Permission::check('payroll', 'approve');
        
        $payroll = Database::fetch("SELECT * FROM payroll_periods WHERE id = ?", [$id]);
        if (!$payroll) {
            Response::error('Payroll not found', 404);
            return;
        }
        
        $items = Database::fetchAll(
            "SELECT i.*, e.name as employee_name, e.code as employee_code, e.position 
             FROM payroll_items i
             JOIN employees e ON i.employee_id = e.id
             WHERE i.payroll_period_id = ?",
            [$id]
        );
        
        try {
            $successCount = 0;
            $failedCount = 0;
            
            foreach ($items as $item) {
                // Dummy email since employees table lacks email
                $email = "employee{$item['employee_id']}@bohemiangeeks.com";
                
                // Generate individual PDF for the employee
                $pdfPath = PDFService::generatePayslipsPdf($payroll, [$item]);
                
                $sent = EmailService::sendPayslip($email, $item['employee_name'], $payroll['year'], $payroll['month'], $pdfPath);
                if ($sent) {
                    $successCount++;
                } else {
                    $failedCount++;
                }
            }
            
            Response::success([
                'sent' => $successCount,
                'failed' => $failedCount
            ], "Payslips sent. Success: $successCount, Failed: $failedCount");
            
        } catch (\Exception $e) {
            Response::error("Failed to email payslips: " . $e->getMessage(), 500);
        }
    }
}
