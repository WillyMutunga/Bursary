<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\BursaryCycle;
use App\Models\Document;
use App\Models\IdentityVerification;
use App\Models\Notification;
use App\Services\AuditLoggerService;
use App\Services\DuplicateDetectionService;
use App\Services\NationalIdVerificationService;
use App\Services\OcrDocumentService;
use App\Services\SmartScoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicantController extends Controller
{
    protected $idService;
    protected $ocrService;
    protected $dupService;
    protected $scoreService;

    public function __construct(
        NationalIdVerificationService $idService,
        OcrDocumentService $ocrService,
        DuplicateDetectionService $dupService,
        SmartScoringService $scoreService
    ) {
        $this->idService = $idService;
        $this->ocrService = $ocrService;
        $this->dupService = $dupService;
        $this->scoreService = $scoreService;
    }

    public function myApplications(Request $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : $request->query('user_id');
        $nationalId = $request->query('national_id') ?: ($user ? $user->national_id : null);

        $query = Application::with(['cycle', 'ward', 'institution', 'documents', 'identityVerifications']);

        if ($userId || $nationalId) {
            $query->where(function ($q) use ($userId, $nationalId) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if ($nationalId) {
                    $q->orWhere('national_id', $nationalId);
                }
            });
        }

        $applications = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function show($id)
    {
        $application = Application::with([
            'cycle', 'ward', 'institution', 'category',
            'documents', 'identityVerifications', 'fieldVerifications',
            'committeeDecisions', 'schoolConfirmations', 'payments'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    public function verifyNationalId(Request $request)
    {
        $request->validate([
            'national_id' => 'required|string',
            'full_name' => 'required|string',
        ]);

        $res = $this->idService->verify($request->national_id, $request->full_name);

        return response()->json([
            'success' => true,
            'data' => $res,
        ]);
    }

    public function submitWizard(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string',
            'national_id' => 'required|string',
            'gender' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'ward_id' => 'required|integer',
            'location' => 'nullable|string',
            'sub_location' => 'nullable|string',
            'village' => 'nullable|string',
            'institution_id' => 'nullable',
            'institution_name' => 'nullable|string',
            'admission_no' => 'required|string',
            'course_name' => 'required|string',
            'year_of_study' => 'nullable|string',
            'fees_payable' => 'required|numeric',
            'fees_paid' => 'required|numeric',
            'fee_balance' => 'required|numeric',
            'parent_status' => 'required|string',
            'guardian_name' => 'nullable|string',
            'guardian_id' => 'nullable|string',
            'guardian_phone' => 'nullable|string',
            'guardian_occupation' => 'nullable|string',
            'guardian_monthly_income' => 'nullable|numeric',
            'family_size' => 'nullable|integer',
            'siblings_in_school' => 'nullable|integer',
            'is_disabled' => 'nullable|boolean',
            'has_chronic_illness' => 'nullable|boolean',
            'special_circumstances' => 'nullable|string',
        ]);

        $instName = $request->input('institution_name') ?: $request->input('institution');
        if ($instName) {
            $inst = \App\Models\Institution::firstOrCreate(
                ['name' => trim($instName)],
                [
                    'code' => strtoupper(\Illuminate\Support\Str::slug($instName)),
                    'type' => 'tertiary',
                    'county' => 'Kenya',
                ]
            );
            $validated['institution_id'] = $inst->id;
        } else {
            $validated['institution_id'] = $request->input('institution_id') ?: 1;
        }
        unset($validated['institution_name']);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->input('user_id') ?: 1);

        $activeCycle = BursaryCycle::where('is_active', true)->first();
        $cycleId = $activeCycle ? $activeCycle->id : 1;

        // 1. Pluggable ID verification
        $idVerification = $this->idService->verify($validated['national_id'], $validated['full_name']);

        // 2. Duplicate Detection
        $duplicateCheck = $this->dupService->scan([
            'national_id' => $validated['national_id'],
            'phone' => $validated['phone'],
            'admission_no' => $validated['admission_no'],
            'institution_id' => $validated['institution_id'],
            'cycle_id' => $cycleId,
        ]);

        // 3. Smart 100-Point Scoring
        $scoring = $this->scoreService->calculateScore($validated);

        // Generate Application Number
        $appCount = Application::where('cycle_id', $cycleId)->count() + 1;
        $appNumber = 'CDF/BURS/2026/' . str_pad($appCount, 6, '0', STR_PAD_LEFT);

        $application = Application::create(array_merge($validated, [
            'user_id' => $userId,
            'cycle_id' => $cycleId,
            'application_no' => $appNumber,
            'stage' => 'under_verification',
            'id_verification_status' => $idVerification['status'],
            'duplicate_risk' => $duplicateCheck['duplicate_risk'],
            'duplicate_flag_reason' => $duplicateCheck['summary'],
            'score_financial_need' => $scoring['score_financial_need'],
            'score_vulnerability' => $scoring['score_vulnerability'],
            'score_fee_burden' => $scoring['score_fee_burden'],
            'score_education_need' => $scoring['score_education_need'],
            'score_household' => $scoring['score_household'],
            'score_previous_support' => $scoring['score_previous_support'],
            'total_score' => $scoring['total_score'],
            'recommended_amount' => $scoring['recommended_amount'],
            'ocr_match_percentage' => 95,
            'submitted_at' => now(),
        ]));

        // Log ID Verification Record
        IdentityVerification::create([
            'application_id' => $application->id,
            'national_id' => $validated['national_id'],
            'queried_name' => $validated['full_name'],
            'verified_name' => $idVerification['verified_name'],
            'status' => $idVerification['status'],
            'name_match' => $idVerification['name_match'],
            'id_match' => $idVerification['id_match'],
            'provider_name' => $idVerification['provider_name'],
            'provider_reference' => $idVerification['provider_reference'],
            'response_metadata' => $idVerification,
            'verified_at' => now(),
        ]);

        // Create standard supporting documents with simulated OCR extraction
        $docs = [
            ['type' => 'id_card', 'title' => 'Applicant National ID / Birth Certificate'],
            ['type' => 'fee_structure', 'title' => 'Current Fee Structure & Fee Balance Statement'],
            ['type' => 'admission_letter', 'title' => 'Official Institution Admission Letter'],
        ];

        foreach ($docs as $d) {
            $ocrResult = $this->ocrService->extractAndCompare($validated, $d['type'], $d['title']);

            Document::create([
                'application_id' => $application->id,
                'document_type' => $d['type'],
                'title' => $d['title'],
                'file_name' => Str::slug($application->full_name . '-' . $d['type']) . '.pdf',
                'file_path' => 'documents/2026/' . $application->application_no . '/' . $d['type'] . '.pdf',
                'file_size_kb' => rand(180, 420),
                'ocr_status' => $ocrResult['ocr_status'],
                'ocr_extracted_data' => $ocrResult['extracted_data'],
                'ocr_match_score' => $ocrResult['match_score'],
                'verification_status' => 'verified',
            ]);
        }

        // Create Applicant notification
        Notification::create([
            'user_id' => $userId,
            'application_id' => $application->id,
            'title' => 'Application Successfully Submitted',
            'message' => "Your bursary application {$application->application_no} has been received and is now undergoing automated verification.",
            'type' => 'status_change',
        ]);

        AuditLoggerService::log(
            action: 'APPLICATION_SUBMITTED',
            module: 'Applications',
            recordId: (string)$application->id,
            newValues: ['application_no' => $application->application_no, 'score' => $scoring['total_score']],
            userId: $userId,
            userName: $validated['full_name'],
            userRole: 'applicant'
        );

        return response()->json([
            'success' => true,
            'message' => 'Bursary application submitted successfully.',
            'data' => $application->load(['cycle', 'ward', 'institution', 'documents', 'identityVerifications']),
            'scoring_breakdown' => $scoring,
        ], 201);
    }

    public function notifications(Request $request)
    {
        $userId = $request->user() ? $request->user()->id : $request->query('user_id', 1);

        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }
}
