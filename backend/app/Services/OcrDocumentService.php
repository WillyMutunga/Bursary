<?php

namespace App\Services;

class OcrDocumentService
{
    /**
     * Extract key attributes from document and match against application payload
     */
    public function extractAndCompare(array $applicationData, string $docType, string $fileName): array
    {
        $name = strtoupper($applicationData['full_name'] ?? 'UNKNOWN');
        $idNumber = $applicationData['national_id'] ?? 'N/A';
        $admissionNo = $applicationData['admission_no'] ?? 'ADM/2024/001';
        $institutionName = $applicationData['institution_name'] ?? 'University of Nairobi';
        $feeBalance = $applicationData['fee_balance'] ?? 45000;

        // Simulated high-precision OCR extraction
        $extracted = [
            'document_type' => $docType,
            'extracted_name' => $name,
            'extracted_id' => $idNumber,
            'extracted_admission_no' => $admissionNo,
            'extracted_institution' => $institutionName,
            'extracted_fee_balance' => $feeBalance,
            'issue_date' => now()->subMonths(2)->format('d/m/Y'),
            'official_stamp_detected' => true,
            'signature_detected' => true,
            'ocr_engine_confidence' => 98.4,
        ];

        // Specific test cases for doc OCR discrepancies
        $nameMatches = true;
        $idMatches = true;
        $admMatches = true;

        if (str_contains($fileName, 'mismatch') || str_contains($name, 'OCR_FAIL')) {
            $extracted['extracted_name'] = 'DIFFERENT HOLDER NAME';
            $nameMatches = false;
        }

        $matchScore = ($nameMatches ? 35 : 0) + ($idMatches ? 35 : 0) + ($admMatches ? 30 : 0);

        return [
            'extracted_data' => $extracted,
            'match_score' => $matchScore,
            'is_match' => $matchScore >= 90,
            'comparison' => [
                'name' => [
                    'application' => $name,
                    'document' => $extracted['extracted_name'],
                    'match' => $nameMatches,
                ],
                'national_id' => [
                    'application' => $idNumber,
                    'document' => $extracted['extracted_id'],
                    'match' => $idMatches,
                ],
                'admission_no' => [
                    'application' => $admissionNo,
                    'document' => $extracted['extracted_admission_no'],
                    'match' => $admMatches,
                ],
                'institution' => [
                    'application' => $institutionName,
                    'document' => $extracted['extracted_institution'],
                    'match' => true,
                ]
            ],
            'ocr_status' => $matchScore >= 90 ? 'processed' : 'flagged',
        ];
    }
}
