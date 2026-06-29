<?php
declare(strict_types=1);
namespace App\Core;

use PDO;
use PDOException;
use App\Core\Logger;

class Database {
    private static ?PDO $instance = null;
    private static int $transactionDepth = 0;

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $db   = getenv('DB_NAME') ?: 'bohemian_accounting';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASS') ?: '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                Logger::critical($e);
                throw new \Exception("Database connection failed", 500);
            }
        }
        return self::$instance;
    }

    public static function beginTransaction(): void {
        $db = self::getInstance();
        if (self::$transactionDepth === 0) {
            $db->beginTransaction();
        } else {
            $db->exec("SAVEPOINT LEVEL" . self::$transactionDepth);
        }
        self::$transactionDepth++;
    }

    public static function commit(): void {
        $db = self::getInstance();
        self::$transactionDepth--;
        if (self::$transactionDepth === 0) {
            $db->commit();
        } else {
            $db->exec("RELEASE SAVEPOINT LEVEL" . self::$transactionDepth);
        }
    }

    public static function rollBack(): void {
        $db = self::getInstance();
        self::$transactionDepth--;
        if (self::$transactionDepth === 0) {
            $db->rollBack();
        } else {
            $db->exec("ROLLBACK TO SAVEPOINT LEVEL" . self::$transactionDepth);
        }
    }

    public static function query(string $sql, array $params = []): \PDOStatement {
        $stmt = self::getInstance()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function fetchAll(string $sql, array $params = []): array {
        return self::query($sql, $params)->fetchAll();
    }

    public static function fetch(string $sql, array $params = []) {
        return self::query($sql, $params)->fetch();
    }

    public static function lastInsertId(): string {
        return self::getInstance()->lastInsertId();
    }
}
