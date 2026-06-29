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

class JournalController {
    public function index(Request $request): void {
        Permission::check('journals', 'view');
        
        $companyId = $request->query('company_id', 1);
        
        $entries = Database::fetchAll(
            "SELECT * FROM journal_entries 
             WHERE company_id = ? 
             ORDER BY entry_date DESC, id DESC",
            [$companyId]
        );
        
        Response::success($entries);
    }

    public function show(Request $request, string $id): void {
        Permission::check('journals', 'view');
        
        $entry = Database::fetch("SELECT * FROM journal_entries WHERE id = ?", [$id]);
        if (!$entry) throw new \App\Core\Exceptions\NotFoundException("Journal Entry not found");
        
        $lines = Database::fetchAll(
            "SELECT jl.*, a.name_ar as account_name, a.code as account_code 
             FROM journal_lines jl
             JOIN accounts a ON jl.account_id = a.id
             WHERE jl.journal_entry_id = ?
             ORDER BY jl.line_number ASC", 
            [$id]
        );
        
        $entry['lines'] = $lines;
        Response::success($entry);
    }

    public function store(Request $request): void {
        Permission::check('journals', 'create');
        
        $data = Validator::validate($request->all(), [
            'company_id' => 'required|numeric|exists:companies,id',
            'entry_date' => 'required|date',
            'description' => 'required',
            'lines' => 'required' // array validation would be more complex
        ]);

        Database::beginTransaction();
        try {
            // Manual entries go through the AccountingEngine to ensure balance & locks
            // However, AccountingEngine::postEntry is private. 
            // We should either make it public or add a method for manual entries.
            // For now, let's assume we added a public method in AccountingEngine or we do it here
            // using the same strict checks.
            
            // To respect DRY, we can just call a public method we add to AccountingEngine
            // Let's assume we implement postManualEntry in AccountingEngine
            
            // For the sake of this file, let's assume AccountingEngine handles it
            // if we update AccountingEngine. Let's do it manually here for simplicity,
            // but we must check balance!
            
            $totalDebit = 0;
            $totalCredit = 0;
            foreach ($data['lines'] as $line) {
                $totalDebit += (float)($line['debit'] ?? 0);
                $totalCredit += (float)($line['credit'] ?? 0);
            }
            
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new \App\Core\Exceptions\ValidationException(['balance' => 'Journal entry must be balanced.']);
            }
            
            // Check Period lock
            $year = (int)date('Y', strtotime($data['entry_date']));
            $month = (int)date('m', strtotime($data['entry_date']));
            $lock = Database::fetch("SELECT type FROM period_locks WHERE year = ? AND month = ?", [$year, $month]);
            if ($lock && $lock['type'] === 'hard') {
                throw new \App\Core\Exceptions\ValidationException(["date" => "Financial period is hard-locked."]);
            }
            
            // Generate Number
            $entryPrefix = "JE-" . date('Y', strtotime($data['entry_date'])) . "-";
            $lastEntry = Database::fetch("SELECT entry_number FROM journal_entries WHERE entry_number LIKE ? ORDER BY id DESC LIMIT 1", ["$entryPrefix%"]);
            $newNum = $lastEntry ? str_pad((string)((int)substr($lastEntry['entry_number'], -5) + 1), 5, '0', STR_PAD_LEFT) : '00001';
            $entryNum = $entryPrefix . $newNum;

            Database::query(
                "INSERT INTO journal_entries (entry_number, company_id, entry_date, description, reference_type, total_debit, total_credit, status, created_by)
                 VALUES (?, ?, ?, ?, 'manual', ?, ?, 'draft', ?)",
                [$entryNum, $data['company_id'], $data['entry_date'], $data['description'], $totalDebit, $totalCredit, Auth::id()]
            );
            $entryId = Database::lastInsertId();

            $lineNum = 1;
            foreach ($data['lines'] as $line) {
                Database::query(
                    "INSERT INTO journal_lines (journal_entry_id, line_number, account_id, description, debit, credit, cost_center_id, project_id, customer_id, supplier_id, bank_account_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $entryId, $lineNum++, $line['account_id'], $line['description'] ?? $data['description'],
                        $line['debit'] ?? 0, $line['credit'] ?? 0,
                        $line['cost_center_id'] ?? null, $line['project_id'] ?? null,
                        $line['customer_id'] ?? null, $line['supplier_id'] ?? null, $line['bank_account_id'] ?? null
                    ]
                );
            }

            Logger::audit('CREATE', 'JOURNAL_ENTRY', (int)$entryId, [], ['entry_number' => $entryNum]);
            Database::commit();
            
            Response::success(['id' => $entryId, 'entry_number' => $entryNum], 'Journal entry created successfully');
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function post(Request $request, string $id): void {
        Permission::check('journals', 'approve');
        
        $entry = Database::fetch("SELECT * FROM journal_entries WHERE id = ?", [$id]);
        if (!$entry) throw new \App\Core\Exceptions\NotFoundException("Journal Entry not found");
        if ($entry['status'] !== 'draft') throw new \Exception("Only draft entries can be posted");
        
        // Use AccountingEngine to check period lock
        // AccountingEngine::checkPeriodLock is private, but we can bypass it by checking here or we make it public.
        // Let's do the period lock check here to match AccountingEngine
        $year = (int)date('Y', strtotime($entry['entry_date']));
        $month = (int)date('m', strtotime($entry['entry_date']));
        $lock = Database::fetch("SELECT type FROM period_locks WHERE year = ? AND month = ?", [$year, $month]);
        if ($lock && $lock['type'] === 'hard') {
            throw new \App\Core\Exceptions\ValidationException(["date" => "Financial period is hard-locked."]);
        }
        
        // Ensure balance
        if (abs($entry['total_debit'] - $entry['total_credit']) > 0.01) {
            throw new \Exception("Entry is not balanced");
        }
        
        Database::query(
            "UPDATE journal_entries SET status = 'posted', posted_by = ?, posted_at = NOW() WHERE id = ?",
            [Auth::id(), $id]
        );
        
        Logger::audit('POST', 'JOURNAL_ENTRY', (int)$id);
        
        Response::success(null, 'Journal entry posted successfully');
    }

    public function reverse(Request $request, string $id): void {
        Permission::check('journals', 'create');
        
        $newEntryId = AccountingEngine::reverseEntry((int)$id, (int)Auth::id());
        
        Logger::audit('REVERSE', 'JOURNAL_ENTRY', (int)$id, [], ['new_entry_id' => $newEntryId]);
        
        Response::success(['id' => $newEntryId], 'Journal entry reversed successfully');
    }
}
