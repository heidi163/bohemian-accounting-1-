<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Validator;
use App\Core\Logger;
use App\Core\Exceptions\UnauthorizedException;

class AuthController {
    public function login(Request $request): void {
        $validated = Validator::validate($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = Auth::attempt($validated['email'], $validated['password']);

        if (!$user) {
            Logger::error("Failed login attempt for email: " . $validated['email'], ['ip' => $_SERVER['REMOTE_ADDR']]);
            throw new UnauthorizedException("Invalid credentials");
        }

        $token = Auth::generateToken($user);
        
        Logger::info("User logged in successfully", ['user_id' => $user['id']]);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    }
}
