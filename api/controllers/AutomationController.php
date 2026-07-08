<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Services\AutomationService;

class AutomationController {
    public function index(Request $request): void {
        $automations = Database::fetchAll("SELECT * FROM automations ORDER BY id ASC");
        Response::success($automations);
    }

    public function store(Request $request): void {
        $data = Validator::validate($request->all(), [
            'name' => 'required|string',
            'type' => 'required|string',
            'schedule_cron' => 'required|string'
        ]);

        Database::query(
            "INSERT INTO automations (name, type, schedule_cron, status, last_status) VALUES (?, ?, ?, 'active', 'pending')",
            [$data['name'], $data['type'], $data['schedule_cron']]
        );
        $id = Database::lastInsertId();
        
        $newJob = Database::fetch("SELECT * FROM automations WHERE id = ?", [$id]);
        Response::success($newJob, 'Automation created successfully');
    }

    public function toggle(Request $request, string $id): void {
        $automation = Database::fetch("SELECT * FROM automations WHERE id = ?", [$id]);
        if (!$automation) throw new \Exception("Automation not found");

        $newStatus = $automation['status'] === 'active' ? 'inactive' : 'active';
        Database::query("UPDATE automations SET status = ? WHERE id = ?", [$newStatus, $id]);

        Response::success(['status' => $newStatus], 'Status toggled successfully');
    }

    public function run(Request $request, string $id): void {
        $automation = Database::fetch("SELECT * FROM automations WHERE id = ?", [$id]);
        if (!$automation) throw new \Exception("Automation not found");

        $result = AutomationService::executeTask($automation);

        Response::success($result, 'Task executed successfully');
    }
}
