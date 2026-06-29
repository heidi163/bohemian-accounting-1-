<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Permission;
use App\Core\Auth;
use App\Core\Logger;
use App\Services\AccountingEngine;
use App\Core\Exceptions\NotFoundException;

class InvoiceController {
    public function index(Request $request): void {
        Permission::check('invoices', 'view');
        
        $companyId = $request->query('company_id', 1); // default to BGK
        
        $invoices = Database::fetchAll(
            "SELECT i.*, c.name as customer_name 
             FROM invoices i 
             JOIN customers c ON i.customer_id = c.id 
             WHERE i.company_id = ? 
             ORDER BY i.invoice_date DESC, i.id DESC", 
            [$companyId]
        );
        
        Response::success($invoices);
    }

    public function show(Request $request, string $id): void {
        Permission::check('invoices', 'view');
        
        $invoice = Database::fetch(
            "SELECT i.*, c.name as customer_name 
             FROM invoices i 
             JOIN customers c ON i.customer_id = c.id 
             WHERE i.id = ?", 
            [$id]
        );
        
        if (!$invoice) throw new NotFoundException("Invoice not found");
        
        $lines = Database::fetchAll("SELECT * FROM invoice_lines WHERE invoice_id = ?", [$id]);
        $invoice['lines'] = $lines;
        
        Response::success($invoice);
    }

    public function store(Request $request): void {
        Permission::check('invoices', 'create');
        
        $data = Validator::validate($request->all(), [
            'customer_id' => 'required|numeric|exists:customers,id',
            'company_id' => 'required|numeric|exists:companies,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date',
            'type' => 'required|in:invoice,quotation,proforma',
            'lines' => 'required',
            'discount_amount' => 'numeric'
        ]);

        Database::beginTransaction();
        try {
            // Calculate totals
            $subtotal = 0;
            foreach ($data['lines'] as $line) {
                $subtotal += ($line['quantity'] * $line['unit_price']);
            }
            $discount = $data['discount_amount'] ?? 0;
            $taxRate = 14; // Default VAT
            $taxableAmount = $subtotal - $discount;
            $taxAmount = $taxableAmount * ($taxRate / 100);
            $totalAmount = $taxableAmount + $taxAmount;

            // Generate Invoice Number
            $year = date('Y', strtotime($data['invoice_date']));
            $prefix = ($data['company_id'] == 1 ? 'BGK' : 'O2N') . "-INV-$year-";
            $lastInv = Database::fetch("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1", ["$prefix%"]);
            $newNum = $lastInv ? str_pad((string)((int)substr($lastInv['invoice_number'], -5) + 1), 5, '0', STR_PAD_LEFT) : '00001';
            $invoiceNumber = $prefix . $newNum;

            // Insert Header
            Database::query(
                "INSERT INTO invoices (invoice_number, customer_id, company_id, invoice_date, due_date, type, subtotal, discount_amount, tax_rate, tax_amount, total_amount, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)",
                [
                    $invoiceNumber, $data['customer_id'], $data['company_id'], $data['invoice_date'], $data['due_date'], 
                    $data['type'], $subtotal, $discount, $taxRate, $taxAmount, $totalAmount, Auth::id()
                ]
            );
            $invoiceId = Database::lastInsertId();

            // Insert Lines
            foreach ($data['lines'] as $line) {
                Database::query(
                    "INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)",
                    [$invoiceId, $line['description'], $line['quantity'], $line['unit_price']]
                );
            }

            Logger::audit('CREATE', 'INVOICE', (int)$invoiceId, [], ['invoice_number' => $invoiceNumber]);
            Database::commit();
            
            Response::success(['id' => $invoiceId, 'invoice_number' => $invoiceNumber], 'Invoice created successfully');
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function approve(Request $request, string $id): void {
        Permission::check('invoices', 'approve');
        
        $invoice = Database::fetch("SELECT * FROM invoices WHERE id = ?", [$id]);
        if (!$invoice) throw new NotFoundException("Invoice not found");
        if ($invoice['status'] !== 'draft') throw new \Exception("Only draft invoices can be approved");

        Database::beginTransaction();
        try {
            // Post journal entry via Engine
            $journalEntryId = AccountingEngine::postInvoice($invoice);
            
            // Update Invoice
            Database::query(
                "UPDATE invoices SET status = 'issued', journal_entry_id = ?, approved_by = ? WHERE id = ?",
                [$journalEntryId, Auth::id(), $id]
            );
            
            Logger::audit('APPROVE', 'INVOICE', (int)$id);
            Database::commit();
            
            Response::success(null, 'Invoice approved and posted to ledger');
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function recordPayment(Request $request, string $id): void {
        Permission::check('invoices', 'pay');
        
        $data = Validator::validate($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'bank_account_id' => 'required|numeric|exists:bank_accounts,id'
        ]);

        $invoice = Database::fetch("SELECT * FROM invoices WHERE id = ?", [$id]);
        if (!$invoice) throw new NotFoundException("Invoice not found");
        
        $remaining = $invoice['total_amount'] - $invoice['paid_amount'];
        if ($data['amount'] > $remaining) {
            throw new ValidationException(['amount' => 'Payment exceeds remaining balance']);
        }

        $bank = Database::fetch("SELECT * FROM bank_accounts WHERE id = ?", [$data['bank_account_id']]);

        Database::beginTransaction();
        try {
            $paymentId = 0; // In a real app we'd insert into invoice_payments table first
            
            // This would normally insert into invoice_payments first to get an ID.
            Database::query(
                "INSERT INTO invoice_payments (invoice_id, amount, payment_date, bank_account_id) VALUES (?, ?, ?, ?)",
                [$id, $data['amount'], $data['payment_date'], $data['bank_account_id']]
            );
            $paymentId = Database::lastInsertId();

            $paymentRecord = ['id' => $paymentId, 'amount' => $data['amount'], 'payment_date' => $data['payment_date']];

            // Record accounting entry
            $journalEntryId = AccountingEngine::postInvoicePayment($paymentRecord, $invoice, $bank);
            
            // Update Payment record with journal ID
            Database::query("UPDATE invoice_payments SET journal_entry_id = ? WHERE id = ?", [$journalEntryId, $paymentId]);

            // Update Invoice status
            $newPaid = $invoice['paid_amount'] + $data['amount'];
            $newStatus = ($newPaid >= $invoice['total_amount']) ? 'paid' : 'partial';
            Database::query("UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?", [$newPaid, $newStatus, $id]);
            
            Logger::audit('PAYMENT', 'INVOICE', (int)$id, ['paid' => $invoice['paid_amount']], ['paid' => $newPaid]);
            Database::commit();
            
            Response::success(null, 'Payment recorded successfully');
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }
}
