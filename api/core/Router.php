<?php
declare(strict_types=1);
namespace App\Core;

use App\Core\Exceptions\NotFoundException;

class Router {
    private array $routes = [];
    private array $groupMiddleware = [];
    private string $groupPrefix = '';

    public function group(array $attributes, callable $callback): void {
        $previousPrefix = $this->groupPrefix;
        $previousMiddleware = $this->groupMiddleware;

        if (isset($attributes['prefix'])) {
            $this->groupPrefix .= $attributes['prefix'];
        }
        if (isset($attributes['middleware'])) {
            $this->groupMiddleware = array_merge($this->groupMiddleware, (array)$attributes['middleware']);
        }

        $callback($this);

        $this->groupPrefix = $previousPrefix;
        $this->groupMiddleware = $previousMiddleware;
    }

    public function get(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, array $handler, array $middleware = []): void {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, array $handler, array $middleware): void {
        $fullPath = $this->groupPrefix . $path;
        $fullMiddleware = array_merge($this->groupMiddleware, $middleware);
        
        // Convert route params {id} to regex capturing groups
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $fullPath);
        $pattern = "#^" . $pattern . "$#";

        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
            'middleware' => $fullMiddleware
        ];
    }

    public function loadRoutes(string $file): void {
        if (file_exists($file)) {
            $router = $this;
            require $file;
        }
    }

    public function dispatch(Request $request): void {
        $method = $request->method();
        $path = $request->path();

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $path, $matches)) {
                // Execute middleware
                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    $middleware->handle($request);
                }

                // Extract params
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // Execute handler
                [$class, $method] = $route['handler'];
                $controller = new $class();
                $controller->$method($request, ...array_values($params));
                return;
            }
        }

        throw new NotFoundException("Route not found: $method $path");
    }
}
