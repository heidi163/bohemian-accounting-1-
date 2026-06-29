<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Core\Logger;
use App\Core\Exceptions\UnauthorizedException;
use App\Core\Exceptions\ForbiddenException;
use App\Core\Exceptions\NotFoundException;
use App\Core\Exceptions\ValidationException;

try {
    $router = new Router();
    $router->loadRoutes(__DIR__ . '/config/routes.php');
    $router->dispatch(Request::current());
} catch (UnauthorizedException $e) {
    Response::error(401, $e->getMessage());
} catch (ForbiddenException $e) {
    Response::error(403, $e->getMessage());
} catch (NotFoundException $e) {
    Response::error(404, $e->getMessage());
} catch (ValidationException $e) {
    Response::error(422, $e->getMessage(), $e->getErrors());
} catch (Throwable $e) {
    Logger::critical($e);
    // In production, don't expose full error details
    $message = getenv('APP_DEBUG') === 'true' ? $e->getMessage() : 'Internal server error';
    Response::error(500, $message);
}
