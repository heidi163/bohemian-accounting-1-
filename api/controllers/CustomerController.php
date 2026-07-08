<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Permission;
use App\Core\Logger;

class CustomerController {
    public function index(Request $request): void {
        Permission::check('customers', 'view');
        
        // Fetch customers with their current outstanding balance
        // In a real optimized system, this might use a materialized view or trigger-updated balance column
        $customers = Database::fetchAll(
            "SELECT c.*, 
             COALESCE((SELECT SUM(total_amount - paid_amount) FROM invoices WHERE customer_id = c.id AND status NOT IN ('draft', 'cancelled', 'paid')), 0) as outstanding_balance
             FROM customers c
             ORDER BY c.name ASC"
        );
        
        Response::success($customers);
    }

    public function store(Request $request): void {
        Permission::check('customers', 'create');
        
        $data = Validator::validate($request->all(), [
            'name' => 'required',
            'email' => 'email',
            'credit_limit' => 'numeric'
        ]);
        
        // Generate Customer Code
        $year = date('Y');
        $lastCust = Database::fetch("SELECT code FROM customers WHERE code LIKE ? ORDER BY id DESC LIMIT 1", ["CUST-$year-%"]);
        $newNum = $lastCust ? str_pad((string)((int)substr($lastCust['code'], -4) + 1), 4, '0', STR_PAD_LEFT) : '0001';
        $code = "CUST-$year-$newNum";

        Database::query(
            "INSERT INTO customers (code, name, email, phone, tax_id, address, credit_limit)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                $code,
                $data['name'],
                $request->input('email'),
                $request->input('phone'),
                $request->input('tax_id'),
                $request->input('address'),
                $request->input('credit_limit', 0)
            ]
        );
        
        $customerId = Database::lastInsertId();
        
        Logger::audit('CREATE', 'CUSTOMER', (int)$customerId, [], ['code' => $code, 'name' => $data['name']]);
        
        Response::success(['id' => $customerId, 'code' => $code], 'Customer created successfully');
    }

    private function getStatementData(string $id): array {
        $customer = Database::fetch("SELECT * FROM customers WHERE id = ?", [$id]);
        if (!$customer) throw new \App\Core\Exceptions\NotFoundException("Customer not found");

        $statement = Database::fetchAll(
            "SELECT jl.id, je.entry_date, je.description, je.reference_type, je.reference_id, jl.debit, jl.credit
             FROM journal_lines jl
             JOIN journal_entries je ON jl.journal_entry_id = je.id
             WHERE jl.customer_id = ? AND je.status = 'posted'
             ORDER BY je.entry_date ASC, je.id ASC",
            [$id]
        );

        $runningBalance = 0;
        foreach ($statement as &$row) {
            $runningBalance += ($row['debit'] - $row['credit']);
            $row['balance'] = $runningBalance;
        }

        $invoices = Database::fetchAll(
            "SELECT (total_amount - paid_amount) as remaining,
             DATEDIFF(CURDATE(), due_date) as days_overdue
             FROM invoices 
             WHERE customer_id = ? AND status IN ('issued', 'partial', 'overdue')",
            [$id]
        );

        $aging = ['0_30' => 0, '31_60' => 0, '61_90' => 0, '90_plus' => 0, 'current' => 0];
        foreach ($invoices as $inv) {
            if ($inv['days_overdue'] <= 0) {
                $aging['current'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 30) {
                $aging['0_30'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 60) {
                $aging['31_60'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 90) {
                $aging['61_90'] += $inv['remaining'];
            } else {
                $aging['90_plus'] += $inv['remaining'];
            }
        }

        return [
            'customer' => $customer,
            'statement' => $statement,
            'closing_balance' => $runningBalance,
            'aging_summary' => $aging
        ];
    }

    public function statement(Request $request, string $id): void {
        Permission::check('customers', 'view');
        
        $data = $this->getStatementData($id);

        Response::success([
            'customer' => $data['customer'],
            'statement' => $data['statement'],
            'closing_balance' => $data['closing_balance']
        ]);
    }

    public function downloadStatement(Request $request, string $id): void {
        Permission::check('customers', 'view');
        
        $data = $this->getStatementData($id);
        
        try {
            $pdfPath = \App\Services\PDFService::generateCustomerStatementPdf(
                $data['customer'], 
                $data['statement'], 
                $data['closing_balance'], 
                $data['aging_summary']
            );
            
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="Statement_' . $data['customer']['code'] . '.pdf"');
            header('Content-Length: ' . filesize($pdfPath));
            readfile($pdfPath);
            exit;
        } catch (\Exception $e) {
            Response::error("Failed to generate PDF: " . $e->getMessage(), 500);
        }
    }

    public function emailStatement(Request $request, string $id): void {
        Permission::check('customers', 'view');
        
        $data = $this->getStatementData($id);
        
        if (empty($data['customer']['email'])) {
            Response::error("Customer does not have an email address set.", 400);
            return;
        }
        
        try {
            $pdfPath = \App\Services\PDFService::generateCustomerStatementPdf(
                $data['customer'], 
                $data['statement'], 
                $data['closing_balance'], 
                $data['aging_summary']
            );
            
            $success = \App\Services\EmailService::sendCustomerStatement(
                $data['customer']['email'],
                $data['customer']['name'],
                $pdfPath
            );
            
            if ($success) {
                Response::success(null, "Statement sent successfully to {$data['customer']['email']}");
            } else {
                Response::error("Failed to send email statement", 500);
            }
        } catch (\Exception $e) {
            Response::error("Failed to generate PDF or send email: " . $e->getMessage(), 500);
        }
    }

    public function aging(Request $request, string $id): void {
        Permission::check('customers', 'view');
        
        // Fetch unpaid invoices and group by age
        $invoices = Database::fetchAll(
            "SELECT id, invoice_number, invoice_date, due_date, (total_amount - paid_amount) as remaining,
             DATEDIFF(CURDATE(), due_date) as days_overdue
             FROM invoices 
             WHERE customer_id = ? AND status IN ('issued', 'partial', 'overdue')
             ORDER BY due_date ASC",
            [$id]
        );

        $aging = ['0_30' => 0, '31_60' => 0, '61_90' => 0, '90_plus' => 0, 'current' => 0];
        
        foreach ($invoices as $inv) {
            if ($inv['days_overdue'] <= 0) {
                $aging['current'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 30) {
                $aging['0_30'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 60) {
                $aging['31_60'] += $inv['remaining'];
            } elseif ($inv['days_overdue'] <= 90) {
                $aging['61_90'] += $inv['remaining'];
            } else {
                $aging['90_plus'] += $inv['remaining'];
            }
        }

        Response::success([
            'aging_summary' => $aging,
            'outstanding_invoices' => $invoices
        ]);
    }
}
