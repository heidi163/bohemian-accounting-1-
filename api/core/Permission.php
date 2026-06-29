<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Exceptions\ForbiddenException;

class Permission {
    public static function check(string $module, string $action): void {
        $user = Auth::user();
        if (!$user) {
            throw new ForbiddenException("Not authenticated");
        }

        // Super admin has full access
        if ($user['role'] === 'super_admin') {
            return;
        }

        // Check specific permission
        $hasPermission = Database::fetch(
            "SELECT 1 FROM user_permissions WHERE user_id = ? AND module = ? AND action = ?",
            [$user['id'], $module, $action]
        );

        if (!$hasPermission) {
            throw new ForbiddenException("You do not have permission to perform this action.");
        }
    }
}
