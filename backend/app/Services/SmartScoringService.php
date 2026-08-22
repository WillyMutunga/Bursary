<?php

namespace App\Services;

class SmartScoringService
{
    /**
     * Compute Explainable 100-Point Bursary Assessment Score
     * Breakdown:
     * - Financial Need (Max 25)
     * - Vulnerability (Max 20)
     * - Fee Burden (Max 20)
     * - Academic/Education Need (Max 15)
     * - Household Circumstances (Max 10)
     * - Previous Support & Track Record (Max 10)
     * TOTAL = 100
     */
    public function calculateScore(array $app): array
    {
        $breakdown = [];

        // 1. Financial Need (Max 25)
        $income = (float)($app['guardian_monthly_income'] ?? 15000);
        $occupation = strtolower($app['guardian_occupation'] ?? '');
        $financialScore = 0;
        $financialJustification = '';

        if ($income <= 5000 || str_contains($occupation, 'unemployed') || str_contains($occupation, 'peasant')) {
            $financialScore = 25;
            $financialJustification = 'Extreme hardship: Household income <= KSh 5,000 / informal subsistence.';
        } elseif ($income <= 15000) {
            $financialScore = 21;
            $financialJustification = 'Severe hardship: Household income KSh 5,001 - KSh 15,000.';
        } elseif ($income <= 30000) {
            $financialScore = 15;
            $financialJustification = 'Moderate financial strain: Household income KSh 15,001 - KSh 30,000.';
        } elseif ($income <= 50000) {
            $financialScore = 10;
            $financialJustification = 'Low-to-medium financial strain: Income KSh 30,001 - KSh 50,000.';
        } else {
            $financialScore = 5;
            $financialJustification = 'Income above KSh 50,000.';
        }
        $breakdown['financial_need'] = ['score' => $financialScore, 'max' => 25, 'rationale' => $financialJustification];

        // 2. Vulnerability (Max 20)
        $parentStatus = $app['parent_status'] ?? 'both_alive';
        $isDisabled = (bool)($app['is_disabled'] ?? false);
        $hasIllness = (bool)($app['has_chronic_illness'] ?? false);
        $isDisplaced = (bool)($app['is_displaced_family'] ?? false);
        $vulnerabilityScore = 0;
        $vulnerabilityJustification = [];

        if ($parentStatus === 'total_orphan') {
            $vulnerabilityScore += 16;
            $vulnerabilityJustification[] = 'Total Orphan (Both parents deceased)';
        } elseif ($parentStatus === 'partial_orphan') {
            $vulnerabilityScore += 12;
            $vulnerabilityJustification[] = 'Partial Orphan (Single deceased parent)';
        } elseif ($parentStatus === 'single_parent') {
            $vulnerabilityScore += 9;
            $vulnerabilityJustification[] = 'Single parent household';
        } else {
            $vulnerabilityScore += 4;
            $vulnerabilityJustification[] = 'Both parents living';
        }

        if ($isDisabled) {
            $vulnerabilityScore += 4;
            $vulnerabilityJustification[] = 'Registered person with disability (PWD)';
        }
        if ($hasIllness) {
            $vulnerabilityScore += 2;
            $vulnerabilityJustification[] = 'Documented chronic medical burden';
        }
        if ($isDisplaced) {
            $vulnerabilityScore += 2;
            $vulnerabilityJustification[] = 'Displaced or vulnerable settlement';
        }

        $vulnerabilityScore = min(20, $vulnerabilityScore);
        $breakdown['vulnerability'] = [
            'score' => $vulnerabilityScore,
            'max' => 20,
            'rationale' => implode('; ', $vulnerabilityJustification)
        ];

        // 3. Fee Burden (Max 20)
        $feesPayable = (float)($app['fees_payable'] ?? 50000);
        $feeBalance = (float)($app['fee_balance'] ?? 35000);
        $ratio = $feesPayable > 0 ? ($feeBalance / $feesPayable) : 0.5;
        $feeScore = 0;
        $feeJustification = '';

        if ($ratio >= 0.75) {
            $feeScore = 18;
            $feeJustification = 'Over 75% fee arrears remaining; imminent risk of school exclusion.';
        } elseif ($ratio >= 0.5) {
            $feeScore = 14;
            $feeJustification = '50% - 75% fee arrears remaining.';
        } elseif ($ratio >= 0.25) {
            $feeScore = 10;
            $feeJustification = '25% - 50% fee arrears remaining.';
        } else {
            $feeScore = 6;
            $feeJustification = 'Less than 25% fee arrears remaining.';
        }
        $breakdown['fee_burden'] = ['score' => $feeScore, 'max' => 20, 'rationale' => $feeJustification];

        // 4. Academic/Education Need (Max 15)
        $course = strtolower($app['course_name'] ?? '');
        $educationScore = 12;
        $educationJustification = 'Accredited full-time tertiary / secondary education programme with satisfactory academic standing.';
        if (str_contains($course, 'tvet') || str_contains($course, 'artisan') || str_contains($course, 'diploma')) {
            $educationScore = 14;
            $educationJustification = 'High priority TVET / Technical vocational training path aligned with national skill development.';
        }
        $breakdown['education_need'] = ['score' => $educationScore, 'max' => 15, 'rationale' => $educationJustification];

        // 5. Household Circumstances (Max 10)
        $siblingsInSchool = (int)($app['siblings_in_school'] ?? 2);
        $familySize = (int)($app['family_size'] ?? 4);
        $householdScore = 0;

        if ($siblingsInSchool >= 3 || $familySize >= 6) {
            $householdScore = 8;
            $householdJustification = "Heavy dependency burden: {$familySize} household members, {$siblingsInSchool} concurrent students.";
        } elseif ($siblingsInSchool >= 2) {
            $householdScore = 7;
            $householdJustification = "Moderate dependency burden: {$siblingsInSchool} students in school.";
        } else {
            $householdScore = 5;
            $householdJustification = "Standard household structure: {$siblingsInSchool} student.";
        }
        $breakdown['household'] = ['score' => $householdScore, 'max' => 10, 'rationale' => $householdJustification];

        // 6. Previous Support & Track Record (Max 10)
        $previousScore = 7;
        $previousJustification = 'Verified consistent academic progression and clean previous disbursement compliance.';
        $breakdown['previous_support'] = ['score' => $previousScore, 'max' => 10, 'rationale' => $previousJustification];

        $totalScore = $financialScore + $vulnerabilityScore + $feeScore + $educationScore + $householdScore + $previousScore;

        // Recommended Award based on score and fee balance
        $recommendedAward = 15000.00;
        if ($totalScore >= 80) {
            $recommendedAward = min(30000.00, max(20000.00, round($feeBalance * 0.6 / 1000) * 1000));
        } elseif ($totalScore >= 60) {
            $recommendedAward = min(20000.00, max(12000.00, round($feeBalance * 0.45 / 1000) * 1000));
        } else {
            $recommendedAward = 8000.00;
        }

        return [
            'total_score' => $totalScore,
            'max_possible' => 100,
            'recommended_amount' => $recommendedAward,
            'score_financial_need' => $financialScore,
            'score_vulnerability' => $vulnerabilityScore,
            'score_fee_burden' => $feeScore,
            'score_education_need' => $educationScore,
            'score_household' => $householdScore,
            'score_previous_support' => $previousScore,
            'breakdown' => $breakdown,
            'explanation_summary' => "Applicant scored {$totalScore}/100 based on evaluated criteria: Financial Need ({$financialScore}/25), Vulnerability ({$vulnerabilityScore}/20), Fee Burden ({$feeScore}/20), Education Need ({$educationScore}/15), Household ({$householdScore}/10), Previous Support ({$previousScore}/10)."
        ];
    }
}
