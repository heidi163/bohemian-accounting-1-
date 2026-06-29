<?php
declare(strict_types=1);
namespace App\Core\Middleware;

use App\Core\Auth;
use App\Core\Request;

class AuthMiddleware {
    public function handle(Request $request): void {
        Auth::check($request);
    }
}
