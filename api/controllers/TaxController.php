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

class TaxController {
    public function index(Request $request): void {
        Permission::check('reports', 'view'); // Assuming reports or taxes permission
        
        $companyId = $request->query('company_id', 1);
        
        $taxes = Database::fetchAll(
            "SELECT * FROM taxes 
             WHERE company_id = ? 
             ORDER BY due_date ASC",
            [$companyId]
        );

        $summary = [
            'vat_liability' => 0, 'vat_paid' => 0,
            'income_liability' => 0, 'income_paid' => 0,
            'withholding_liability' => 0, 'withholding_paid' => 0,
            'payroll_liability' => 0, 'payroll_paid' => 0
        ];

        $records = [];

        foreach ($taxes as $tax) {
            $type = $tax['type'];
            if (isset($summary["{$type}_liability"])) {
                $summary["{$type}_liability"] += (float)$tax['liability_amount'];
                $summary["{$type}_paid"] += (float)$tax['paid_amount'];
            }
            
            $records[] = [
                'id' => $tax['id'],
                'type' => $tax['type'],
                'period' => $tax['period'],
                'liability_amount' => (float)$tax['liability_amount'],
                'paid_amount' => (float)$tax['paid_amount'],
                'due_date' => $tax['due_date'],
                'status' => $tax['status']
            ];
        }
        
        Response::success([
            'summary' => $summary,
            'records' => $records
        ]);
    }

    public function pay(Request $request, string $id): void {
        Permission::check('journals', 'create');
        
        $data = Validator::validate($request->all(), [
            'amount' => 'required|numeric',
            'bank_account_id' => 'required|numeric'
        ]);

        $tax = Database::fetch("SELECT * FROM taxes WHERE id = ?", [$id]);
        if (!$tax) throw new \App\Core\Exceptions\NotFoundException("Tax record not found");
        
        if ($tax['status'] === 'posted') {
            throw new \App\Core\Exceptions\ValidationException(['status' => 'Cannot pay a posted tax period.']);
        }

        $bankAccount = Database::fetch("SELECT * FROM bank_accounts WHERE id = ?", [$data['bank_account_id']]);
        if (!$bankAccount) throw new \App\Core\Exceptions\NotFoundException("Bank account not found");

        Database::transaction(function() use ($id, $data, $tax, $bankAccount) {
            $paymentData = [
                'tax_id' => $id,
                'amount' => $data['amount'],
                'payment_date' => date('Y-m-d'),
                'bank_account_id' => $data['bank_account_id'],
                'created_by' => Auth::id()
            ];

            // Record payment entry in AccountingEngine
            $journalEntryId = AccountingEngine::postTaxPayment($paymentData, $tax, $bankAccount);

            Database::query(
                "INSERT INTO tax_payments (tax_id, amount, payment_date, bank_account_id, journal_entry_id, created_by)
                 VALUES (?, ?, ?, ?, ?, ?)",
                [$id, $data['amount'], $paymentData['payment_date'], $data['bank_account_id'], $journalEntryId, Auth::id()]
            );

            // Update tax record
            $newPaid = (float)$tax['paid_amount'] + (float)$data['amount'];
            $newStatus = $newPaid >= (float)$tax['liability_amount'] ? 'paid' : 'partial';

            Database::query(
                "UPDATE taxes SET paid_amount = ?, status = ? WHERE id = ?",
                [$newPaid, $newStatus, $id]
            );

            Logger::audit('PAY', 'TAX', (int)$id, [], ['amount' => $data['amount'], 'journal_entry_id' => $journalEntryId]);
        });

        Response::success(null, 'Tax payment recorded successfully');
    }

    public function post(Request $request, string $id): void {
        Permission::check('journals', 'approve');
        
        $tax = Database::fetch("SELECT * FROM taxes WHERE id = ?", [$id]);
        if (!$tax) throw new \App\Core\Exceptions\NotFoundException("Tax record not found");
        if ($tax['status'] !== 'paid') throw new \App\Core\Exceptions\ValidationException(['status' => 'Tax period must be fully paid before posting']);

        Database::query(
            "UPDATE taxes SET status = 'posted' WHERE id = ?",
            [$id]
        );

        Logger::audit('POST', 'TAX', (int)$id);

        Response::success(null, 'Tax period posted and closed successfully');
    }
}
