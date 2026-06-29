<?php
declare(strict_types=1);
namespace App\Services;

use App\Core\Database;
use App\Core\Auth;
use App\Core\Exceptions\ValidationException;

class AccountingEngine {
    
    private static function checkPeriodLock(int $companyId, string $date): void {
        $year = (int)date('Y', strtotime($date));
        $month = (int)date('m', strtotime($date));
        
        $lock = Database::fetch(
            "SELECT type FROM period_locks WHERE year = ? AND month = ?", 
            [$year, $month]
        );

        if ($lock && $lock['type'] === 'hard') {
            throw new ValidationException(["date" => "Financial period for $year-$month is hard-locked. No transactions can be recorded."]);
        }
    }

    private static function generateEntryNumber(): string {
        // JE-YYYY-XXXXX
        $year = date('Y');
        $prefix = "JE-$year-";
        $lastEntry = Database::fetch("SELECT entry_number FROM journal_entries WHERE entry_number LIKE ? ORDER BY id DESC LIMIT 1", ["$prefix%"]);
        
        if ($lastEntry) {
            $lastNum = (int)substr($lastEntry['entry_number'], strlen($prefix));
            $newNum = str_pad((string)($lastNum + 1), 5, '0', STR_PAD_LEFT);
        } else {
            $newNum = '00001';
        }
        return $prefix . $newNum;
    }

    private static function postEntry(array $header, array $lines): int {
        self::checkPeriodLock((int)$header['company_id'], $header['entry_date']);

        $totalDebit = 0;
        $totalCredit = 0;
        foreach ($lines as $line) {
            $totalDebit = bcadd((string)$totalDebit, (string)($line['debit'] ?? 0), 2);
            $totalCredit = bcadd((string)$totalCredit, (string)($line['credit'] ?? 0), 2);
        }

        if (bccomp((string)$totalDebit, (string)$totalCredit, 2) !== 0) {
            throw new \Exception("Journal entry is not balanced. Debit: $totalDebit, Credit: $totalCredit");
        }

        $entryId = 0;
        try {
            Database::beginTransaction();

            $entryNum = self::generateEntryNumber();
            
            Database::query(
                "INSERT INTO journal_entries (entry_number, company_id, entry_date, description, reference_type, reference_id, total_debit, total_credit, status, created_by, posted_by, posted_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'posted', ?, ?, NOW())",
                [
                    $entryNum,
                    $header['company_id'],
                    $header['entry_date'],
                    $header['description'],
                    $header['reference_type'],
                    $header['reference_id'] ?? null,
                    $totalDebit,
                    $totalCredit,
                    Auth::id(),
                    Auth::id()
                ]
            );

            $entryId = (int)Database::lastInsertId();

            $lineNum = 1;
            foreach ($lines as $line) {
                Database::query(
                    "INSERT INTO journal_lines (journal_entry_id, line_number, account_id, description, debit, credit, currency, exchange_rate, cost_center_id, project_id, customer_id, supplier_id, bank_account_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $entryId,
                        $lineNum++,
                        $line['account_id'],
                        $line['description'] ?? $header['description'],
                        $line['debit'] ?? 0,
                        $line['credit'] ?? 0,
                        $line['currency'] ?? 'EGP',
                        $line['exchange_rate'] ?? 1.0,
                        $line['cost_center_id'] ?? null,
                        $line['project_id'] ?? null,
                        $line['customer_id'] ?? null,
                        $line['supplier_id'] ?? null,
                        $line['bank_account_id'] ?? null
                    ]
                );
            }

            Database::commit();
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }

        return $entryId;
    }

    public static function postInvoice(array $invoice): int {
        // AR: Debit Accounts Receivable (1102)
        // CR: Sales Revenue (4101)
        // CR: Taxes Payable (2102) if applicable
        
        $lines = [];
        
        // Debit AR
        $lines[] = [
            'account_id' => 29, // Using dummy IDs based on seed (Customer AR account)
            'description' => "Invoice #" . $invoice['invoice_number'],
            'debit' => $invoice['total_amount'],
            'customer_id' => $invoice['customer_id'],
            'project_id' => $invoice['project_id'] ?? null,
            'cost_center_id' => $invoice['cost_center_id'] ?? null
        ];

        // Credit Revenue
        $revenueAmount = bcsub((string)$invoice['subtotal'], (string)$invoice['discount_amount'], 2);
        $lines[] = [
            'account_id' => 37, // Sales Revenue
            'description' => "Revenue for Invoice #" . $invoice['invoice_number'],
            'credit' => $revenueAmount,
            'project_id' => $invoice['project_id'] ?? null,
            'cost_center_id' => $invoice['cost_center_id'] ?? null
        ];

        // Credit Tax if any
        if ($invoice['tax_amount'] > 0) {
            $lines[] = [
                'account_id' => 33, // Taxes Payable
                'description' => "VAT for Invoice #" . $invoice['invoice_number'],
                'credit' => $invoice['tax_amount']
            ];
        }

        return self::postEntry([
            'company_id' => $invoice['company_id'],
            'entry_date' => $invoice['invoice_date'],
            'description' => "Recording Sales Invoice #" . $invoice['invoice_number'],
            'reference_type' => 'invoice',
            'reference_id' => $invoice['id']
        ], $lines);
    }

    public static function postInvoicePayment(array $payment, array $invoice, array $bankAccount): int {
        // Debit Bank
        // Credit AR
        
        $lines = [
            [
                'account_id' => $bankAccount['account_id'],
                'description' => "Payment received for Invoice #" . $invoice['invoice_number'],
                'debit' => $payment['amount'],
                'bank_account_id' => $bankAccount['id']
            ],
            [
                'account_id' => 29, // AR
                'description' => "Payment applied to Invoice #" . $invoice['invoice_number'],
                'credit' => $payment['amount'],
                'customer_id' => $invoice['customer_id']
            ]
        ];

        return self::postEntry([
            'company_id' => $invoice['company_id'],
            'entry_date' => $payment['payment_date'],
            'description' => "Payment Received - Invoice #" . $invoice['invoice_number'],
            'reference_type' => 'invoice_payment',
            'reference_id' => $payment['id']
        ], $lines);
    }

    // Additional methods like postPurchaseInvoice, postBankTransfer, postPayroll would follow the exact same strict dual-entry pattern.
    
    public static function postBankTransfer(array $transfer, array $fromBank, array $toBank): int {
        $lines = [
            [
                'account_id' => $toBank['account_id'],
                'description' => $transfer['description'] ?? "Bank Transfer",
                'debit' => $transfer['amount'],
                'bank_account_id' => $toBank['id']
            ],
            [
                'account_id' => $fromBank['account_id'],
                'description' => $transfer['description'] ?? "Bank Transfer",
                'credit' => $transfer['amount'],
                'bank_account_id' => $fromBank['id']
            ]
        ];

        return self::postEntry([
            'company_id' => $fromBank['company_id'] ?? 1, // Handling intercompany carefully in real app
            'entry_date' => $transfer['date'],
            'description' => $transfer['description'] ?? "Bank Transfer",
            'reference_type' => 'bank_movement',
            'reference_id' => $transfer['id']
        ], $lines);
    }
}
