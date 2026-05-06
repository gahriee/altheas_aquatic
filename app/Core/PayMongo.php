<?php declare(strict_types=1);

namespace App\Core;

/**
 * ----------------------------------------
 * PayMongo Service
 * ----------------------------------------
 * Lightweight wrapper for PayMongo REST API using PHP cURL.
 * Handles PaymentIntent, PaymentMethod, and Webhook verification.
 */
class PayMongo
{
    private string $secretKey;
    private string $baseUrl = 'https://api.paymongo.com/v1';

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the service with the secret key from config.
     */
    public function __construct(string $secretKey)
    {
        $this->secretKey = $secretKey;
    }

    /**
     * ----------------------------------------
     * createPaymentIntent
     * ----------------------------------------
     * Creates a new PaymentIntent with the specified amount and description.
     */
    public function createPaymentIntent(int $amountCentavos, string $description): array
    {
        $payload = [
            'data' => [
                'attributes' => [
                    'amount' => $amountCentavos,
                    'payment_method_allowed' => ['gcash'],
                    'currency' => 'PHP',
                    'description' => $description
                ]
            ]
        ];

        return $this->request('POST', '/payment_intents', $payload);
    }

    /**
     * ----------------------------------------
     * createPaymentMethod
     * ----------------------------------------
     * Creates a new PaymentMethod for GCash.
     */
    public function createPaymentMethod(string $type = 'gcash'): array
    {
        $payload = [
            'data' => [
                'attributes' => [
                    'type' => $type
                ]
            ]
        ];

        return $this->request('POST', '/payment_methods', $payload);
    }

    /**
     * ----------------------------------------
     * attachPaymentIntent
     * ----------------------------------------
     * Attaches a PaymentMethod to a PaymentIntent to generate the redirect URL.
     */
    public function attachPaymentIntent(string $intentId, string $methodId, string $returnUrl): array
    {
        $payload = [
            'data' => [
                'attributes' => [
                    'payment_method' => $methodId,
                    'return_url' => $returnUrl
                ]
            ]
        ];

        return $this->request('POST', "/payment_intents/{$intentId}/attach", $payload);
    }

    /**
     * ----------------------------------------
     * retrievePaymentIntent
     * ----------------------------------------
     * Retrieves the status and details of a specific PaymentIntent.
     */
    public function retrievePaymentIntent(string $intentId): array
    {
        return $this->request('GET', "/payment_intents/{$intentId}");
    }

    /**
     * ----------------------------------------
     * verifyWebhookSignature
     * ----------------------------------------
     * Verifies the HMAC-SHA256 signature of a PayMongo webhook payload.
     */
    public function verifyWebhookSignature(string $rawBody, string $sigHeader, string $secret): bool
    {
        if (empty($sigHeader)) {
            return false;
        }

        $parts = explode(',', $sigHeader);
        $timestamp = '';
        $signature = '';

        foreach ($parts as $part) {
            if (strpos($part, 't=') === 0) {
                $timestamp = substr($part, 2);
            } elseif (strpos($part, 'te=') === 0) {
                $signature = substr($part, 3);
            }
        }

        if (empty($timestamp) || empty($signature)) {
            return false;
        }

        $signedPayload = $timestamp . '.' . $rawBody;
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * ----------------------------------------
     * request
     * ----------------------------------------
     * Internal cURL helper for making API requests to PayMongo.
     */
    private function request(string $method, string $endpoint, array $payload = []): array
    {
        $ch = curl_init();
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($this->secretKey . ':')
        ];

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        } elseif ($method === 'GET' && !empty($payload)) {
            curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($payload));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException("PayMongo cURL Error: " . $error);
        }

        $data = json_decode($response, true);
        if ($httpCode >= 400) {
            $message = $data['errors'][0]['detail'] ?? 'Unknown PayMongo API Error';
            throw new \RuntimeException("PayMongo API Error ({$httpCode}): " . $message);
        }

        return $data;
    }
}
