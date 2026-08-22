<?php

namespace App\Services;

use App\Contracts\IdentityVerificationProviderInterface;

class NationalIdVerificationService implements IdentityVerificationProviderInterface
{
    /**
     * Pluggable ID verification engine
     */
    public function verify(string $nationalId, string $fullName): array
    {
        $cleanId = trim($nationalId);
        $cleanName = strtoupper(trim($fullName));

        // Deterministic simulation based on clean inputs or mock registry
        if (strlen($cleanId) < 6 || !is_numeric($cleanId)) {
            return [
                'status' => 'ID_NOT_VERIFIED',
                'name_match' => false,
                'id_match' => false,
                'confidence' => 0,
                'verified_name' => null,
                'provider_name' => 'IPRS_SECURE_GATEWAY',
                'provider_reference' => 'ERR-INV-' . strtoupper(substr(md5($cleanId . time()), 0, 8)),
                'message' => 'National ID format invalid or not found in National Population Register',
                'verification_date' => now()->toIso8601String(),
            ];
        }

        // Test flag: if name has "Mismatch" or ends with "999"
        if (str_contains($cleanName, 'MISMATCH') || str_ends_with($cleanId, '999')) {
            return [
                'status' => 'NAME_MISMATCH',
                'name_match' => false,
                'id_match' => true,
                'confidence' => 45,
                'verified_name' => 'OFFICIAL REGISTRY NAME RECORD',
                'provider_name' => 'IPRS_SECURE_GATEWAY',
                'provider_reference' => 'IPRS-REF-' . strtoupper(substr(md5($cleanId . 'mismatch'), 0, 10)),
                'message' => 'Supplied applicant name differs significantly from national identity registry.',
                'verification_date' => now()->toIso8601String(),
            ];
        }

        if (str_contains($cleanName, 'MANUAL') || str_ends_with($cleanId, '777')) {
            return [
                'status' => 'MANUAL_REVIEW',
                'name_match' => true,
                'id_match' => true,
                'confidence' => 78,
                'verified_name' => $cleanName,
                'provider_name' => 'IPRS_SECURE_GATEWAY',
                'provider_reference' => 'IPRS-REV-' . strtoupper(substr(md5($cleanId . 'rev'), 0, 10)),
                'message' => 'Record flagged for manual biometric/civil officer verification.',
                'verification_date' => now()->toIso8601String(),
            ];
        }

        // Default successful verification
        return [
            'status' => 'VERIFIED',
            'name_match' => true,
            'id_match' => true,
            'confidence' => 99,
            'verified_name' => $cleanName,
            'provider_name' => 'IPRS_SECURE_GATEWAY',
            'provider_reference' => 'IPRS-TXN-' . strtoupper(substr(md5($cleanId . $cleanName . '2026'), 0, 10)),
            'message' => 'Identity successfully authenticated against national civil register.',
            'verification_date' => now()->toIso8601String(),
        ];
    }
}
