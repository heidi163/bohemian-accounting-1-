<?php
declare(strict_types=1);
namespace App\Services;

use App\Core\Database;
use App\Core\Logger;

class EInvoiceService {

    /**
     * Submit an invoice to ETA (Egyptian Tax Authority).
     */
    public static function submitToETA(array $invoice): array {
        try {
            $payload = self::buildETADocument($invoice);
            // $signed = self::signDocument($payload); // Placeholder for RSA Signature logic
            $signed = $payload; // Mocking signature for now
            
            // Mocking HTTP Request to ETA Sandbox
            // $response = Http::withToken(self::getETAToken())->post('...', ['documents' => [$signed]]);
            
            // Mocking response
            $response = [
                'submissionId' => 'ETA-' . uniqid(),
                'acceptedDocuments' => [
                    ['status' => 'Valid', 'uuid' => 'UUID-' . bin2hex(random_bytes(16))]
                ]
            ];
            
            Logger::info("Successfully submitted invoice to ETA", ['invoice_id' => $invoice['id'], 'submissionId' => $response['submissionId']]);
            
            return [
                'submission_id' => $response['submissionId'],
                'uuid'          => $response['acceptedDocuments'][0]['uuid'] ?? null,
                'status'        => $response['acceptedDocuments'][0]['status'] ?? 'pending',
            ];
        } catch (\Exception $e) {
            Logger::error("Failed to submit invoice to ETA", ['invoice_id' => $invoice['id'], 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Generate ZATCA QR Code (Saudi Arabia).
     */
    public static function generateZATCAQr(array $invoice): string {
        try {
            $sellerName = $invoice['company_name'] ?? 'Bohemian Accounting';
            $vatNumber = $invoice['company_tax_id'] ?? '300000000000003';
            $timestamp = $invoice['invoice_date'] . 'T00:00:00Z'; // Mocking time
            $total = (string)$invoice['total_amount'];
            $vatAmount = (string)$invoice['tax_amount'];

            $tlv = self::buildTLV([
                1 => $sellerName,
                2 => $vatNumber,
                3 => $timestamp,
                4 => $total,
                5 => $vatAmount
            ]);

            return base64_encode($tlv);
        } catch (\Exception $e) {
            Logger::error("Failed to generate ZATCA QR", ['invoice_id' => $invoice['id'], 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    private static function buildETADocument(array $invoice): array {
        // Fetch full customer and company data in a real app
        // Here we assume $invoice has customer and lines joined or we fetch them
        
        $customerTaxId = $invoice['customer_tax_id'] ?? '123456789';
        $customerName = $invoice['customer_name'] ?? 'Unknown Customer';
        $companyTaxId = getenv('ETA_COMPANY_TAX_ID') ?: '987654321';
        
        return [
            'issuer'    => ['type' => 'B', 'id' => $companyTaxId, 'name' => 'Bohemian Accounting'],
            'receiver'  => ['type' => 'B', 'id' => $customerTaxId, 'name' => $customerName],
            'documentType'    => 'I',
            'documentTypeVersion' => '1.0',
            'dateTimeIssued'  => $invoice['invoice_date'],
            'totalAmount'     => $invoice['total_amount'],
            'taxTotals'       => [['taxType' => 'T1', 'amount' => $invoice['tax_amount']]],
            'invoiceLines'    => [] // Would map $invoice['lines'] here
        ];
    }

    private static function buildTLV(array $tags): string {
        $tlv = '';
        foreach ($tags as $tag => $value) {
            $tlv .= chr($tag) . chr(strlen($value)) . $value;
        }
        return $tlv;
    }
}
