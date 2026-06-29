<?php
declare(strict_types=1);
namespace App\Core;

class Request {
    private array $data;
    private array $query;
    private string $method;
    private string $path;
    private array $headers;

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $this->query = $_GET;
        $this->headers = getallheaders();

        $input = file_get_contents('php://input');
        $this->data = json_decode($input, true) ?? $_POST;
    }

    public static function current(): self {
        return new self();
    }

    public function method(): string {
        return $this->method;
    }

    public function path(): string {
        // Strip /api prefix if present since our index.php is inside /api
        $path = $this->path;
        if (strpos($path, '/api/') === 0) {
            $path = substr($path, 4);
        }
        return $path;
    }

    public function input(string $key, $default = null) {
        return $this->data[$key] ?? $default;
    }

    public function all(): array {
        return $this->data;
    }

    public function query(string $key, $default = null) {
        return $this->query[$key] ?? $default;
    }

    public function header(string $key, string $default = ''): string {
        $key = strtolower($key);
        foreach ($this->headers as $k => $v) {
            if (strtolower($k) === $key) {
                return $v;
            }
        }
        return $default;
    }

    public function bearerToken(): ?string {
        $header = $this->header('Authorization');
        if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
