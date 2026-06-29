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
    
    // Accounts
    $router->get('/accounts', [\App\Controllers\AccountController::class, 'index']);
    $router->post('/accounts', [\App\Controllers\AccountController::class, 'store']);
    
    // Customers
    $router->get('/customers', [\App\Controllers\CustomerController::class, 'index']);
    $router->post('/customers', [\App\Controllers\CustomerController::class, 'store']);
    $router->get('/customers/{id}/statement', [\App\Controllers\CustomerController::class, 'statement']);
    $router->get('/customers/{id}/aging', [\App\Controllers\CustomerController::class, 'aging']);
    
    // Journal Entries
    $router->get('/journal-entries', [\App\Controllers\JournalController::class, 'index']);
    $router->get('/journal-entries/{id}', [\App\Controllers\JournalController::class, 'show']);
    $router->post('/journal-entries', [\App\Controllers\JournalController::class, 'store']);
    $router->post('/journal-entries/{id}/post', [\App\Controllers\JournalController::class, 'post']);
    
});
