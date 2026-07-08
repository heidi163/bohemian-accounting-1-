<?php
declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\InvoiceController;

// Auth Routes
$router->post('/api/auth/login', [AuthController::class, 'login']);

// API Routes protected by JWT
$router->group(['prefix' => '/api', 'middleware' => [\App\Core\Middleware\AuthMiddleware::class]], function($router) {
    
    // Invoices
    $router->get('/invoices', [\App\Controllers\InvoiceController::class, 'index']);
    $router->get('/invoices/{id}', [\App\Controllers\InvoiceController::class, 'show']);
    $router->post('/invoices', [\App\Controllers\InvoiceController::class, 'store']);
    $router->post('/invoices/{id}/approve', [\App\Controllers\InvoiceController::class, 'approve']);
    $router->post('/invoices/{id}/pay', [\App\Controllers\InvoiceController::class, 'recordPayment']);
    // Dashboard
    $router->get('/dashboard/metrics', [\App\Controllers\DashboardController::class, 'metrics']);
    
    // Accounts
    $router->get('/accounts', [\App\Controllers\AccountController::class, 'index']);
    $router->post('/accounts', [\App\Controllers\AccountController::class, 'store']);
    $router->get('/account-types', [\App\Controllers\AccountController::class, 'types']);
    
    // Customers
    $router->get('/customers', [\App\Controllers\CustomerController::class, 'index']);
    $router->post('/customers', [\App\Controllers\CustomerController::class, 'store']);
    $router->get('/customers/{id}/statement', [\App\Controllers\CustomerController::class, 'statement']);
    $router->get('/customers/{id}/statement/download', [\App\Controllers\CustomerController::class, 'downloadStatement']);
    $router->post('/customers/{id}/statement/email', [\App\Controllers\CustomerController::class, 'emailStatement']);
    $router->get('/customers/{id}/aging', [\App\Controllers\CustomerController::class, 'aging']);
    
    // Journal Entries
    $router->get('/journal-entries', [\App\Controllers\JournalController::class, 'index']);
    $router->get('/journal-entries/{id}', [\App\Controllers\JournalController::class, 'show']);
    $router->post('/journal-entries', [\App\Controllers\JournalController::class, 'store']);
    $router->post('/journal-entries/{id}/post', [\App\Controllers\JournalController::class, 'post']);
    $router->post('/journal-entries/{id}/reverse', [\App\Controllers\JournalController::class, 'reverse']);
    
    // Taxes
    $router->get('/taxes', [\App\Controllers\TaxController::class, 'index']);
    $router->post('/taxes/{id}/pay', [\App\Controllers\TaxController::class, 'pay']);
    $router->post('/taxes/{id}/post', [\App\Controllers\TaxController::class, 'post']);
    
    // Settings
    $router->get('/settings', [\App\Controllers\SettingsController::class, 'show']);
    $router->post('/settings', [\App\Controllers\SettingsController::class, 'update']);
    
    // Users
    $router->get('/users', [\App\Controllers\UserController::class, 'index']);
    $router->post('/users', [\App\Controllers\UserController::class, 'store']);
    $router->post('/users/{id}/delete', [\App\Controllers\UserController::class, 'destroy']);
    
    // Automations
    $router->get('/automations', [\App\Controllers\AutomationController::class, 'index']);
    $router->post('/automations', [\App\Controllers\AutomationController::class, 'store']);
    $router->post('/automations/{id}/toggle', [\App\Controllers\AutomationController::class, 'toggle']);
    $router->post('/automations/{id}/run', [\App\Controllers\AutomationController::class, 'run']);
    
    // Payroll
    $router->get('/payroll', [\App\Controllers\PayrollController::class, 'index']);
    $router->post('/payroll', [\App\Controllers\PayrollController::class, 'store']);
    $router->post('/payroll/{id}/approve', [\App\Controllers\PayrollController::class, 'approve']);
    $router->get('/payroll/{id}/export', [\App\Controllers\PayrollController::class, 'exportPdf']);
    $router->post('/payroll/{id}/email', [\App\Controllers\PayrollController::class, 'emailPayslips']);
});
