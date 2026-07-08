<?php
declare(strict_types=1);
namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Core\Logger;

class EmailService {
    
    private static function getMailer(): PHPMailer {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: 'accounting@bohemiangeeks.com';
        $mail->Password   = getenv('SMTP_PASS') ?: 'secret123';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';
        
        $mail->setFrom($mail->Username, 'Bohemian Accounting');
        
        return $mail;
    }

    public static function sendInvoice(string $toEmail, string $customerName, array $invoice, string $pdfPath): bool {
        try {
            $mail = self::getMailer();
            $mail->addAddress($toEmail, $customerName);
            
            $mail->Subject = "فاتورة جديدة رقم {$invoice['invoice_number']} من Bohemian Geeks";
            
            $body = "
                <div style='direction: rtl; font-family: Tahoma, Arial;'>
                    <h3>أهلاً بك {$customerName}،</h3>
                    <p>مرفق طيه الفاتورة رقم <b>{$invoice['invoice_number']}</b> بقيمة <b>{$invoice['total_amount']} {$invoice['currency']}</b>.</p>
                    <p>تاريخ الاستحقاق: {$invoice['due_date']}</p>
                    <br>
                    <p>شكراً لتعاملكم معنا.</p>
                </div>
            ";
            
            $mail->isHTML(true);
            $mail->Body = $body;
            
            if (file_exists($pdfPath)) {
                $mail->addAttachment($pdfPath, "Invoice_{$invoice['invoice_number']}.pdf");
            }
            
            $mail->send();
            return true;
        } catch (Exception $e) {
            Logger::error("Email failed to send to $toEmail. Error: {$e->getMessage()}");
            return false;
        }
    }

    public static function sendCustomerStatement(string $toEmail, string $customerName, string $pdfPath): bool {
        try {
            $mail = self::getMailer();
            $mail->addAddress($toEmail, $customerName);
            
            $mail->Subject = "كشف حساب من Bohemian Geeks";
            
            $body = "
                <div style='direction: rtl; font-family: Tahoma, Arial;'>
                    <h3>أهلاً بك {$customerName}،</h3>
                    <p>مرفق طيه كشف الحساب الخاص بكم.</p>
                    <p>يرجى الاطلاع عليه وموافاتنا في حال وجود أي استفسارات.</p>
                    <br>
                    <p>شكراً لتعاملكم معنا.</p>
                </div>
            ";
            
            $mail->isHTML(true);
            $mail->Body = $body;
            
            if (file_exists($pdfPath)) {
                $mail->addAttachment($pdfPath, "Statement.pdf");
            }
            
            $mail->send();
            return true;
        } catch (Exception $e) {
            Logger::error("Statement Email failed to send to $toEmail. Error: {$e->getMessage()}");
            return false;
        }
    }

    public static function sendPayslip(string $toEmail, string $employeeName, int $year, int $month, string $pdfPath): bool {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; // Change to actual SMTP
            $mail->SMTPAuth   = true;
            $mail->Username   = 'bgk@bohemiangeeks.com'; // Change to actual
            $mail->Password   = '123456789'; // Change to actual
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->CharSet    = 'UTF-8';
            
            $mail->setFrom('bgk@bohemiangeeks.com', 'Bohemian Accounting');
            $mail->addAddress($toEmail, $employeeName);
            
            $period = "{$year}-" . str_pad((string)$month, 2, '0', STR_PAD_LEFT);
            $mail->Subject = "Bohemian Accounting - قسيمة راتب شهر $period";
            
            $body = "
                <div dir='rtl' style='font-family: Cairo, Arial, sans-serif;'>
                    <h3>مرحباً $employeeName،</h3>
                    <p>مرفق طيه قسيمة الراتب (Payslip) الخاصة بك لشهر $period.</p>
                    <p>هذا المستند صادر إلكترونياً من نظام Bohemian Accounting.</p>
                    <br>
                    <p>مع خالص التحيات،<br>فريق الموارد البشرية</p>
                </div>
            ";
            
            $mail->isHTML(true);
            $mail->Body = $body;
            
            if (file_exists($pdfPath)) {
                $mail->addAttachment($pdfPath, "Payslip_$period.pdf");
            }
            
            $mail->send();
            return true;
        } catch (Exception $e) {
            Logger::error("Payslip Email failed to send to $toEmail. Error: {$e->getMessage()}");
            return false;
        }
    }
}
