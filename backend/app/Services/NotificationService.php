<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send SMS via Africa's Talking (Standard Kenyan SMS Gateway)
     * Gracefully logs to storage/logs/sms.log if keys are not yet configured.
     */
    public static function sendSms(string $phone, string $message, ?int $userId = null, ?int $appId = null): array
    {
        // Format Kenyan phone to E.164 standard (+254...)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleanPhone, '0')) {
            $formattedPhone = '+254' . substr($cleanPhone, 1);
        } elseif (str_starts_with($cleanPhone, '254')) {
            $formattedPhone = '+' . $cleanPhone;
        } elseif (str_starts_with($cleanPhone, '7') || str_starts_with($cleanPhone, '1')) {
            $formattedPhone = '+254' . $cleanPhone;
        } else {
            $formattedPhone = '+' . $cleanPhone;
        }

        $apiKey = env('AT_API_KEY');
        $username = env('AT_USERNAME', 'sandbox');
        $senderId = env('AT_SENDER_ID', 'NGCDF-BURSARY');

        $sentSuccessfully = false;
        $gatewayResponse = 'LOGGED_ONLY';

        if (!empty($apiKey) && $apiKey !== 'your_api_key_here') {
            try {
                $endpoint = ($username === 'sandbox')
                    ? 'https://api.sandbox.africastalking.com/version1/messaging'
                    : 'https://api.africastalking.com/version1/messaging';

                $response = Http::withHeaders([
                    'apiKey' => $apiKey,
                    'Accept' => 'application/json',
                ])->asForm()->post($endpoint, [
                    'username' => $username,
                    'to' => $formattedPhone,
                    'message' => $message,
                    'from' => ($username === 'sandbox') ? null : $senderId,
                ]);

                if ($response->successful()) {
                    $sentSuccessfully = true;
                    $gatewayResponse = $response->json();
                } else {
                    $gatewayResponse = 'HTTP_' . $response->status() . ': ' . $response->body();
                }
            } catch (\Exception $e) {
                $gatewayResponse = 'EXCEPTION: ' . $e->getMessage();
                Log::warning("Africa's Talking SMS failed: " . $e->getMessage());
            }
        }

        // Always log to dedicated SMS audit log
        $logLine = "[" . now()->toDateTimeString() . "] TO: {$formattedPhone} | SENDER: {$senderId} | STATUS: " . ($sentSuccessfully ? 'DELIVERED' : 'SIMULATED') . " | MSG: \"{$message}\" | DETAILS: " . json_encode($gatewayResponse) . PHP_EOL;
        @file_put_contents(storage_path('logs/sms.log'), $logLine, FILE_APPEND);

        // Store in notifications table if user/app ID is present
        if ($userId) {
            Notification::create([
                'user_id' => $userId,
                'application_id' => $appId,
                'title' => 'SMS Dispatched',
                'message' => $message,
                'type' => 'sms',
            ]);
        }

        return [
            'success' => true,
            'phone' => $formattedPhone,
            'delivered' => $sentSuccessfully,
            'gateway_status' => $sentSuccessfully ? 'SENT_VIA_AFRICASTALKING' : 'LOGGED_TO_SMS_FILE',
        ];
    }

    /**
     * Send Email with NG-CDF Constituency Template
     */
    public static function sendEmail(string $recipientEmail, string $subject, string $bodyContent, ?int $userId = null, ?int $appId = null): bool
    {
        if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        try {
            Mail::raw($bodyContent, function ($message) use ($recipientEmail, $subject) {
                $message->to($recipientEmail)
                    ->subject($subject)
                    ->from(env('MAIL_FROM_ADDRESS', 'bursary@skysoftsystems.co.ke'), env('MAIL_FROM_NAME', 'NG-CDF Bursary Portal'));
            });

            if ($userId) {
                Notification::create([
                    'user_id' => $userId,
                    'application_id' => $appId,
                    'title' => $subject,
                    'message' => $bodyContent,
                    'type' => 'email',
                ]);
            }

            return true;
        } catch (\Exception $e) {
            Log::warning("Email dispatch failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Trigger Lifecycle Milestone Alerts
     */
    public static function notifyMilestone(string $milestone, array $appData): void
    {
        $name = $appData['full_name'] ?? 'Applicant';
        $phone = $appData['phone'] ?? '';
        $email = $appData['email'] ?? '';
        $appNo = $appData['application_no'] ?? '';
        $amount = isset($appData['approved_amount']) ? number_format($appData['approved_amount']) : '0';
        $userId = $appData['user_id'] ?? null;
        $appId = $appData['id'] ?? null;

        if ($milestone === 'SUBMITTED') {
            $msg = "Dear {$name}, your NG-CDF Bursary Application {$appNo} has been received successfully. Track your status at https://bursary.skysoftsystems.co.ke";
            if ($phone) self::sendSms($phone, $msg, $userId, $appId);
            if ($email) self::sendEmail($email, "Application Received: {$appNo}", $msg, $userId, $appId);
        } elseif ($milestone === 'VERIFIED') {
            $msg = "Dear {$name}, your bursary application {$appNo} has passed constituency verification. It has been forwarded for Committee review.";
            if ($phone) self::sendSms($phone, $msg, $userId, $appId);
        } elseif ($milestone === 'AWARDED') {
            $msg = "Congratulations {$name}! Your NG-CDF Bursary Award of KSh {$amount} has been APPROVED. Download your official QR-verified award letter at https://bursary.skysoftsystems.co.ke";
            if ($phone) self::sendSms($phone, $msg, $userId, $appId);
            if ($email) self::sendEmail($email, "Bursary Award Approved: {$appNo}", $msg, $userId, $appId);
        } elseif ($milestone === 'DISBURSED') {
            $msg = "Dear {$name}, your bursary award of KSh {$amount} has been DISBURSED to your institution bank account via EFT Cheque Schedule.";
            if ($phone) self::sendSms($phone, $msg, $userId, $appId);
        }
    }
}
