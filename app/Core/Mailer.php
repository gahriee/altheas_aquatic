<?php declare(strict_types=1);

namespace App\Core;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    /**
     * ----------------------------------------
     * send
     * ----------------------------------------
     * Sends an HTML email using PHPMailer with SMTP.
     * 
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $htmlBody HTML email content
     * @return bool True on success, false on failure
     */
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = constant('SMTP_HOST') ?: 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = constant('SMTP_USER') ?: '';
            $mail->Password   = constant('SMTP_PASS') ?: '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) (constant('SMTP_PORT') ?: 587);
            $mail->Timeout    = 5; // Fail fast if network is unreachable

            // Sender and recipient
            $fromName = constant('SMTP_FROM_NAME') ?: "Althea's Aquatic";
            $mail->setFrom($mail->Username, $fromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Mailer::send failed to send email to {$to}. Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}
