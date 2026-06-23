<?php declare(strict_types=1);

namespace App\Core;

class Mailer
{
    /**
     * ----------------------------------------
     * send
     * ----------------------------------------
     * Sends an HTML email using Brevo (Sendinblue) REST API.
     * This bypasses Render's outbound SMTP port blocking.
     * 
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $htmlBody HTML email content
     * @return bool True on success, false on failure
     */
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        $apiKey = defined('BREVO_API_KEY') ? constant('BREVO_API_KEY') : '';
        if (empty($apiKey)) {
            @error_log("Mailer::send failed: BREVO_API_KEY is not set.");
            return false;
        }

        $fromAddress = defined('MAIL_FROM_ADDRESS') ? constant('MAIL_FROM_ADDRESS') : '';
        if (empty($fromAddress)) {
            @error_log("Mailer::send failed: MAIL_FROM_ADDRESS is not set. Brevo requires a verified sender email.");
            return false;
        }

        $fromName = defined('MAIL_FROM_NAME') ? constant('MAIL_FROM_NAME') : "Althea's Aquatic";

        $url = 'https://api.brevo.com/v3/smtp/email';
        
        $data = [
            'sender' => [
                'name' => $fromName,
                'email' => $fromAddress
            ],
            'to' => [
                [
                    'email' => $to
                ]
            ],
            'subject' => $subject,
            'htmlContent' => $htmlBody
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'accept: application/json',
            'api-key: ' . $apiKey,
            'content-type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Don't hang the checkout

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            @error_log("Mailer::send failed (Brevo API cURL error): " . $curlError);
            return false;
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }

        @error_log("Mailer::send failed (Brevo API error): HTTP {$httpCode} - {$response}");
        return false;
    }
}
