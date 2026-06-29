<?php
declare(strict_types=1);
namespace App\Core;

class Logger {
    private static function write(string $level, string $message, array $context = []): void {
        $date = date('Y-m-d');
        $time = date('Y-m-d H:i:s');
        $logDir = __DIR__ . '/../storage/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        $file = "$logDir/app-$date.log";
        $contextStr = empty($context) ? '' : json_encode($context, JSON_UNESCAPED_UNICODE);
        $line = "[$time] $level: $message $contextStr" . PHP_EOL;
        
        error_log($line, 3, $file);
    }

    public static function info(string $message, array $context = []): void {
        self::write('INFO', $message, $context);
    }

    public static function error(string $message, array $context = []): void {
        self::write('ERROR', $message, $context);
    }

    public static function critical(\Throwable $e): void {
        self::write('CRITICAL', $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
    }

    // Business Logic Audit Trail
    public static function audit(string $action, string $entityType, ?int $entityId, array $oldValues = [], array $newValues = []): void {
        // Will write to activity_log table when Auth context is ready
        try {
            $userId = null; // Get from Auth context
            $username = null; // Get from Auth context
            
            Database::query(
                "INSERT INTO activity_log (user_id, username, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $userId,
                    $username,
                    $action,
                    $entityType,
                    $entityId,
                    empty($oldValues) ? null : json_encode($oldValues, JSON_UNESCAPED_UNICODE),
                    empty($newValues) ? null : json_encode($newValues, JSON_UNESCAPED_UNICODE),
                    $_SERVER['REMOTE_ADDR'] ?? null,
                    $_SERVER['HTTP_USER_AGENT'] ?? null
                ]
            );
        } catch (\Exception $e) {
            self::critical($e);
        }
    }
}
