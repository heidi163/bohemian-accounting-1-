<?php
declare(strict_types=1);
namespace App\Services;

use Mpdf\Mpdf;
use App\Core\Logger;

class PDFService {
    public static function generateInvoicePdf(array $invoice, array $lines, string $customerName): string {
        try {
            // Configuration for Arabic support in mPDF
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'default_font_size' => 12,
                'default_font' => 'cairo',
                'autoScriptToLang' => true,
                'autoLangToFont' => true,
            ]);

            $html = self::getInvoiceHtmlTemplate($invoice, $lines, $customerName);
            
            $mpdf->SetDirectionality('rtl');
            $mpdf->WriteHTML($html);

            $dir = __DIR__ . '/../../storage/exports/invoices';
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            $filename = "Invoice_{$invoice['invoice_number']}.pdf";
            $path = "$dir/$filename";
            
            $mpdf->Output($path, \Mpdf\Output\Destination::FILE);
            
            return $path;
        } catch (\Exception $e) {
            Logger::error("PDF Generation failed: " . $e->getMessage());
            throw new \Exception("Failed to generate PDF");
        }
    }

    private static function getInvoiceHtmlTemplate(array $invoice, array $lines, string $customerName): string {
        // Basic HTML structure for the invoice
        $html = "
        <div style='font-family: Cairo, sans-serif; direction: rtl;'>
            <h1 style='color: #4F46E5;'>فاتورة مبيعات</h1>
            <p><strong>رقم الفاتورة:</strong> {$invoice['invoice_number']}</p>
            <p><strong>العميل:</strong> {$customerName}</p>
            <p><strong>التاريخ:</strong> {$invoice['invoice_date']}</p>
            
            <table border='1' width='100%' cellpadding='10' style='border-collapse: collapse; margin-top: 20px;'>
                <tr style='background-color: #f3f4f6;'>
                    <th>البيان</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                </tr>";

        foreach ($lines as $line) {
            $total = $line['quantity'] * $line['unit_price'];
            $html .= "<tr>
                        <td>{$line['description']}</td>
                        <td>{$line['quantity']}</td>
                        <td>{$line['unit_price']}</td>
                        <td>{$total}</td>
                      </tr>";
        }

        $html .= "
            </table>
            <div style='margin-top: 20px; text-align: left;'>
                <p><strong>الإجمالي الفرعي:</strong> {$invoice['subtotal']}</p>
                <p><strong>الخصم:</strong> {$invoice['discount_amount']}</p>
                <p><strong>ضريبة القيمة المضافة ({$invoice['tax_rate']}%):</strong> {$invoice['tax_amount']}</p>
                <h3 style='color: #4F46E5;'><strong>الإجمالي الكلي:</strong> {$invoice['total_amount']} {$invoice['currency']}</h3>
            </div>
        </div>";

        return $html;
    }
}
