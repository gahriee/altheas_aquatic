<?php declare(strict_types=1);

namespace App\Core;

class Mailer
{
    /**
     * ----------------------------------------
     * send
     * ----------------------------------------
     * Sends an HTML email using the Resend API SDK.
     * 
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $htmlBody HTML email content
     * @return bool True on success, false on failure
     */
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        $apiKey = constant('RESEND_API_KEY');
        if (!$apiKey) {
            @error_log("Mailer::send failed: RESEND_API_KEY is not set.");
            return false;
        }

        $fromName = constant('MAIL_FROM_NAME') ?: "Althea's Aquatic";
        $fromAddress = constant('MAIL_FROM_ADDRESS') ?: "onboarding@resend.dev";
        $from = "{$fromName} <{$fromAddress}>";

        try {
            $resend = \Resend::client($apiKey);
            
            $result = $resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => $htmlBody
            ]);

            $resendId = $result->id ?? 'unknown';
            @error_log("Mailer::send success. Resend ID: {$resendId} | To: {$to}");
            return true;
            
        } catch (\Exception $e) {
            @error_log("Mailer::send failed (Resend SDK): " . $e->getMessage());
            return false;
        }
    }
}
