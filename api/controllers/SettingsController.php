<?php
declare(strict_types=1);
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Validator;
use App\Core\Permission;
use App\Core\Logger;

class SettingsController {
    public function show(Request $request): void {
        Permission::check('settings', 'view');
        
        $companyId = $request->query('company_id', 1);

        $settings = Database::fetch(
            "SELECT * FROM settings WHERE company_id = ?",
            [$companyId]
        );

        if (!$settings) {
            // Default settings if none exist
            $settings = [
                'company_id' => $companyId,
                'theme_color' => '#1A293F', // Default to the newly established dark blue
                'tax_number' => '',
                'company_address' => '',
                'currency' => 'EGP',
                'stamp_url' => null,
                'signature_url' => null
            ];
        }

        Response::success($settings);
    }

    public function update(Request $request): void {
        Permission::check('settings', 'edit');
        
        $data = Validator::validate($request->all(), [
            'company_id' => 'required|numeric',
            'theme_color' => 'required'
        ]);

        $companyId = $data['company_id'];
        
        // Ensure settings record exists
        $existing = Database::fetch("SELECT id FROM settings WHERE company_id = ?", [$companyId]);

        if ($existing) {
            Database::query(
                "UPDATE settings SET theme_color = ?, tax_number = ?, company_address = ?, currency = ? WHERE company_id = ?",
                [
                    $data['theme_color'],
                    $request->input('tax_number'),
                    $request->input('company_address'),
                    $request->input('currency', 'EGP'),
                    $companyId
                ]
            );
        } else {
            Database::query(
                "INSERT INTO settings (company_id, theme_color, tax_number, company_address, currency) VALUES (?, ?, ?, ?, ?)",
                [
                    $companyId,
                    $data['theme_color'],
                    $request->input('tax_number'),
                    $request->input('company_address'),
                    $request->input('currency', 'EGP')
                ]
            );
        }

        Logger::audit('UPDATE', 'SETTINGS', (int)$companyId);

        Response::success(null, 'Settings updated successfully');
    }
}
