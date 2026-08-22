<?php

namespace App\Services;

use App\Models\Application;

class DuplicateDetectionService
{
    /**
     * Cross-cycle and multi-parameter collision checker
     */
    public function scan(array $data, ?int $ignoreApplicationId = null): array
    {
        $nationalId = $data['national_id'] ?? null;
        $phone = $data['phone'] ?? null;
        $admissionNo = $data['admission_no'] ?? null;
        $institutionId = $data['institution_id'] ?? null;
        $cycleId = $data['cycle_id'] ?? null;

        $flags = [];
        $riskLevel = 'low';

        // 1. Check exact National ID in current active cycle
        $idMatches = Application::where('national_id', $nationalId)
            ->when($ignoreApplicationId, fn($q) => $q->where('id', '!=', $ignoreApplicationId))
            ->when($cycleId, fn($q) => $q->where('cycle_id', $cycleId))
            ->get();

        if ($idMatches->count() > 0) {
            $riskLevel = 'high';
            $flags[] = "Duplicate National ID {$nationalId} found in active cycle (" . $idMatches->pluck('application_no')->implode(', ') . ")";
        }

        // 2. Check Admission No + Institution collision
        if ($admissionNo && $institutionId) {
            $admMatches = Application::where('admission_no', $admissionNo)
                ->where('institution_id', $institutionId)
                ->when($ignoreApplicationId, fn($q) => $q->where('id', '!=', $ignoreApplicationId))
                ->when($cycleId, fn($q) => $q->where('cycle_id', $cycleId))
                ->get();

            if ($admMatches->count() > 0) {
                $riskLevel = 'high';
                $flags[] = "Duplicate Admission No {$admissionNo} in same institution across applications (" . $admMatches->pluck('application_no')->implode(', ') . ")";
            }
        }

        // 3. Check Phone collision with differing National IDs
        if ($phone) {
            $phoneMatches = Application::where('phone', $phone)
                ->where('national_id', '!=', $nationalId)
                ->when($ignoreApplicationId, fn($q) => $q->where('id', '!=', $ignoreApplicationId))
                ->get();

            if ($phoneMatches->count() > 0) {
                if ($riskLevel !== 'high') $riskLevel = 'medium';
                $flags[] = "Phone number {$phone} used by multiple different applicants (" . $phoneMatches->pluck('full_name')->unique()->implode(', ') . ")";
            }
        }

        return [
            'duplicate_risk' => $riskLevel,
            'flags_count' => count($flags),
            'flag_reasons' => $flags,
            'summary' => count($flags) === 0 ? 'No duplicate risks detected across historical and current cycles.' : implode(' | ', $flags),
        ];
    }
}
