<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Permission;
use App\Core\Auth;
use App\Core\Logger;

class AccountController {
    public function index(Request $request): void {
        Permission::check('accounts', 'view');
        
        $scope = $request->query('scope', 'all');
        
        // Fetch all accounts and their types
        $accounts = Database::fetchAll(
            "SELECT a.*, t.category, t.name_ar as type_name_ar, t.name_en as type_name_en
             FROM accounts a
             JOIN account_types t ON a.account_type_id = t.id
             WHERE a.scope = 'all' OR a.scope = ?
             ORDER BY a.code ASC",
            [$scope]
        );
        
        Response::success($accounts);
    }

    public function store(Request $request): void {
        Permission::check('accounts', 'create');
        
        $data = Validator::validate($request->all(), [
            'code' => 'required',
            'name_ar' => 'required',
            'account_type_id' => 'required|numeric|exists:account_types,id',
            'level' => 'required|in:main,sub,detail',
            'scope' => 'required|in:all,bgk,o2n'
        ]);
        
        // Check if code already exists
        $existing = Database::fetch("SELECT id FROM accounts WHERE code = ?", [$data['code']]);
        if ($existing) {
            throw new \App\Core\Exceptions\ValidationException(['code' => 'Account code already exists']);
        }
        
        $parentId = $request->input('parent_id');
        if ($parentId) {
            $parent = Database::fetch("SELECT id FROM accounts WHERE id = ?", [$parentId]);
            if (!$parent) {
                throw new \App\Core\Exceptions\ValidationException(['parent_id' => 'Parent account not found']);
            }
        }
        
        $allowDirectEntry = $request->input('allow_direct_entry', 1);

        Database::query(
            "INSERT INTO accounts (code, name_ar, name_en, account_type_id, parent_id, level, scope, allow_direct_entry, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['code'],
                $data['name_ar'],
                $request->input('name_en'),
                $data['account_type_id'],
                $parentId,
                $data['level'],
                $data['scope'],
                $allowDirectEntry,
                $request->input('description')
            ]
        );
        
        $accountId = Database::lastInsertId();
        
        // Trigger automatically logs this creation in activity_log
        
        Response::success(['id' => $accountId], 'Account created successfully');
    }
}
