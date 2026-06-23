<?php declare(strict_types=1);

namespace App\Core;

class Mailer
{
    /**
     * ----------------------------------------
     * send
     * ----------------------------------------
     * Sends an HTML email using the Resend API.
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
            error_log("Mailer::send failed: RESEND_API_KEY is not set.");
            return false;
        }

        $fromName = constant('MAIL_FROM_NAME') ?: "Althea's Aquatic";
        $fromAddress = constant('MAIL_FROM_ADDRESS') ?: "onboarding@resend.dev";
        $from = "{$fromName} <{$fromAddress}>";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        
        $payload = json_encode([
            'from' => $from,
            'to' => [$to],
            'subject' => $subject,
            'html' => $htmlBody
        ]);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        
        curl_close($ch);

        if ($result === false) {
            error_log("Mailer::send failed (cURL error): {$curlError}");
            return false;
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        } else {
            error_log("Mailer::send failed (HTTP {$httpCode}): {$result}");
            return false;
        }
    }
}
