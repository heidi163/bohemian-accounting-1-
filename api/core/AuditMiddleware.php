<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Database;
use App\Core\Auth;
use App\Core\Logger;

class AuditMiddleware {
    /**
     * Log an action to the immutable audit trail.
     * 
     * @param string $action 'CREATE', 'UPDATE', 'DELETE', etc.
     * @param string $entityType 'invoice', 'journal_entry', 'user', etc.
     * @param int $entityId ID of the affected record
     * @param array $oldValues Previous state of the record (if applicable)
     * @param array $newValues New state of the record
     */
    public static function log(
        string $action,
        string $entityType,
        int    $entityId,
        array  $oldValues = [],
        array  $newValues = []
    ): void {
        try {
            $userId = Auth::id() ?: null;
            
            // Get username safely, falling back to 'System' or unknown
            $username = 'System';
            if ($userId) {
                // To avoid multiple queries on every log, we could cache the user info in Auth,
                // but let's query safely here for completeness.
                $user = Database::fetch("SELECT name FROM users WHERE id = ?", [$userId]);
                if ($user) {
                    $username = $user['name'];
                }
            }

            $oldJson = json_encode($oldValues, JSON_UNESCAPED_UNICODE);
            $newJson = json_encode($newValues, JSON_UNESCAPED_UNICODE);
            
            // Generate HMAC signature to make the log tamper-evident
            $secret = getenv('AUDIT_SECRET') ?: 'default-dev-audit-secret-key-123';
            $payload = "{$userId}|{$username}|{$action}|{$entityType}|{$entityId}|{$oldJson}|{$newJson}";
            $hash = hash_hmac('sha256', $payload, $secret);

            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown CLI';

            Database::query(
                "INSERT INTO activity_log (user_id, username, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, hash, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                [
                    $userId,
                    $username,
                    $action,
                    $entityType,
                    $entityId,
                    $oldJson,
                    $newJson,
                    $ipAddress,
                    $userAgent,
                    $hash
                ]
            );
        } catch (\Exception $e) {
            // We should ensure audit logging failures don't crash the main transaction
            // unless strict auditing is required.
            Logger::error("Failed to write to Audit Trail: " . $e->getMessage());
        }
    }
}
