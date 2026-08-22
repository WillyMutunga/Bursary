<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;

class AwardVerificationController extends Controller
{
    public function verify($hash)
    {
        $application = Application::with(['cycle', 'ward', 'institution'])
            ->where('award_certificate_hash', strtoupper($hash))
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'is_valid' => false,
                'message' => 'Invalid or unverified award certificate token. This bursary certificate could not be validated.',
            ], 404);
        }

        $application->increment('qr_verified_count');

        AuditLoggerService::log(
            action: 'QR_CERTIFICATE_VERIFIED',
            module: 'Award Verification',
            recordId: (string)$application->id,
            newValues: ['certificate_hash' => $hash, 'verified_count' => $application->qr_verified_count]
        );

        return response()->json([
            'success' => true,
            'is_valid' => true,
            'data' => [
                'certificate_hash' => $application->award_certificate_hash,
                'application_no' => $application->application_no,
                'beneficiary_name' => $application->full_name,
                'national_id_masked' => substr($application->national_id, 0, 2) . '****' . substr($application->national_id, -2),
                'institution' => $application->institution ? $application->institution->name : 'N/A',
                'admission_no' => $application->admission_no,
                'approved_amount' => (float)$application->approved_amount,
                'cycle' => $application->cycle ? $application->cycle->title : '2026/2027 Financial Year',
                'decision_date' => $application->decision_date ? $application->decision_date->format('d F Y') : now()->format('d F Y'),
                'status' => 'OFFICIALLY_VERIFIED_VALID',
                'verification_timestamp' => now()->toIso8601String(),
                'verified_count' => $application->qr_verified_count,
            ]
        ]);
    }
}
