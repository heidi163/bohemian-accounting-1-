<?php
declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\InvoiceController;

// Auth Routes
$router->post('/api/auth/login', [AuthController::class, 'login']);

// API Routes protected by JWT
$router->group(['prefix' => '/api', 'middleware' => [\App\Core\Middleware\AuthMiddleware::class]], function($router) {
    
    // Invoices
    $router->get('/invoices', [InvoiceController::class, 'index']);
    $router->get('/invoices/{id}', [InvoiceController::class, 'show']);
    $router->post('/invoices', [InvoiceController::class, 'store']);
    $router->post('/invoices/{id}/approve', [InvoiceController::class, 'approve']);
    $router->post('/invoices/{id}/pay', [InvoiceController::class, 'recordPayment']);
    
});
