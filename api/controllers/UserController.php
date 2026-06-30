<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Permission;
use App\Core\Logger;

class UserController {
    public function index(Request $request): void {
        Permission::check('users', 'view');
        
        $companyId = $request->query('company_id', 1);

        $users = Database::fetchAll(
            "SELECT id, name, email, role, status, last_login 
             FROM users 
             WHERE company_id = ? 
             ORDER BY name ASC",
            [$companyId]
        );

        Response::success($users);
    }

    public function store(Request $request): void {
        Permission::check('users', 'create');
        
        $data = Validator::validate($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'role' => 'required',
            'company_id' => 'required|numeric'
        ]);

        // Default password for new users
        $password = password_hash('User@12345', PASSWORD_DEFAULT);

        Database::query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES (?, ?, ?, ?, ?, 'active')",
            [
                $data['name'],
                $data['email'],
                $password,
                $data['role'],
                $data['company_id']
            ]
        );
        
        $userId = Database::lastInsertId();
        Logger::audit('CREATE', 'USER', (int)$userId, [], ['email' => $data['email']]);

        Response::success(['id' => $userId], 'User created successfully');
    }

    public function destroy(Request $request, string $id): void {
        Permission::check('users', 'delete');
        
        // Prevent deleting oneself
        if ($id == \App\Core\Auth::id()) {
            throw new \Exception("Cannot delete your own account");
        }

        Database::query("UPDATE users SET status = 'inactive' WHERE id = ?", [$id]);
        
        Logger::audit('DELETE', 'USER', (int)$id);
        
        Response::success(null, 'User deactivated successfully');
    }
}
