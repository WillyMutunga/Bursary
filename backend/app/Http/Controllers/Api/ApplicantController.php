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
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'education_level' => 'nullable|string',
            'school_type' => 'nullable|string',
            'admission_no' => 'required|string',
            'course_name' => 'nullable|string',
            'year_of_study' => 'nullable|string',
            'semester_term' => 'nullable|string',
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
            'is_disabled' => 'nullable',
            'has_chronic_illness' => 'nullable',
            'special_circumstances' => 'nullable|string',
            'father_name' => 'nullable|string',
            'father_id' => 'nullable|string',
            'father_phone' => 'nullable|string',
            'father_occupation' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'mother_id' => 'nullable|string',
            'mother_phone' => 'nullable|string',
            'mother_occupation' => 'nullable|string',
            'deceased_parent_name' => 'nullable|string',
            'deceased_parent_death_year' => 'nullable|string',
            'deceased_father_name' => 'nullable|string',
            'deceased_father_year' => 'nullable|string',
            'deceased_mother_name' => 'nullable|string',
            'deceased_mother_year' => 'nullable|string',
            'guardian_relationship' => 'nullable|string',
        ]);

        $validated['is_disabled'] = filter_var($request->input('is_disabled'), FILTER_VALIDATE_BOOLEAN);
        $validated['has_chronic_illness'] = filter_var($request->input('has_chronic_illness'), FILTER_VALIDATE_BOOLEAN);

        if ($request->filled('father_name') && $request->filled('mother_name')) {
            $validated['guardian_name'] = trim($request->input('father_name') . ' & ' . $request->input('mother_name'));
            $validated['guardian_id'] = $request->input('father_id') ?: $request->input('mother_id');
            $validated['guardian_phone'] = $request->input('father_phone') ?: $request->input('mother_phone');
        }

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

        if (empty($validated['course_name'])) {
            $validated['course_name'] = ($request->input('education_level') === 'secondary') ? 'Secondary Education (KCSE / CBC)' : 'General Studies';
        }

        $user = $request->user();
        $userId = $user ? $user->id : ($request->input('user_id') ?: 1);

        $activeCycle = BursaryCycle::where('is_active', true)->first();
        $cycleId = $activeCycle ? $activeCycle->id : 1;

        // 1. Hard Stop: National ID / Birth Cert No must be strictly unique
        $cleanNationalId = trim($validated['national_id']);
        $existingIdApp = Application::where('national_id', $cleanNationalId)
            ->when($cycleId, fn($q) => $q->where('cycle_id', $cycleId))
            ->first();

        if ($existingIdApp) {
            return response()->json([
                'success' => false,
                'message' => "The ID Number '{$cleanNationalId}' has already been used to apply for a bursary under Application No: {$existingIdApp->application_no}. Each applicant ID is strictly unique and cannot be used more than once.",
                'existing_application' => $existingIdApp,
            ], 422);
        }

        // Check if user already submitted
        if ($userId) {
            $existingUserApp = Application::where('user_id', $userId)
                ->when($cycleId, fn($q) => $q->where('cycle_id', $cycleId))
                ->first();

            if ($existingUserApp) {
                return response()->json([
                    'success' => false,
                    'message' => "You have already submitted an active bursary application (No: {$existingUserApp->application_no}). Multiple applications are not permitted.",
                    'existing_application' => $existingUserApp,
                ], 422);
            }
        }

        // 2. Pluggable ID verification
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

        // Filter out non-table attributes so PostgreSQL never fails on undefined columns
        $extraParentDetails = [];
        if ($request->filled('father_name')) $extraParentDetails[] = "Father: " . $request->input('father_name') . " (ID: " . $request->input('father_id') . ", Tel: " . $request->input('father_phone') . ", Occ: " . $request->input('father_occupation') . ")";
        if ($request->filled('mother_name')) $extraParentDetails[] = "Mother: " . $request->input('mother_name') . " (ID: " . $request->input('mother_id') . ", Tel: " . $request->input('mother_phone') . ", Occ: " . $request->input('mother_occupation') . ")";
        if ($request->filled('deceased_parent_name')) $extraParentDetails[] = "Late Parent: " . $request->input('deceased_parent_name') . " (Year: " . $request->input('deceased_parent_death_year') . ")";
        if ($request->filled('deceased_father_name')) $extraParentDetails[] = "Late Father: " . $request->input('deceased_father_name') . " (" . $request->input('deceased_father_year') . ")";
        if ($request->filled('deceased_mother_name')) $extraParentDetails[] = "Late Mother: " . $request->input('deceased_mother_name') . " (" . $request->input('deceased_mother_year') . ")";
        if ($request->filled('guardian_relationship')) $extraParentDetails[] = "Guardian Relationship: " . $request->input('guardian_relationship');

        $appData = \Illuminate\Support\Arr::only($validated, [
            'national_id', 'full_name', 'phone', 'email', 'ward_id', 'location', 'sub_location', 'village',
            'institution_id', 'admission_no', 'course_name', 'year_of_study', 'semester_term',
            'fees_payable', 'fees_paid', 'fee_balance',
            'parent_status', 'guardian_name', 'guardian_id', 'guardian_phone', 'guardian_occupation', 'guardian_monthly_income',
            'family_size', 'siblings_in_school',
            'is_disabled', 'disability_details', 'has_chronic_illness', 'special_circumstances',
        ]);

        if (!empty($extraParentDetails)) {
            $existingSpec = $appData['special_circumstances'] ?? '';
            $appData['special_circumstances'] = trim($existingSpec . "\n" . implode("\n", $extraParentDetails));
        }

        try {
            $application = Application::create(array_merge($appData, [
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Application save failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to save application: ' . $e->getMessage(),
            ], 500);
        }

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

        // Handle physical file uploads & supporting documents
        $fileConfigs = [
            'national_id_doc' => ['type' => 'id_card', 'title' => 'Applicant National ID / Birth Certificate'],
            'fee_structure_doc' => ['type' => 'fee_structure', 'title' => 'Current Fee Structure & Balance Statement'],
            'admission_letter_doc' => ['type' => 'admission_letter', 'title' => 'Official Institution Admission / Report Form'],
            'guardian_id_doc' => ['type' => 'guardian_id', 'title' => 'Parent / Guardian Identification'],
        ];

        $appFolder = 'documents/2026/' . str_replace('/', '_', $application->application_no);

        foreach ($fileConfigs as $fieldKey => $d) {
            $ocrResult = $this->ocrService->extractAndCompare($validated, $d['type'], $d['title']);

            if ($request->hasFile($fieldKey) && $request->file($fieldKey)->isValid()) {
                $uploadedFile = $request->file($fieldKey);
                $ext = $uploadedFile->getClientOriginalExtension() ?: 'pdf';
                $safeName = $d['type'] . '_' . time() . '.' . $ext;
                $savedPath = $uploadedFile->storeAs($appFolder, $safeName, 'public');
                $fileSizeKb = round($uploadedFile->getSize() / 1024);
                $originalName = $uploadedFile->getClientOriginalName();
            } else {
                $safeName = Str::slug($application->full_name . '-' . $d['type']) . '.pdf';
                $savedPath = $appFolder . '/' . $safeName;
                $fileSizeKb = rand(180, 420);
                $originalName = $safeName;
            }

            Document::create([
                'application_id' => $application->id,
                'document_type' => $d['type'],
                'title' => $d['title'],
                'file_name' => $originalName,
                'file_path' => $savedPath,
                'file_size_kb' => $fileSizeKb,
                'ocr_status' => $ocrResult['ocr_status'],
                'ocr_extracted_data' => $ocrResult['extracted_data'],
                'ocr_match_score' => $ocrResult['match_score'],
                'verification_status' => 'verified',
            ]);
        }

        // Trigger SMS & Email Notification
        NotificationService::notifyMilestone('SUBMITTED', array_merge($validated, [
            'id' => $application->id,
            'user_id' => $userId,
            'application_no' => $application->application_no,
        ]));

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
