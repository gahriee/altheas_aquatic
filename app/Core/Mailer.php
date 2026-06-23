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
     * Sends an HTML email using PHPMailer and Gmail SMTP.
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
            $mail->Username   = constant('SMTP_USER');
            $mail->Password   = constant('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)(constant('SMTP_PORT') ?: 587);

            // Validate configuration
            if (empty($mail->Username) || empty($mail->Password)) {
                @error_log("Mailer::send failed: SMTP_USER or SMTP_PASS is not set.");
                return false;
            }

            // Recipients
            $fromName = constant('MAIL_FROM_NAME') ?: "Althea's Aquatic";
            $mail->setFrom($mail->Username, $fromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            
            // Plain text alternative
            $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $htmlBody));

            $mail->send();
            return true;
        } catch (Exception $e) {
            @error_log("Mailer::send failed: {$mail->ErrorInfo}");
            return false;
        }
    }
}
