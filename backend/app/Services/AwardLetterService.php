<?php

namespace App\Services;

use App\Models\Application;

class AwardLetterService
{
    /**
     * Generate Cryptographic Certificate Hash and QR Payload for Approved Bursaries
     */
    public function generateAwardLetterPayload(Application $app): array
    {
        $secretSalt = config('app.key', 'ngcdf_bursary_secret_salt_2026');
        $hashString = "{$app->application_no}|{$app->national_id}|{$app->approved_amount}|{$app->cycle->academic_year}|{$secretSalt}";
        $certificateHash = strtoupper(substr(hash('sha256', $hashString), 0, 20));

        $qrData = [
            'type' => 'NG_CDF_OFFICIAL_BURSARY_AWARD',
            'application_no' => $app->application_no,
            'beneficiary_name' => $app->full_name,
            'national_id' => $app->national_id,
            'institution' => $app->institution ? $app->institution->name : 'N/A',
            'admission_no' => $app->admission_no,
            'awarded_amount_kes' => (float)$app->approved_amount,
            'cycle' => $app->cycle ? $app->cycle->title : '2026/2027 Cycle',
            'certificate_hash' => $certificateHash,
            'awarded_date' => $app->decision_date ? $app->decision_date->format('Y-m-d') : now()->format('Y-m-d'),
            'verification_url' => url("/verify/award/{$certificateHash}"),
            'status' => 'OFFICIALLY_VERIFIED_VALID',
        ];

        $app->update([
            'award_certificate_hash' => $certificateHash,
            'qr_payload' => json_encode($qrData),
        ]);

        return [
            'certificate_hash' => $certificateHash,
            'qr_payload' => $qrData,
            'qr_string' => json_encode($qrData),
            'verification_url' => url("/verify/award/{$certificateHash}"),
        ];
    }
}
