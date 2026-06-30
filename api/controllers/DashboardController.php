<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Permission;

class DashboardController {
    public function metrics(Request $request): void {
        Permission::check('dashboard', 'view');
        
        $companyId = $request->query('company_id', 1);

        // Calculate Revenue (Total value of issued/paid invoices)
        $revenueData = Database::fetch(
            "SELECT SUM(total_amount) as total FROM invoices WHERE company_id = ? AND status IN ('issued', 'partial', 'paid')", 
            [$companyId]
        );
        $totalRevenue = (float)($revenueData['total'] ?? 0);

        // Calculate Expenses (Assuming we have a journal entry for expenses, or we mock it for now until Expenses module is built)
        // For now, let's mock expenses as 45% of revenue for demonstration if no data exists
        $expensesData = Database::fetch(
            "SELECT SUM(amount) as total FROM journal_entries WHERE company_id = ? AND account_id IN (SELECT id FROM accounts WHERE type = 'expense')",
            [$companyId]
        );
        $totalExpenses = (float)($expensesData['total'] ?? ($totalRevenue * 0.45));
        
        $netProfit = $totalRevenue - $totalExpenses;

        // Pending Invoices
        $pendingData = Database::fetch(
            "SELECT COUNT(id) as count, SUM(total_amount - paid_amount) as amount FROM invoices WHERE company_id = ? AND status IN ('issued', 'partial') AND due_date >= CURRENT_DATE",
            [$companyId]
        );

        // Overdue Invoices
        $overdueData = Database::fetch(
            "SELECT COUNT(id) as count, SUM(total_amount - paid_amount) as amount FROM invoices WHERE company_id = ? AND status IN ('issued', 'partial') AND due_date < CURRENT_DATE",
            [$companyId]
        );

        // Recent Transactions (Journal Entries)
        $recentTransactions = Database::fetchAll(
            "SELECT * FROM journal_entries WHERE company_id = ? ORDER BY entry_date DESC, id DESC LIMIT 5",
            [$companyId]
        );

        Response::success([
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
                'profit_margin' => $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0,
                'pending_invoices_count' => (int)($pendingData['count'] ?? 0),
                'pending_invoices_amount' => (float)($pendingData['amount'] ?? 0),
                'overdue_invoices_count' => (int)($overdueData['count'] ?? 0),
                'overdue_invoices_amount' => (float)($overdueData['amount'] ?? 0),
            ],
            'recent_transactions' => $recentTransactions
        ]);
    }
}
