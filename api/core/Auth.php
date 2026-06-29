<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Exceptions\UnauthorizedException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private static ?array $user = null;

    public static function attempt(string $email, string $password): ?array {
        $user = Database::fetch("SELECT * FROM users WHERE email = ? AND is_active = 1", [$email]);
        
        if (!$user) {
            return null;
        }

        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            throw new UnauthorizedException("Account is locked. Please try again later.");
        }

        if (password_verify($password, $user['password'])) {
            // Reset failed attempts
            Database::query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [$user['id']]);
            return $user;
        }

        // Handle failed attempts
        $attempts = $user['failed_attempts'] + 1;
        $lockedUntil = $attempts >= 5 ? date('Y-m-d H:i:s', strtotime('+15 minutes')) : null;
        Database::query("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?", [$attempts, $lockedUntil, $user['id']]);
        
        return null;
    }

    public static function generateToken(array $user): string {
        $secret = getenv('JWT_SECRET') ?: 'bohemian-accounting-secret-key-change-in-production';
        $payload = [
            'iss' => 'bohemian-accounting',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 8), // 8 hours
            'sub' => $user['id'],
            'role' => $user['role']
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    public static function check(Request $request): void {
        $token = $request->bearerToken();
        if (!$token) {
            throw new UnauthorizedException("Token not provided");
        }

        try {
            $secret = getenv('JWT_SECRET') ?: 'bohemian-accounting-secret-key-change-in-production';
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            
            $user = Database::fetch("SELECT id, name, email, role FROM users WHERE id = ? AND is_active = 1", [$decoded->sub]);
            if (!$user) {
                throw new UnauthorizedException("User not found or inactive");
            }

            self::$user = $user;
        } catch (\Exception $e) {
            throw new UnauthorizedException("Invalid token: " . $e->getMessage());
        }
    }

    public static function user(): ?array {
        return self::$user;
    }

    public static function id(): ?int {
        return self::$user['id'] ?? null;
    }
}
