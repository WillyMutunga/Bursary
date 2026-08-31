<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\AuditLog;
use App\Models\BursaryCategory;
use App\Models\BursaryCycle;
use App\Models\CommitteeDecision;
use App\Models\Document;
use App\Models\FieldVerification;
use App\Models\IdentityVerification;
use App\Models\Institution;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\PaymentBatch;
use App\Models\SchoolConfirmation;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Ward;
use App\Services\AwardLetterService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Single Super Admin User (Willy / William#20)
        // All staff roles (Verification, Committee, Finance, School) are created by Super Admin via User Management.
        // Citizen applicants register themselves via Public Registration.
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@ngcdf.go.ke'],
            [
                'name' => 'Willy',
                'email' => 'admin@ngcdf.go.ke',
                'phone' => '+254 700 000 000',
                'role' => 'admin',
                'national_id' => '41354126',
                'password' => Hash::make('William#20'),
                'designation' => 'Constituency Fund Manager / Super Admin',
                'is_active' => true,
            ]
        );

        // 2. Wards (Kibwezi West Constituency)
        $wards = [
            ['name' => 'Emali / Mulala Ward', 'code' => 'KBW-01', 'population' => 45000, 'budget_allocation' => 5500000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Francis Musyoka'],
            ['name' => 'Nguu / Masumba Ward', 'code' => 'KBW-02', 'population' => 38000, 'budget_allocation' => 5000000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Daniel Kimanzi'],
            ['name' => 'Nguumo Ward', 'code' => 'KBW-03', 'population' => 42000, 'budget_allocation' => 5200000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Geoffrey Musyoki'],
            ['name' => 'Makindu Ward', 'code' => 'KBW-04', 'population' => 52000, 'budget_allocation' => 6000000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Jackson Muthama'],
            ['name' => 'Kikumbulyu North Ward', 'code' => 'KBW-05', 'population' => 36000, 'budget_allocation' => 4800000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Onesmus Mutinda'],
            ['name' => 'Kikumbulyu South Ward', 'code' => 'KBW-06', 'population' => 39000, 'budget_allocation' => 5000000.00, 'sub_county' => 'Kibwezi West', 'representative_name' => 'Hon. Peter Mwololo'],
        ];
        foreach ($wards as $w) {
            Ward::create($w);
        }

        // 3. Institutions
        $institutions = [
            ['name' => 'University of Nairobi (UoN)', 'code' => 'UON-001', 'type' => 'university', 'county' => 'Nairobi', 'contact_email' => 'bursaries@uonbi.ac.ke', 'bank_name' => 'KCB Bank', 'bank_account_no' => '1100234567', 'bank_branch' => 'University Way'],
            ['name' => 'Kenyatta University (KU)', 'code' => 'KU-002', 'type' => 'university', 'county' => 'Nairobi', 'contact_email' => 'accounts@ku.ac.ke', 'bank_name' => 'National Bank', 'bank_account_no' => '0100345678', 'bank_branch' => 'KU Campus'],
            ['name' => 'Kabete National Polytechnic', 'code' => 'KABETE-003', 'type' => 'tvet', 'county' => 'Nairobi', 'contact_email' => 'info@kabetepoly.ac.ke', 'bank_name' => 'Equity Bank', 'bank_account_no' => '0550123456', 'bank_branch' => 'Westlands'],
            ['name' => 'Nairobi Technical Training Institute', 'code' => 'NTTI-004', 'type' => 'tvet', 'county' => 'Nairobi', 'contact_email' => 'finance@ntti.ac.ke', 'bank_name' => 'Co-operative Bank', 'bank_account_no' => '0112987654', 'bank_branch' => 'Ngara'],
            ['name' => 'Dagoretti High School', 'code' => 'DAG-005', 'type' => 'secondary', 'county' => 'Nairobi', 'contact_email' => 'dagorettihigh@gmail.com', 'bank_name' => 'KCB Bank', 'bank_account_no' => '1122334455', 'bank_branch' => 'Kawangware'],
            ['name' => 'Kenya Medical Training College (KMTC Nairobi)', 'code' => 'KMTC-006', 'type' => 'tvet', 'county' => 'Nairobi', 'contact_email' => 'fees@kmtc.ac.ke', 'bank_name' => 'National Bank', 'bank_account_no' => '0100998877', 'bank_branch' => 'Hospital Branch'],
            ['name' => 'Strathmore University', 'code' => 'STRATH-007', 'type' => 'university', 'county' => 'Nairobi', 'contact_email' => 'finance@strathmore.edu', 'bank_name' => 'Standard Chartered', 'bank_account_no' => '0102030405', 'bank_branch' => 'Madaraka'],
            ['name' => 'St. Francis Special Needs School', 'code' => 'STF-008', 'type' => 'special_needs', 'county' => 'Nairobi', 'contact_email' => 'stfrancis@special.ac.ke', 'bank_name' => 'Co-operative Bank', 'bank_account_no' => '0110332211', 'bank_branch' => 'Westlands'],
        ];
        foreach ($institutions as $inst) {
            Institution::create($inst);
        }

        // 4. Bursary Cycle
        $cycle = BursaryCycle::create([
            'title' => '2026/2027 Financial Year (Cycle 1)',
            'academic_year' => '2026/2027',
            'total_budget' => 30000000.00,
            'allocated_amount' => 24500000.00,
            'disbursed_amount' => 18700000.00,
            'start_date' => '2026-06-01',
            'end_date' => '2026-09-30',
            'is_active' => true,
            'status' => 'committee_review',
            'description' => 'Annual Constituency Bursary allocation for Secondary, TVET, and University students within the constituency.',
        ]);

        // 5. Categories
        $categories = [
            ['name' => 'Total & Partial Orphans / Vulnerable Children', 'max_award' => 35000.00, 'description' => 'Maximum support for students without living parents or in extreme distress.'],
            ['name' => 'University & Higher Education', 'max_award' => 30000.00, 'description' => 'Undergraduate degree students in accredited public and private universities.'],
            ['name' => 'TVET & Technical Colleges', 'max_award' => 25000.00, 'description' => 'Diploma and certificate vocational trainees in registered institutions.'],
            ['name' => 'Secondary / High School Support', 'max_award' => 20000.00, 'description' => 'Boarding and day secondary school students with fee distress.'],
            ['name' => 'Persons With Disability (PWD)', 'max_award' => 35000.00, 'description' => 'Dedicated affirmative allocation for learners with special needs.'],
        ];
        foreach ($categories as $cat) {
            BursaryCategory::create($cat);
        }

        $awardService = new AwardLetterService();

        // 6. Benchmark Application 1: John Kamau (CDF/BURS/2026/000245) - 82/100 Score
        $app1 = Application::create([
            'application_no' => 'CDF/BURS/2026/000245',
            'user_id' => $applicant->id,
            'cycle_id' => $cycle->id,
            'category_id' => 2, // University
            'ward_id' => 1, // Parklands
            'institution_id' => 1, // UoN
            'stage' => 'committee_review',
            'full_name' => 'John Kamau',
            'national_id' => '38492011',
            'date_of_birth' => '2003-05-14',
            'gender' => 'male',
            'phone' => '+254 712 345 678',
            'email' => 'applicant@ngcdf.go.ke',
            'location' => 'Parklands',
            'sub_location' => 'Highridge',
            'village' => 'Deep Sea Settlement',
            'physical_address' => 'Plot 45, Deep Sea Village, Parklands',
            'admission_no' => 'F16/14290/2023',
            'course_name' => 'BSc. Electrical & Electronic Engineering',
            'year_of_study' => 'Year 3',
            'semester_term' => 'Semester 1',
            'fees_payable' => 78000.00,
            'fees_paid' => 28000.00,
            'fee_balance' => 50000.00,
            'previous_term_gpa' => '3.62 / 4.00 (First Class Honors Pace)',
            'parent_status' => 'partial_orphan',
            'guardian_name' => 'Grace Wambui Kamau',
            'guardian_id' => '14283940',
            'guardian_phone' => '+254 722 111 222',
            'guardian_occupation' => 'Vegetable Vendor (Informal Trader)',
            'guardian_monthly_income' => 9500.00,
            'family_size' => 5,
            'siblings_in_school' => 3,
            'is_disabled' => false,
            'has_chronic_illness' => false,
            'special_circumstances' => 'Father passed away in 2021. Mother is the sole breadwinner running a roadside vegetable stall.',
            // The exact explainable score from prompt: 82/100
            'score_financial_need' => 21,
            'score_vulnerability' => 17,
            'score_fee_burden' => 18,
            'score_education_need' => 12,
            'score_household' => 7,
            'score_previous_support' => 7,
            'total_score' => 82,
            'duplicate_risk' => 'low',
            'duplicate_flag_reason' => 'No duplicate flags detected across active or prior cycles.',
            'id_verification_status' => 'VERIFIED',
            'ocr_match_percentage' => 98,
            'recommended_amount' => 20000.00,
            'approved_amount' => 0.00,
            'submitted_at' => now()->subDays(5),
        ]);

        IdentityVerification::create([
            'application_id' => $app1->id,
            'national_id' => '38492011',
            'queried_name' => 'JOHN KAMAU',
            'verified_name' => 'JOHN KAMAU',
            'status' => 'VERIFIED',
            'name_match' => true,
            'id_match' => true,
            'provider_name' => 'IPRS_SECURE_GATEWAY_V2',
            'provider_reference' => 'IPRS-TXN-99882144',
            'response_metadata' => ['dob' => '2003-05-14', 'gender' => 'M', 'citizenship' => 'KENYAN'],
            'verified_at' => now()->subDays(5),
        ]);

        Document::create([
            'application_id' => $app1->id,
            'document_type' => 'id_card',
            'title' => 'National ID Card (Front & Back)',
            'file_name' => 'john-kamau-id.pdf',
            'file_path' => 'documents/2026/CDF-BURS-2026-000245/id_card.pdf',
            'file_size_kb' => 310,
            'ocr_status' => 'processed',
            'ocr_extracted_data' => [
                'extracted_name' => 'JOHN KAMAU',
                'extracted_id' => '38492011',
                'dob' => '14.05.2003',
                'signature_detected' => true,
                'republic_of_kenya_seal' => true,
            ],
            'ocr_match_score' => 100,
            'verification_status' => 'verified',
            'officer_notes' => 'Clear photo and authentic government seal verified.',
        ]);

        Document::create([
            'application_id' => $app1->id,
            'document_type' => 'fee_structure',
            'title' => 'UoN Official Fee Statement & Arrears',
            'file_name' => 'john-kamau-fee-statement.pdf',
            'file_path' => 'documents/2026/CDF-BURS-2026-000245/fee_statement.pdf',
            'file_size_kb' => 280,
            'ocr_status' => 'processed',
            'ocr_extracted_data' => [
                'extracted_name' => 'JOHN KAMAU',
                'extracted_admission_no' => 'F16/14290/2023',
                'extracted_institution' => 'University of Nairobi',
                'extracted_fee_balance' => 50000.00,
                'official_stamp_detected' => true,
            ],
            'ocr_match_score' => 96,
            'verification_status' => 'verified',
            'officer_notes' => 'Fee balance confirmed by Finance office: KSh 50,000.',
        ]);

        FieldVerification::create([
            'application_id' => $app1->id,
            'officer_id' => $officer->id,
            'visit_date' => now()->subDays(2),
            'applicant_visited' => true,
            'guardian_interviewed' => true,
            'household_verified' => true,
            'location_visited' => 'Deep Sea Informal Settlement, Parklands',
            'gps_coordinates' => '-1.2642, 36.8115',
            'findings' => 'Visited the household. Mother Grace Kamau interviewed. Single room timber structure. 3 siblings enrolled in local public schools. High genuine need.',
            'recommendation' => 'VERIFIED',
        ]);

        Notification::create([
            'user_id' => $applicant->id,
            'application_id' => $app1->id,
            'title' => 'Verification Complete',
            'message' => 'Your documents and field visit have been successfully verified. Your application has been submitted to the NG-CDF Committee for award consideration.',
            'type' => 'status_change',
        ]);

        // 7. Benchmark Application 2: Jane Wanjiku (CDF/BURS/2026/000246) - Approved & Awarded
        $app2 = Application::create([
            'application_no' => 'CDF/BURS/2026/000246',
            'user_id' => $applicant->id,
            'cycle_id' => $cycle->id,
            'category_id' => 1, // Total orphan
            'ward_id' => 2, // Karura
            'institution_id' => 2, // Kenyatta University
            'stage' => 'approved',
            'full_name' => 'Jane Wanjiku',
            'national_id' => '39201844',
            'gender' => 'female',
            'phone' => '+254 723 998 877',
            'admission_no' => 'KU/MED/2024/098',
            'course_name' => 'Bachelor of Pharmacy',
            'year_of_study' => 'Year 2',
            'fees_payable' => 90000.00,
            'fees_paid' => 30000.00,
            'fee_balance' => 60000.00,
            'parent_status' => 'total_orphan',
            'guardian_name' => 'Eunice Njoki (Aunt)',
            'guardian_occupation' => 'Casual Farmhand',
            'guardian_monthly_income' => 6000.00,
            'family_size' => 4,
            'siblings_in_school' => 2,
            'score_financial_need' => 25,
            'score_vulnerability' => 20,
            'score_fee_burden' => 18,
            'score_education_need' => 14,
            'score_household' => 8,
            'score_previous_support' => 7,
            'total_score' => 92,
            'duplicate_risk' => 'low',
            'id_verification_status' => 'VERIFIED',
            'recommended_amount' => 25000.00,
            'approved_amount' => 30000.00,
            'decision_date' => now()->subDays(3),
            'decision_reason' => 'Exceptional vulnerability (Total Orphan) studying professional pharmacy programme.',
            'decision_by_user_id' => $committee->id,
            'submitted_at' => now()->subDays(10),
        ]);

        CommitteeDecision::create([
            'application_id' => $app2->id,
            'committee_user_id' => $committee->id,
            'recommended_amount' => 25000.00,
            'approved_amount' => 30000.00,
            'amount_modified' => true,
            'modification_reason' => 'Upgraded from KSh 25,000 to KSh 30,000 due to total orphan status and high medical laboratory levies.',
            'decision' => 'APPROVE',
            'notes' => 'Approved unanimously by NG-CDF Committee on 17 August 2026.',
        ]);

        $awardService->generateAwardLetterPayload($app2);

        // 8. Benchmark Application 3: Peter Mutua (CDF/BURS/2026/000247) - Flagged High Duplicate Risk
        $app3 = Application::create([
            'application_no' => 'CDF/BURS/2026/000247',
            'user_id' => $applicant->id,
            'cycle_id' => $cycle->id,
            'category_id' => 3,
            'ward_id' => 3, // Kangemi
            'institution_id' => 3, // Kabete Poly
            'stage' => 'under_verification',
            'full_name' => 'Peter Mutua',
            'national_id' => '39201844', // Intentionally colliding ID
            'gender' => 'male',
            'phone' => '+254 723 998 877', // Intentionally colliding Phone
            'admission_no' => 'KAB/DIP/2024/552',
            'course_name' => 'Diploma in Mechanical Engineering',
            'fees_payable' => 45000.00,
            'fee_balance' => 28000.00,
            'parent_status' => 'both_alive',
            'guardian_name' => 'James Mutua',
            'guardian_monthly_income' => 25000.00,
            'score_financial_need' => 15,
            'score_vulnerability' => 6,
            'score_fee_burden' => 14,
            'score_education_need' => 14,
            'score_household' => 7,
            'score_previous_support' => 8,
            'total_score' => 64,
            'duplicate_risk' => 'high',
            'duplicate_flag_reason' => 'HIGH RISK: Duplicate National ID 39201844 and Phone collision matched against Application CDF/BURS/2026/000246.',
            'id_verification_status' => 'MANUAL_REVIEW',
            'recommended_amount' => 12000.00,
            'submitted_at' => now()->subDays(1),
        ]);

        // 9. Benchmark Application 4: Faith Chebet (CDF/BURS/2026/000248) - Paid & Disbursed
        $app4 = Application::create([
            'application_no' => 'CDF/BURS/2026/000248',
            'user_id' => $applicant->id,
            'cycle_id' => $cycle->id,
            'category_id' => 3,
            'ward_id' => 4, // Mountain View
            'institution_id' => 4, // NTTI
            'stage' => 'paid',
            'full_name' => 'Faith Chebet',
            'national_id' => '36712099',
            'gender' => 'female',
            'phone' => '+254 740 556 677',
            'admission_no' => 'NTTI/ICT/2023/110',
            'course_name' => 'Diploma in ICT & Software Development',
            'fees_payable' => 42000.00,
            'fee_balance' => 22000.00,
            'parent_status' => 'single_parent',
            'guardian_name' => 'Rose Chebet',
            'guardian_monthly_income' => 11000.00,
            'score_financial_need' => 21,
            'score_vulnerability' => 12,
            'score_fee_burden' => 14,
            'score_education_need' => 14,
            'score_household' => 7,
            'score_previous_support' => 10,
            'total_score' => 78,
            'duplicate_risk' => 'low',
            'id_verification_status' => 'VERIFIED',
            'recommended_amount' => 18000.00,
            'approved_amount' => 18000.00,
            'disbursed_amount' => 18000.00,
            'decision_date' => now()->subDays(8),
            'submitted_at' => now()->subDays(15),
        ]);
        $awardService->generateAwardLetterPayload($app4);

        $batch = PaymentBatch::create([
            'cycle_id' => $cycle->id,
            'batch_no' => 'BATCH-2026-AUG-001',
            'total_amount' => 18700000.00,
            'beneficiary_count' => 840,
            'payment_method' => 'EFT',
            'status' => 'disbursed',
            'created_by_user_id' => $finance->id,
            'approved_by_user_id' => $admin->id,
            'disbursed_at' => now()->subDays(2),
        ]);

        Payment::create([
            'payment_batch_id' => $batch->id,
            'application_id' => $app4->id,
            'institution_id' => $app4->institution_id,
            'amount' => 18000.00,
            'cheque_eft_number' => 'EFT-88492019',
            'status' => 'cleared',
            'payment_date' => now()->subDays(2)->toDateString(),
        ]);

        SchoolConfirmation::create([
            'application_id' => $app4->id,
            'institution_id' => $app4->institution_id,
            'verified_by_user_id' => $school->id,
            'is_enrolled' => true,
            'confirmed_admission_no' => 'NTTI/ICT/2023/110',
            'confirmed_fee_balance' => 4000.00,
            'comments' => 'Bursary payment credited. Fee balance reduced from KSh 22,000 to KSh 4,000.',
            'confirmed_at' => now()->subDay(),
        ]);

        // 10. Audit Logs
        AuditLog::create([
            'user_id' => $committee->id,
            'user_name' => 'Hon. Grace Njeri (Committee Member 004)',
            'user_role' => 'committee_member',
            'action' => 'APPLICATION_APPROVED',
            'module' => 'Committee Review',
            'record_id' => (string)$app2->id,
            'old_values' => ['recommended' => 25000, 'stage' => 'committee_review'],
            'new_values' => ['approved' => 30000, 'decision' => 'APPROVE', 'reason' => 'Total orphan medical bursary uplift'],
            'ip_address' => '102.68.24.11',
            'created_at' => now()->subDays(3),
        ]);

        AuditLog::create([
            'user_id' => $finance->id,
            'user_name' => 'David Ochieng (Finance Officer)',
            'user_role' => 'finance_officer',
            'action' => 'PAYMENT_BATCH_DISBURSED',
            'module' => 'Finance & Disbursement',
            'record_id' => (string)$batch->id,
            'new_values' => ['batch_no' => 'BATCH-2026-AUG-001', 'total_amount' => 18700000],
            'ip_address' => '102.68.24.15',
            'created_at' => now()->subDays(2),
        ]);

        // 11. System Settings
        SystemSetting::create(['key' => 'portal_status', 'value' => 'active', 'group' => 'general', 'description' => 'Public Bursary Portal Status']);
        SystemSetting::create(['key' => 'max_single_award', 'value' => '35000', 'group' => 'financial', 'description' => 'Maximum allowable individual bursary cap']);
        SystemSetting::create(['key' => 'sms_gateway_active', 'value' => 'true', 'group' => 'notifications', 'description' => 'Real-time SMS gateway connectivity']);
    }
}
