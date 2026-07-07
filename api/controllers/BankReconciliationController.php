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
use App\Core\Exceptions\ValidationException;

class BankReconciliationController {
    
    public function import(Request $request, string $bankAccountId): void {
        Permission::check('banks', 'manage');
        
        // In a real implementation, we would use $_FILES to read an uploaded CSV
        // Here we'll simulate the parsing logic
        
        $lines = $request->input('lines') ?? []; // Expecting array of rows from CSV parsed by frontend or body
        
        if (empty($lines)) {
            throw new ValidationException(['lines' => 'No statement lines provided for import']);
        }

        Database::transaction(function() use ($bankAccountId, $lines) {
            foreach ($lines as $row) {
                Database::query(
                    "INSERT INTO bank_statement_lines (bank_account_id, date, description, debit, credit, balance, status)
                     VALUES (?, ?, ?, ?, ?, ?, 'unmatched')",
                    [
                        $bankAccountId,
                        $row['date'],
                        $row['description'],
                        $row['debit'] ?? 0,
                        $row['credit'] ?? 0,
                        $row['balance'] ?? null
                    ]
                );
            }
            
            Logger::audit('IMPORT', 'BANK_STATEMENT', (int)$bankAccountId, [], ['lines_count' => count($lines)]);
        });

        // Trigger auto-match immediately
        $matchedCount = $this->autoMatch((int)$bankAccountId);
        
        Response::success(['matched_count' => $matchedCount], 'Bank statement imported and auto-matching completed');
    }

    private function autoMatch(int $bankAccountId): int {
        $unmatched = Database::fetchAll(
            "SELECT * FROM bank_statement_lines WHERE bank_account_id = ? AND status = 'unmatched'",
            [$bankAccountId]
        );
        
        $matchedCount = 0;

        Database::transaction(function() use ($unmatched, &$matchedCount) {
            foreach ($unmatched as $line) {
                // Find a matching movement:
                // amount matches (statement debit = movement deposit, statement credit = movement withdrawal)
                // date within +/- 2 days
                
                $amount = $line['debit'] > 0 ? $line['debit'] : $line['credit'];
                $type = $line['debit'] > 0 ? 'deposit' : 'withdrawal'; // from bank's perspective, a statement debit increases our balance (deposit) or vice versa depending on statement format. Assuming standard accounting where debit to bank = increase.
                
                // Let's assume statement format: debit = money in, credit = money out.
                // bank_movements: deposit = money in, withdrawal = money out.
                
                $match = Database::fetch(
                    "SELECT id FROM bank_movements 
                     WHERE bank_account_id = ? 
                     AND reconciled = FALSE 
                     AND type = ?
                     AND amount = ?
                     AND date >= DATE_SUB(?, INTERVAL 2 DAY)
                     AND date <= DATE_ADD(?, INTERVAL 2 DAY)
                     LIMIT 1",
                    [$line['bank_account_id'], $type, $amount, $line['date'], $line['date']]
                );

                if ($match) {
                    // Match found!
                    Database::query(
                        "UPDATE bank_statement_lines SET status = 'matched', matched_movement_id = ? WHERE id = ?",
                        [$match['id'], $line['id']]
                    );
                    
                    Database::query(
                        "UPDATE bank_movements SET reconciled = TRUE, reconciled_at = NOW() WHERE id = ?",
                        [$match['id']]
                    );
                    
                    $matchedCount++;
                }
            }
        });

        return $matchedCount;
    }
}
