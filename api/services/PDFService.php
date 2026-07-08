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

    public static function generateCustomerStatementPdf(array $customer, array $statement, float $closingBalance, array $agingData = []): string {
        try {
            $mpdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'default_font_size' => 12,
                'default_font' => 'cairo',
                'autoScriptToLang' => true,
                'autoLangToFont' => true,
            ]);

            $html = self::getStatementHtmlTemplate($customer, $statement, $closingBalance, $agingData);
            
            $mpdf->SetDirectionality('rtl');
            $mpdf->WriteHTML($html);

            $dir = __DIR__ . '/../../storage/exports/statements';
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            $filename = "Statement_{$customer['code']}.pdf";
            $path = "$dir/$filename";
            
            $mpdf->Output($path, \Mpdf\Output\Destination::FILE);
            
            return $path;
        } catch (\Exception $e) {
            Logger::error("Statement PDF Generation failed: " . $e->getMessage());
            throw new \Exception("Failed to generate statement PDF");
        }
    }

    private static function getStatementHtmlTemplate(array $customer, array $statement, float $closingBalance, array $agingData): string {
        $dateStr = date('Y-m-d');
        $html = "
        <div style='font-family: Cairo, sans-serif; direction: rtl;'>
            <h1 style='color: #4F46E5;'>كشف حساب عميل</h1>
            <p><strong>اسم العميل:</strong> {$customer['name']}</p>
            <p><strong>كود العميل:</strong> {$customer['code']}</p>
            <p><strong>تاريخ الإصدار:</strong> {$dateStr}</p>
            
            <table border='1' width='100%' cellpadding='8' style='border-collapse: collapse; margin-top: 20px; font-size: 14px;'>
                <tr style='background-color: #f3f4f6;'>
                    <th>التاريخ</th>
                    <th>البيان</th>
                    <th>مدين</th>
                    <th>دائن</th>
                    <th>الرصيد</th>
                </tr>";

        if (empty($statement)) {
            $html .= "<tr><td colspan='5' style='text-align: center;'>لا توجد حركات مسجلة لهذا العميل</td></tr>";
        } else {
            foreach ($statement as $line) {
                $debit = $line['debit'] > 0 ? number_format((float)$line['debit'], 2) : '-';
                $credit = $line['credit'] > 0 ? number_format((float)$line['credit'], 2) : '-';
                $balance = number_format((float)$line['balance'], 2);
                $html .= "<tr>
                            <td>{$line['entry_date']}</td>
                            <td>{$line['description']}</td>
                            <td>{$debit}</td>
                            <td>{$credit}</td>
                            <td>{$balance}</td>
                          </tr>";
            }
        }

        $html .= "
            </table>
            <div style='margin-top: 20px; text-align: left;'>
                <h3 style='color: #4F46E5;'><strong>الرصيد النهائي (المستحق):</strong> " . number_format($closingBalance, 2) . " EGP</h3>
            </div>";

        if (!empty($agingData)) {
            $html .= "
            <h3 style='margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;'>أعمار الديون المتأخرة</h3>
            <table border='1' width='100%' cellpadding='8' style='border-collapse: collapse; margin-top: 10px; font-size: 14px; text-align: center;'>
                <tr style='background-color: #f3f4f6;'>
                    <th>من 0 لـ 30 يوم</th>
                    <th>من 31 لـ 60 يوم</th>
                    <th>من 61 لـ 90 يوم</th>
                    <th>أكثر من 90 يوم</th>
                </tr>
                <tr>
                    <td>" . number_format((float)($agingData['0_30'] ?? 0), 2) . "</td>
                    <td>" . number_format((float)($agingData['31_60'] ?? 0), 2) . "</td>
                    <td>" . number_format((float)($agingData['61_90'] ?? 0), 2) . "</td>
                    <td style='color: #dc2626; font-weight: bold;'>" . number_format((float)($agingData['90_plus'] ?? 0), 2) . "</td>
                </tr>
            </table>";
        }

        $html .= "</div>";

        return $html;
    }
}
